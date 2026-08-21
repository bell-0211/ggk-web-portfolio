(function() {
  var field = document.getElementById('starField');
  if (!field) { console.warn('[main.js] #starField not found'); }
  for (var i = 0; field && i < 55; i++) {
    var star = document.createElement('div');
    star.className = 'star';
    var size = Math.random() * 4 + 1.2;
    var baseOp = (Math.random() * 0.5 + 0.15).toFixed(2);
    var delay = (Math.random() * 6).toFixed(2);
    var dur = (Math.random() * 3 + 2).toFixed(2);
    star.style.top = (Math.random() * 100) + '%';
    star.style.left = (Math.random() * 100) + '%';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--base-op', baseOp);
    star.style.opacity = baseOp;
    star.style.animation = 'twinkle ' + dur + 's ' + delay + 's ease-in-out infinite';
    field.appendChild(star);
  }

  ['secFeaturesStars','secProductStars','secAudienceStars','secPricingStars'].forEach(function(id) {
    var container = document.getElementById(id);
    if (!container) return;
    var colors = ['sec-star-cyan', 'sec-star-indigo', 'sec-star-purple', 'sec-star-white'];
    for (var j = 0; j < 90; j++) {
      var s = document.createElement('div');
      s.className = 'sec-star';
      var isLg = Math.random() < 0.15;
      var colorClass = colors[Math.floor(Math.random() * colors.length)];
      s.classList.add(colorClass);
      var sz = isLg ? (Math.random() * 5 + 4) : (Math.random() * 3 + 1.2);
      var bOp = isLg ? (Math.random() * 0.2 + 0.7).toFixed(2) : (Math.random() * 0.25 + 0.4).toFixed(2);
      var d = (Math.random() * 6).toFixed(2);
      var dr = (Math.random() * 4 + 2).toFixed(2);
      var driftDur = (Math.random() * 8 + 6).toFixed(2);
      var driftD = (Math.random() * 6).toFixed(2);
      s.style.top = (Math.random() * 100) + '%';
      s.style.left = (Math.random() * 100) + '%';
      s.style.width = sz + 'px';
      s.style.height = sz + 'px';
      s.style.setProperty('--base-op', bOp);
      s.style.opacity = bOp;
      s.style.animation = 'sec-twinkle ' + dr + 's ' + d + 's ease-in-out infinite, sec-drift ' + driftDur + 's ' + driftD + 's ease-in-out infinite';
      container.appendChild(s);
    }
  });

  var navLinks = document.querySelectorAll('.navbar-nav a');
  navLinks.forEach(function(link, i) {
    link.style.animation = 'slide-up 0.5s ' + (2.0 + i * 0.08).toFixed(2) + 's ease both';
  });

  document.querySelectorAll('.capsule-tabs').forEach(function(tabsWrap) {
    var section = tabsWrap.getAttribute('data-section');
    var tabs = tabsWrap.querySelectorAll('.capsule-tab');
    var panels = document.querySelector('.tab-panels[data-section="' + section + '"]');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var idx = this.getAttribute('data-tab');
        tabs.forEach(function(t) { t.classList.remove('tab-active'); });
        this.classList.add('tab-active');
        panels.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('panel-active'); });
        panels.querySelector('.tab-panel[data-panel="' + idx + '"]').classList.add('panel-active');
      });
    });
  });

  var sectionIds = ['sec-features', 'sec-product', 'sec-audience', 'sec-pricing'];
  var sectionEls = sectionIds.map(function(id) { return document.getElementById(id); });

  var currentNav = -1;
  function setActiveNav(idx) {
    if (idx === currentNav) return;          // 未变化则跳过，减少回流与闪烁
    currentNav = idx;
    navLinks.forEach(function(link, i) {
      if (i === idx) {
        link.classList.add('nav-active');
      } else {
        link.classList.remove('nav-active');
      }
    });
  }

  function updateNav() {
    var viewH = window.innerHeight;
    var anchor = viewH * 0.4;          // 视口 40% 处为锚点线
    var TOL = 2;                       // 子像素容差，防交界处闪烁
    var current = -1;
    var bestDist = Infinity;
    sectionEls.forEach(function(sec, i) {
      if (!sec) return;
      var rect = sec.getBoundingClientRect();
      var top = rect.top;
      var bottom = rect.bottom;
      // 锚点线落在该 section 范围内（含容差）才算穿越
      if (top <= anchor + TOL && bottom >= anchor - TOL) {
        var mid = (top + bottom) / 2;
        var dist = Math.abs(mid - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          current = i;
        }
      }
    });
    setActiveNav(current);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav, { passive: true });
  requestAnimationFrame(updateNav);
  setTimeout(updateNav, 1000);
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function() { updateNav(); }, { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-20% 0px -20% 0px' });
    sectionEls.forEach(function(sec) { if (sec) navObserver.observe(sec); });
  }

  var overlay = document.getElementById('qrOverlay');
  var closeBtn = document.getElementById('qrClose');

  function openQR(e) {
    e.preventDefault();
    overlay.classList.add('active');
  }
  function closeQR() {
    overlay.classList.remove('active');
  }

  document.querySelectorAll('.cta-btn, .cta-primary').forEach(function(btn) {
    btn.addEventListener('click', openQR);
  });
  document.querySelectorAll('.cta-secondary').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('scene1-demo');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  closeBtn.addEventListener('click', closeQR);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeQR();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQR();
  });

  var sceneRows = document.querySelectorAll('.scene-row');
  if (sceneRows.length >= 2 && 'IntersectionObserver' in window) {
    var easing = 'cubic-bezier(0.22,1,0.36,1)';

    sceneRows.forEach(function(row, idx) {
      row.style.transition = 'opacity 0.8s ' + easing + ', transform 0.8s ' + easing + ', filter 0.8s ' + easing + ', visibility 0s 0.8s';
      if (idx === 0) {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0) scale(1) perspective(800px) rotateX(0deg)';
        row.style.filter = 'blur(0px)';
        row.style.visibility = 'visible';
      } else {
        row.style.opacity = '0';
        row.style.transform = 'translateY(50px) scale(0.96) perspective(800px) rotateX(2deg)';
        row.style.filter = 'blur(6px)';
        row.style.visibility = 'hidden';
        row.style.pointerEvents = 'none';
      }
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'opacity 0.8s ' + easing + ', transform 0.8s ' + easing + ', filter 0.8s ' + easing + ', visibility 0s 0s';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1) perspective(800px) rotateX(0deg)';
          entry.target.style.filter = 'blur(0px)';
          entry.target.style.visibility = 'visible';
          entry.target.style.pointerEvents = 'auto';
        } else {
          var idx = Array.prototype.indexOf.call(sceneRows, entry.target);
          var isAbove = entry.boundingClientRect.top < 0;
          entry.target.style.transition = 'opacity 0.8s ' + easing + ', transform 0.8s ' + easing + ', filter 0.8s ' + easing + ', visibility 0s 0.8s';
          entry.target.style.opacity = '0';
          if (isAbove) {
            entry.target.style.transform = 'translateY(-50px) scale(0.96) perspective(800px) rotateX(-2deg)';
          } else {
            entry.target.style.transform = 'translateY(50px) scale(0.96) perspective(800px) rotateX(2deg)';
          }
          entry.target.style.filter = 'blur(6px)';
          entry.target.style.visibility = 'hidden';
          entry.target.style.pointerEvents = 'none';
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '-60px 0px -60px 0px'
    });

    sceneRows.forEach(function(row) {
      observer.observe(row);
    });

    requestAnimationFrame(function() {
      sceneRows.forEach(function(row) {
        var rect = row.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          row.style.opacity = '1';
          row.style.transform = 'translateY(0) scale(1) perspective(800px) rotateX(0deg)';
          row.style.filter = 'blur(0px)';
          row.style.visibility = 'visible';
          row.style.pointerEvents = 'auto';
        }
      });
    });
  }

})();

