(function() {
  var wrapper = document.getElementById('scene1-demo');
  if (!wrapper) return;

  var screen = 'home';
  var sidebarOpen = false;
  var demoMode = false;
  var demoTyping = '';
  var demoDone = false;
  var timers = [];

  var $ = function(sel) { return wrapper.querySelector(sel); };
  var $$ = function(sel) { return wrapper.querySelectorAll(sel); };

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function delay(ms) { return new Promise(function(res) { var t = setTimeout(res, ms); timers.push(t); }); }

  function updateUI() {
    var isHome = screen === 'home';
    var isTyping = screen === 'typing';

    var homeScreen = $('.s1-home-screen');
    var chatScreen = $('.s1-chat-screen');
    var whiteOverlay = $('.s1-white-overlay');
    var inputBird = $('.s1-input-bird');
    var newChatBtn = $('.s1-new-chat-btn');
    var typingIndicator = $('.s1-typing-indicator');
    var aiResponse = $('.s1-ai-response');
    var sendBtn = $('.s1-send-btn');
    var inputField = $('.s1-input-field');

    homeScreen.style.display = isHome ? 'flex' : 'none';
    chatScreen.style.display = isHome ? 'none' : 'block';
    whiteOverlay.style.display = isHome ? 'none' : 'block';
    inputBird.style.display = 'flex';
    newChatBtn.style.display = isHome ? 'none' : 'block';

    typingIndicator.style.display = isTyping ? 'flex' : 'none';
    aiResponse.style.display = (screen === 'response') ? 'block' : 'none';

    if (isTyping) {
      sendBtn.classList.add('s1-stop-mode');
      sendBtn.classList.remove('s1-inactive');
    } else {
      sendBtn.classList.remove('s1-stop-mode');
      var isActive = isHome || (inputField && inputField.value.trim()) || screen === 'response';
      if (isActive) sendBtn.classList.remove('s1-inactive');
      else sendBtn.classList.add('s1-inactive');
    }

    inputField.value = demoMode ? demoTyping : (inputField._userText || '');
    inputField.readOnly = demoMode;
  }

  function setScreen(s) { screen = s; updateUI(); }
  function openSidebar() { sidebarOpen = true; $('.s1-sidebar-overlay').style.display = 'flex'; }
  function closeSidebar() { sidebarOpen = false; $('.s1-sidebar-overlay').style.display = 'none'; }

  function handleSend() {
    var inputField = $('.s1-input-field');
    var text = (inputField._userText || '').trim();
    if (!text && screen !== 'home') return;
    setScreen('typing');
    inputField._userText = '';
  }

  function handleNewChat() {
    var inputField = $('.s1-input-field');
    inputField._userText = '';
    setScreen('home');
  }

  async function runDemo() {
    if (!demoMode) { clearTimers(); setScreen('home'); closeSidebar(); demoTyping = ''; demoDone = false; updateUI(); return; }
    demoDone = false;
    setScreen('home'); closeSidebar(); demoTyping = '';
    await delay(3000);
    var msg = '你好今天的天气怎么样';
    var interval = 3000 / msg.length;
    for (var i = 1; i <= msg.length; i++) { demoTyping = msg.slice(0, i); updateUI(); await delay(interval); }
    await delay(300);
    demoTyping = '';
    setScreen('typing');
    await delay(2600);
    setScreen('response');
    await delay(3500);
    openSidebar();
    await delay(3000);
    closeSidebar();
    demoDone = true;
    demoMode = false;
    updateDemoBtn();
    updateUI();
  }

  function updateDemoBtn() {
    var btn = $('.s1-demo-btn');
    var label = $('.s1-demo-label');
    var icon = $('.s1-demo-icon');
    var mask = document.getElementById('s1DemoMask');
    if (demoMode) {
      btn.classList.add('s1-demo-active');
      icon.innerHTML = '&#9632;';
      label.textContent = '停止演示';
      if (mask) mask.classList.add('s1-mask-hidden');   /* 演示运行：蒙版淡出 */
    } else {
      btn.classList.remove('s1-demo-active');
      icon.innerHTML = '&#9654;';
      label.textContent = demoDone ? '重新演示' : '自动演示';
      if (mask) mask.classList.remove('s1-mask-hidden'); /* 停止/结束：蒙版重现 */
    }
  }

  wrapper.addEventListener('click', function(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.getAttribute('data-action');
    if (action === 'open-sidebar') { openSidebar(); }
    else if (action === 'close-sidebar') { closeSidebar(); }
    else if (action === 'new-chat') { handleNewChat(); }
    else if (action === 'quick-action') { if (!demoMode) setScreen('typing'); }
    else if (action === 'send') {
      if (screen === 'typing' && !demoMode) { setScreen('response'); }
      else if (!demoMode) { handleSend(); }
    }
    else if (action === 'toggle-demo') {
      demoMode = !demoMode;
      updateDemoBtn();
      runDemo();
    }
    else if (action === 'toggle-group') {
      var group = target.getAttribute('data-group');
      var items = wrapper.querySelector('[data-group-items="' + group + '"]');
      var chevron = target.querySelector('.s1-chevron');
      if (items) { items.classList.toggle('s1-collapsed'); }
      if (chevron) { chevron.classList.toggle('s1-collapsed'); }
    }
  });

  var inputField = $('.s1-input-field');
  if (inputField) {
    inputField._userText = '';
    inputField.addEventListener('input', function() {
      if (!demoMode) { this._userText = this.value; updateUI(); }
    });
    inputField.addEventListener('keydown', function(e) {
      if (!demoMode && e.key === 'Enter') { handleSend(); }
    });
  }

  var typingTimer = null;
  var origSetScreen = setScreen;
  setScreen = function(s) {
    origSetScreen(s);
    if (typingTimer) clearTimeout(typingTimer);
    if (!demoMode && s === 'typing') {
      typingTimer = setTimeout(function() { setScreen('response'); }, 2600);
    }
  };

  updateUI();
})();