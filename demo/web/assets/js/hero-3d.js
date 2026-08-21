/* ============================================================
   hero-3d.js —— Hero 背景真 3D 节点连接粒子网络 (Three.js 经典脚本)
   主题呼应：手机连电脑 · 连接/网络/远程
   - 铺满整个 Hero 背景区的节点连接多边形粒子网络
   - 近邻自动连线 + 鼠标/触摸交互（推开附近节点并高亮放大）
   性能保护：像素比上限 1.75、离屏暂停、resize 节流、
             预分配连线数组、setDrawRange 控制渲染量、Basic 材质
   依赖：js/vendor/three.global.js (挂载 window.THREE)
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-3d');
  if (!canvas || typeof THREE === 'undefined') { return; }

  /* ---------- 渲染器 / 场景 / 相机 ---------- */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,            /* 透明背景，叠加在星空/网格之上 */
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 16);

  /* ---------- 主题色 ---------- */
  var COL_VIOLET = new THREE.Color(0x818cf8);
  var COL_CYAN   = new THREE.Color(0x22d3ee);
  var COL_WHITE  = new THREE.Color(0xffffff);

  /* ============================================================
     节点连接 3D 多边形粒子网络（铺满整个 Hero 背景）
     盒状分布覆盖全屏，近邻自动连线，呼应"连接/网络/远程"主题
     ============================================================ */
  var netNodeCount = 130;
  var netBoxX = 14.5;         /* X 分布半宽（铺满屏幕宽度） */
  var netBoxY = 8.5;          /* Y 分布半高（铺满屏幕高度） */
  var netBoxZ = 6;            /* Z 分布深度 */
  var netNodes = [];          /* 节点 Mesh 数组 */
  var netConnectDist = 2.6;   /* 连接距离阈值 */

  var netNodeGeo = new THREE.SphereGeometry(0.07, 6, 6);
  var netNodeMatV = new THREE.MeshBasicMaterial({ color: COL_VIOLET, transparent: true, opacity: 0.8 });
  var netNodeMatC = new THREE.MeshBasicMaterial({ color: COL_CYAN, transparent: true, opacity: 0.8 });
  var netNodeMatW = new THREE.MeshBasicMaterial({ color: COL_WHITE, transparent: true, opacity: 0.65 });
  var netMats = [netNodeMatV, netNodeMatC, netNodeMatW];
  for (var nn = 0; nn < netNodeCount; nn++) {
    var nxp = (Math.random() - 0.5) * netBoxX * 2;
    var nyp = (Math.random() - 0.5) * netBoxY * 2;
    var nzp = (Math.random() - 0.5) * netBoxZ * 2;
    var nMat = netMats[nn % 3];
    var nMesh = new THREE.Mesh(netNodeGeo, nMat);
    nMesh.position.set(nxp, nyp, nzp);
    nMesh.userData = {
      base: new THREE.Vector3(nxp, nyp, nzp),
      driftPhase: Math.random() * Math.PI * 2,
      driftAmp: 0.2 + Math.random() * 0.3,
      driftSpeed: 0.15 + Math.random() * 0.25,
      highlight: 0
    };
    scene.add(nMesh);
    netNodes.push(nMesh);
  }

  /* 连线：预分配上限数组，每帧基于距离阈值更新 */
  var netLinePositions = new Float32Array(netNodeCount * netNodeCount * 3 * 2);
  var netLineGeo = new THREE.BufferGeometry();
  netLineGeo.setAttribute('position', new THREE.BufferAttribute(netLinePositions, 3));
  var netLineMat = new THREE.LineBasicMaterial({
    color: COL_VIOLET,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  var netLines = new THREE.LineSegments(netLineGeo, netLineMat);

  /* 整体网络组容器（统一旋转） */
  var netGroup = new THREE.Group();
  netNodes.forEach(function (n) { scene.remove(n); netGroup.add(n); });
  netGroup.add(netLines);
  scene.add(netGroup);

  /* ============================================================
     交互连线：鼠标/光标附近节点相互连接（点击/移动后形成连接网）
     - 独立 LineSegments，更亮的高对比色，与自动连线区分
     - 半径内节点两两相连 + 连向光标中心，形成"以光标为枢纽"的网
     ============================================================ */
  var linkLineMax = netNodeCount * 16;          /* 交互连线段上限（足够覆盖附近节点两两连接） */
  var linkLinePositions = new Float32Array(linkLineMax * 3 * 2);
  var linkLineColors = new Float32Array(linkLineMax * 3 * 2);
  var linkLineGeo = new THREE.BufferGeometry();
  linkLineGeo.setAttribute('position', new THREE.BufferAttribute(linkLinePositions, 3));
  linkLineGeo.setAttribute('color', new THREE.BufferAttribute(linkLineColors, 3));
  var linkLineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  var linkLines = new THREE.LineSegments(linkLineGeo, linkLineMat);
  netGroup.add(linkLines);
  var linkNodes = [];          /* 当前在交互半径内的节点（每帧重算） */
  var linkConnectDist = 5.0;   /* 交互连接半径（略大于排斥半径，连接范围更广） */

  /* ============================================================
     交互：鼠标/触摸 → 3D 空间点 → 推开附近网络节点
     ============================================================ */
  var raycaster = new THREE.Raycaster();
  var mouseNDC = new THREE.Vector2(2, 2);
  var mouseWorld = new THREE.Vector3(0, 0, 0);
  var mouseActive = false;
  var interactPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  var interactRadius = 4.5;
  var interactForce = 4.0;
  var clickHoldUntil = 0;       /* 点击/触摸后连接保持的时间戳（秒） */

  function updateMouseWorld(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    var hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(interactPlane, hit)) {
      netGroup.worldToLocal(hit);
      mouseWorld.copy(hit);
      mouseActive = true;
    }
  }

  canvas.addEventListener('mousemove', function (e) {
    updateMouseWorld(e.clientX, e.clientY);
  }, { passive: true });
  canvas.addEventListener('mouseleave', function () {
    mouseActive = false;
  }, { passive: true });
  /* 点击：激活连接并在该点保持一段时间 */
  canvas.addEventListener('click', function (e) {
    updateMouseWorld(e.clientX, e.clientY);
    clickHoldUntil = clock ? (clock.getElapsedTime() + 2.5) : 0;
  }, { passive: true });
  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length > 0) {
      updateMouseWorld(e.touches[0].clientX, e.touches[0].clientY);
      clickHoldUntil = clock ? (clock.getElapsedTime() + 2.5) : 0;
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      updateMouseWorld(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  canvas.addEventListener('touchend', function () {
    mouseActive = false;   /* 触摸结束关闭，点击保持由 clickHoldUntil 在动画中接管 */
  }, { passive: true });
  canvas.addEventListener('touchcancel', function () { mouseActive = false; }, { passive: true });

  /* ============================================================
     动画循环
     ============================================================ */
  var clock = new THREE.Clock();
  var running = true;
  var visible = true;

  function animate() {
    if (!running) { return; }
    requestAnimationFrame(animate);
    if (!visible) { return; }

    var t = clock.getElapsedTime();
    var dt = Math.min(clock.getDelta(), 0.05);

    /* 点击/触摸保持：在 hold 时段内强制激活交互（连接网保持一段时间） */
    if (t < clickHoldUntil) { mouseActive = true; }

    /* 节点网络：整体缓慢旋转 */
    netGroup.rotation.y = t * 0.04;
    netGroup.rotation.x = Math.sin(t * 0.03) * 0.12;

    /* 节点漂浮 + 鼠标排斥 */
    for (var nni = 0; nni < netNodes.length; nni++) {
      var nNode = netNodes[nni];
      var nUD = nNode.userData;
      var npx = nUD.base.x + Math.sin(t * nUD.driftSpeed + nUD.driftPhase) * nUD.driftAmp;
      var npy = nUD.base.y + Math.cos(t * nUD.driftSpeed + nUD.driftPhase * 1.3) * nUD.driftAmp;
      var npz = nUD.base.z + Math.sin(t * nUD.driftSpeed * 0.8 + nUD.driftPhase * 0.7) * nUD.driftAmp;

      if (mouseActive) {
        var mdx = npx - mouseWorld.x;
        var mdy = npy - mouseWorld.y;
        var mdz = npz - mouseWorld.z;
        var md2 = mdx * mdx + mdy * mdy + mdz * mdz;
        if (md2 < interactRadius * interactRadius && md2 > 0.01) {
          var md = Math.sqrt(md2);
          var force = (1 - md / interactRadius) * interactForce;
          npx += (mdx / md) * force;
          npy += (mdy / md) * force;
          npz += (mdz / md) * force * 0.5;
          nUD.highlight = 1;
        }
      }
      nUD.highlight *= 0.92;
      var hScale = 1 + nUD.highlight * 1.5;
      nNode.scale.set(hScale, hScale, hScale);
      nNode.position.x = npx;
      nNode.position.y = npy;
      nNode.position.z = npz;
    }

    /* 连线：基于距离阈值重新计算 */
    var nlp = netLinePositions;
    var segIdx = 0;
    for (var a = 0; a < netNodes.length; a++) {
      var pa = netNodes[a].position;
      for (var b = a + 1; b < netNodes.length; b++) {
        var pb = netNodes[b].position;
        var dx = pa.x - pb.x, dy = pa.y - pb.y, dz = pa.z - pb.z;
        var dist2 = dx * dx + dy * dy + dz * dz;
        if (dist2 < netConnectDist * netConnectDist) {
          var li = segIdx * 6;
          nlp[li]     = pa.x; nlp[li + 1] = pa.y; nlp[li + 2] = pa.z;
          nlp[li + 3] = pb.x; nlp[li + 4] = pb.y; nlp[li + 5] = pb.z;
          segIdx++;
        }
      }
    }
    netLineGeo.attributes.position.needsUpdate = true;
    netLineGeo.setDrawRange(0, segIdx * 2);

    /* 交互连线：光标附近节点两两相连 + 连向光标中心 */
    linkNodes.length = 0;
    if (mouseActive) {
      for (var cli = 0; cli < netNodes.length; cli++) {
        var cNode = netNodes[cli];
        var cdx = cNode.position.x - mouseWorld.x;
        var cdy = cNode.position.y - mouseWorld.y;
        var cdz = cNode.position.z - mouseWorld.z;
        if (cdx * cdx + cdy * cdy + cdz * cdz < linkConnectDist * linkConnectDist) {
          linkNodes.push(cNode);
        }
      }
    }
    var llp = linkLinePositions;
    var llc = linkLineColors;
    var lseg = 0;
    if (linkNodes.length > 0) {
      /* 附近节点两两相连（限制段数防爆） */
      var pairLimit = Math.min(linkNodes.length, 14);  /* 最多取 14 个附近节点两两连 */
      for (var la = 0; la < pairLimit && lseg < linkLineMax; la++) {
        var lpa = linkNodes[la].position;
        for (var lb = la + 1; lb < pairLimit && lseg < linkLineMax; lb++) {
          var lpb = linkNodes[lb].position;
          var ldx = lpa.x - lpb.x, ldy = lpa.y - lpb.y, ldz = lpa.z - lpb.z;
          /* 仅连接较近的节点对，避免网过密 */
          if (ldx * ldx + ldy * ldy + ldz * ldz < 12) {
            var lli = lseg * 6;
            llp[lli] = lpa.x; llp[lli + 1] = lpa.y; llp[lli + 2] = lpa.z;
            llp[lli + 3] = lpb.x; llp[lli + 4] = lpb.y; llp[lli + 5] = lpb.z;
            /* 顶点色：青→紫渐变，高亮交互连线 */
            llc[lli] = 0.13; llc[lli + 1] = 0.83; llc[lli + 2] = 0.93;   /* cyan */
            llc[lli + 3] = 0.51; llc[lli + 4] = 0.55; llc[lli + 5] = 0.97;  /* violet */
            lseg++;
          }
        }
      }
      /* 每个附近节点连向光标中心（形成以光标为枢纽的辐射线） */
      for (var lh = 0; lh < linkNodes.length && lseg < linkLineMax; lh++) {
        var lhp = linkNodes[lh].position;
        var lhi = lseg * 6;
        llp[lhi] = lhp.x; llp[lhi + 1] = lhp.y; llp[lhi + 2] = lhp.z;
        llp[lhi + 3] = mouseWorld.x; llp[lhi + 4] = mouseWorld.y; llp[lhi + 5] = mouseWorld.z;
        llc[lhi] = 0.13; llc[lhi + 1] = 0.83; llc[lhi + 2] = 0.93;   /* cyan（节点端） */
        llc[lhi + 3] = 1.0; llc[lhi + 4] = 1.0; llc[lhi + 5] = 1.0;  /* white（光标端） */
        lseg++;
      }
    }
    linkLineGeo.attributes.position.needsUpdate = true;
    linkLineGeo.attributes.color.needsUpdate = true;
    linkLineGeo.setDrawRange(0, lseg * 2);

    /* 相机：极轻微视差 */
    camera.position.x = Math.sin(t * 0.15) * 0.8;
    camera.position.y = 0.5 + Math.cos(t * 0.12) * 0.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  /* ============================================================
     性能保护：resize 节流 + 离屏暂停
     ============================================================ */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) { clearTimeout(resizeTimer); }
    resizeTimer = setTimeout(function () {
      var w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }, 180);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        visible = entries[e].isIntersecting;
      }
    }, { threshold: 0.01 });
    io.observe(canvas);
  }

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { clock.getDelta(); animate(); }
  });

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    running = false;
    renderer.render(scene, camera);
  }
})();