// ════════ 独立导航高亮兜底块（不依赖上方 IIFE，防止 IIFE 中断导致高亮失效） ════════
(function () {
  var GGK_SECTION_IDS = ['sec-features', 'sec-product', 'sec-audience', 'sec-pricing'];
  var ggkNavLinks = null;
  var ggkSectionEls = null;
  var ggkCurrent = -1;

  function gatherEls() {
    ggkNavLinks = document.querySelectorAll('.navbar-nav a');
    ggkSectionEls = GGK_SECTION_IDS.map(function (id) { return document.getElementById(id); });
  }

  function applyActive(idx) {
    if (idx === ggkCurrent) return;
    ggkCurrent = idx;
    if (!ggkNavLinks || !ggkNavLinks.length) return;
    ggkNavLinks.forEach(function (link, i) {
      if (i === idx) link.classList.add('nav-active');
      else link.classList.remove('nav-active');
    });
  }

  function computeNav() {
    if (!ggkNavLinks) gatherEls();
    if (!ggkNavLinks || !ggkNavLinks.length) return;
    var viewH = window.innerHeight;
    var anchor = viewH * 0.4;
    var TOL = 2;
    var current = -1;
    var bestDist = Infinity;
    ggkSectionEls.forEach(function (sec, i) {
      if (!sec) return;
      var rect = sec.getBoundingClientRect();
      if (rect.top <= anchor + TOL && rect.bottom >= anchor - TOL) {
        var mid = (rect.top + rect.bottom) / 2;
        var dist = Math.abs(mid - anchor);
        if (dist < bestDist) { bestDist = dist; current = i; }
      }
    });
    applyActive(current);
  }

  function bindNavHighlight() {
    gatherEls();
    if (!ggkNavLinks || !ggkNavLinks.length) return;   // 导航不在 DOM（小屏隐藏）则放弃
    window.addEventListener('scroll', computeNav, { passive: true });
    window.addEventListener('resize', computeNav, { passive: true });
    requestAnimationFrame(computeNav);
    setTimeout(computeNav, 500);
    setTimeout(computeNav, 1500);
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function () { computeNav(); }, {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
        rootMargin: '-15% 0px -15% 0px'
      });
      ggkSectionEls.forEach(function (sec) { if (sec) ob.observe(sec); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindNavHighlight);
  } else {
    bindNavHighlight();
  }
})();

