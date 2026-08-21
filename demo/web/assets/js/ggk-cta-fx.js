(function () {
  var box = document.querySelector('.ggk-cta-box');
  if (!box) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;
  var ST = window.ScrollTrigger;
  if (hasGSAP && ST) gsap.registerPlugin(ScrollTrigger);

  function injectFx() {
    box.querySelectorAll('.ggk-cta-aura, .ggk-cta-sheen, .ggk-cta-particles').forEach(function (n) {
      n.remove();
    });

    var ap = document.createElement('div'); ap.className = 'ggk-cta-aura a-purple';
    var am = document.createElement('div'); am.className = 'ggk-cta-aura a-mint';
    box.insertBefore(ap, box.firstChild);
    box.insertBefore(am, box.firstChild);

    var sheen = document.createElement('div'); sheen.className = 'ggk-cta-sheen';
    box.insertBefore(sheen, box.firstChild);

    var sparkCount = window.innerWidth <= 768 ? 6 : 12;
    var wrap = document.createElement('div'); wrap.className = 'ggk-cta-particles';
    for (var i = 0; i < sparkCount; i++) {
      var s = document.createElement('span');
      s.className = 'ggk-cta-spark';
      s.style.left = (Math.random() * 92 + 4) + '%';
      s.style.top = (Math.random() * 88 + 6) + '%';
      s.style.setProperty('--dur', (3.5 + Math.random() * 4) + 's');
      s.style.setProperty('--delay', (Math.random() * 4) + 's');
      s.style.setProperty('--peak', (0.5 + Math.random() * 0.45).toFixed(2));
      wrap.appendChild(s);
    }
    box.insertBefore(wrap, box.firstChild);
  }

  function wrapBtnText() {
    var btn = box.querySelector('.ggk-btn-cta');
    if (!btn) return;
    if (btn.querySelector('.ggk-btn-cta-text')) return;
    var txt = btn.textContent.trim();
    btn.textContent = '';
    var span = document.createElement('span');
    span.className = 'ggk-btn-cta-text';
    span.textContent = txt;
    btn.appendChild(span);
  }

  function splitChars(el) {
    var text = (el.textContent || '').trim();
    if (!text) return [];
    var isCJK = /[一-鿿]/.test(text);
    var parts = isCJK ? text.split('') : text.split(/\s+/).filter(Boolean);
    var frag = document.createDocumentFragment();
    var nodes = [];
    parts.forEach(function (p, i) {
      if (i > 0 && !isCJK) frag.appendChild(document.createTextNode(' '));
      var s = document.createElement('span');
      s.className = 'ggk-cta-char';
      s.textContent = p;
      frag.appendChild(s);
      nodes.push(s);
    });
    el.innerHTML = '';
    el.appendChild(frag);
    return nodes;
  }

  function setupTitle() {
    var h2 = box.querySelector('h2');
    if (!h2) return;
    var chars = splitChars(h2);
    if (!chars.length) return;
    if (reduce || !hasGSAP) {
      if (hasGSAP) gsap.set(chars, { opacity: 1, y: 0, rotation: 0 });
      return;
    }
    gsap.set(chars, { opacity: 1, y: 0, rotation: 0 });
    gsap.from(chars, {
      y: 60,
      opacity: 0,
      rotation: 'random(-30, 30)',
      scale: 0.7,
      stagger: 0.06,
      duration: 0.9,
      ease: 'back.out(1.7)',
      immediateRender: false,
      scrollTrigger: ST ? { trigger: box, start: 'top 78%', once: true } : undefined
    });
  }

  function init() {
    injectFx();
    wrapBtnText();
    setupTitle();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();