function ggkShowQRCode(btn) {
  var wrapper = btn.closest('.ggk-pv-qrcode');
  if (!wrapper) return;
  var imgWrap = wrapper.querySelector('.ggk-pv-qr-img-wrap');
  if (!imgWrap) return;
  if (imgWrap.classList.contains('ggk-pv-qr-visible')) return;
  btn.style.opacity = '0';
  btn.style.pointerEvents = 'none';
  btn.style.transition = 'opacity 0.3s ease';
  /* 淡出后收起按钮占位，让二维码居中演示区 */
  setTimeout(function () {
    btn.style.display = 'none';
    imgWrap.classList.add('ggk-pv-qr-visible');
  }, 300);
}

/* ============================================================
   四大功能区大标题：打字机入场动画
   - 01~04 每个标题滚动进入视口时逐字重现
   - 带闪烁光标，完成后光标淡出
   - 仅触发一次；语言切换时正在打字则切换全文继续，已完成则直接显示
   ============================================================ */
(function () {
  function init() {
    var sectionIds = ['#sec-features', '#sec-product', '#sec-audience', '#sec-pricing'];
    var items = [];

    sectionIds.forEach(function (sid) {
      var titleEl = document.querySelector(sid + ' > .features-hero-title');
      if (!titleEl) return;
      titleEl.setAttribute('data-typewriter', '1');

      var cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      cursor.style.cssText = 'display:inline-block;width:3px;height:1em;margin-left:4px;vertical-align:text-bottom;background:#818cf8;animation:tw-cursor-blink 0.7s step-end infinite;opacity:0';

      items.push({
        el: titleEl,
        cursor: cursor,
        fullText: '',
        typed: false,    /* 是否已执行过打字机 */
        typing: false,    /* 是否正在打字中 */
        timer: null
      });
    });

    if (items.length === 0) return;

    function getFullText(item) {
      return item.el.getAttribute('data-typewriter-text') || item.el.textContent || '';
    }

    function clearTimer(item) {
      if (item.timer) { clearTimeout(item.timer); item.timer = null; }
    }

    /* 单次打字机：逐字打出 → 停留 → 光标淡出 → 显示完整文本 */
    function startTypewriter(item) {
      if (item.typed || item.typing) return;
      item.fullText = getFullText(item);
      if (!item.fullText) return;
      item.typing = true;
      item.typed = true;
      item.el.textContent = '';
      item.el.appendChild(item.cursor);
      item.cursor.style.opacity = '1';

      var i = 0;
      function typeNext() {
        if (i < item.fullText.length) {
          item.el.textContent = item.fullText.slice(0, i + 1);
          item.el.appendChild(item.cursor);
          i++;
          var ch = item.fullText.charAt(i - 1);
          var delay = /[，。、！？；：·]/.test(ch) ? 220 : 65;
          item.timer = setTimeout(typeNext, delay);
        } else {
          /* 打完：光标闪烁后淡出，保留完整文本 */
          item.typing = false;
          setTimeout(function () { item.cursor.style.opacity = '0'; }, 1800);
        }
      }
      typeNext();
    }

    /* IntersectionObserver：滚入视口时触发（仅一次） */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            (function (entry) {
              var item = entry.target.__twItem;
              if (item) {
                io.unobserve(item.el);
                setTimeout(function () { startTypewriter(item); }, 400);
              }
            })(entries[e]);
          }
        }
      }, { threshold: 0.15 });
      items.forEach(function (item) {
        item.el.__twItem = item;
        io.observe(item.el);
      });
    } else {
      items.forEach(function (item) {
        setTimeout(function () { startTypewriter(item); }, 800);
      });
    }

    /* 监听语言切换：正在打字则切换目标全文继续；已完成则直接显示新语言全文 */
    document.addEventListener('ggk:langChanged', function () {
      items.forEach(function (item) {
        item.fullText = getFullText(item);
        if (item.typing) {
          /* 正在打字：切换目标全文，继续打新语言 */
        } else if (item.typed) {
          /* 已完成：直接显示新语言全文（光标已淡出） */
          item.el.textContent = item.fullText;
        }
      });
    });
  }

  /* 确保 DOM 和 i18n 都就绪后再初始化 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();

/* ============================================================
   02 / 03 / 04 区块内容入场动画
   - 02 卡片：交错淡入上移（.ggk-card-in）
   - 03 跑马灯：缩放去模糊（.ggk-stage-in）
   - 04 价格卡：侧滑 3D 翻转（.ggk-price-in）
   - IntersectionObserver 滚入视口时添加触发类，仅触发一次
   ============================================================ */
(function () {
  function init() {
    if (!('IntersectionObserver' in window)) {
      /* 降级：直接显示所有内容 */
      document.querySelectorAll('#sec-product .product-card, #sec-audience .ggk-marquee-stage, #sec-pricing .ggk-price-card')
        .forEach(function (el) {
          el.classList.add('ggk-card-in', 'ggk-stage-in', 'ggk-price-in');
        });
      return;
    }

    /* 02 产品特点：前 6 张可见卡片交错浮入 */
    var productCards = document.querySelectorAll('#sec-product > .product-grid > .product-card');
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = Array.prototype.indexOf.call(productCards, entry.target);
          setTimeout(function () { entry.target.classList.add('ggk-card-in'); }, idx * 80);
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    productCards.forEach(function (c) { io2.observe(c); });

    /* 03 适用人群：跑马灯整体缩放去模糊 */
    var stage = document.querySelector('#sec-audience .ggk-marquee-stage');
    if (stage) {
      var io3 = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ggk-stage-in');
            io3.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
      io3.observe(stage);
    }

    /* 04 定价情况：价格卡逐张侧滑翻转 */
    var priceCards = document.querySelectorAll('#sec-pricing .ggk-price-card');
    var io4 = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = Array.prototype.indexOf.call(priceCards, entry.target);
          setTimeout(function () { entry.target.classList.add('ggk-price-in'); }, idx * 180);
          io4.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    priceCards.forEach(function (c) { io4.observe(c); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 120); });
  } else {
    setTimeout(init, 120);
  }
})();