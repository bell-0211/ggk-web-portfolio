(function() {
  var wrapper = document.getElementById('scene2-demo');
  if (!wrapper) return;

  var phoneContent = document.getElementById('s2PhoneContent');
  var macBody = document.getElementById('s2MacBody');
  var demoBtn = document.getElementById('s2DemoBtn');
  var gearBtn = document.getElementById('s2GearBtn');
  var inputField = document.getElementById('s2Input');
  var macTab = document.getElementById('s2MacTab');
  var macStatus = document.getElementById('s2MacStatus');
  var permA = document.getElementById('s2PermA');
  var permC = document.getElementById('s2PermC');
  var settingsOverlay = document.getElementById('s2SettingsOverlay');
  var settingsSheet = document.getElementById('s2SettingsSheet');
  var keyHintEl = document.getElementById('s2KeyHint');
  var gearPing = document.getElementById('s2GearPing');

  var aiGreeting = phoneContent ? phoneContent.querySelector('.s2-ai-greeting') : null;
  var userMsgs = phoneContent ? phoneContent.querySelectorAll('.s2-user-msg') : [];
  var aiReply = phoneContent ? phoneContent.querySelector('.s2-ai-reply') : null;
  var sysDivider = phoneContent ? phoneContent.querySelector('.s2-sys-divider') : null;
  var aiReply2 = phoneContent ? phoneContent.querySelector('.s2-ai-reply2') : null;
  var tools = phoneContent ? phoneContent.querySelector('.s2-tools') : null;
  var warning = phoneContent ? phoneContent.querySelector('.s2-warning') : null;
  var phoneResult = phoneContent ? phoneContent.querySelector('.s2-phone-result') : null;

  var termPrompt = macBody ? macBody.querySelector('.s2-term-prompt') : null;
  var termResponse = macBody ? macBody.querySelector('.s2-term-response') : null;
  var termPrompt2 = macBody ? macBody.querySelector('.s2-term-prompt2') : null;
  var termTools = macBody ? macBody.querySelector('.s2-term-tools') : null;
  var termPerm = macBody ? macBody.querySelector('.s2-term-perm') : null;
  var termExec = macBody ? macBody.querySelector('.s2-term-exec') : null;
  var termProcessing = macBody ? macBody.querySelector('.s2-term-processing') : null;
  var termFetch = macBody ? macBody.querySelector('.s2-term-fetch') : null;
  var termResult = macBody ? macBody.querySelector('.s2-term-result') : null;

  var termState = 'prompt';
  var buildStep = 7;
  var selA = 0;
  var selC = 1;
  var settingsOpen = false;
  var permMode = '默认';
  var model = 'default model';
  var inputValue = '';
  var gearHighlight = false;
  var keyHint = null;
  var demoPhase = 'idle';
  var timers = [];
  var demoStartTime = 0;
  var PLAY_SPEED = 1.2;      /* 播放速度倍率：>1 加快、<1 减慢 */

  function sched(ms, fn) {
    var id = setTimeout(fn, ms / PLAY_SPEED);   /* 按 PLAY_SPEED 缩放延时 */
    timers.push(id);
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function track(event) {
    var payload = { event: event, timestamp: new Date().toISOString() };
    if (event !== 'demo_start') payload.elapsed_ms = Date.now() - demoStartTime;
    console.log('[埋点]', payload);
  }

  function typeText(text, startAt, charMs) {
    charMs = charMs || 90;                        /* 保持原始单位，由 sched 统一缩放 */
    for (var i = 1; i <= text.length; i++) {
      var slice = text.slice(0, i);
      sched(startAt + i * charMs, (function(s) {
        return function() { if (inputField) inputField.value = s; };
      })(slice));
    }
    return startAt + text.length * charMs;
  }

  function updateBuildStep(step) {
    if (aiGreeting) aiGreeting.style.display = step >= 1 ? 'block' : 'none';
    if (userMsgs[0]) userMsgs[0].style.display = step >= 2 ? 'block' : 'none';
    if (aiReply) aiReply.style.display = step >= 3 ? 'block' : 'none';
    if (sysDivider) sysDivider.style.display = step >= 4 ? 'flex' : 'none';
    if (userMsgs[1]) userMsgs[1].style.display = step >= 5 ? 'block' : 'none';
    if (aiReply2) aiReply2.style.display = step >= 6 ? 'block' : 'none';
    if (tools) tools.style.display = step >= 6 ? 'block' : 'none';
    if (warning) warning.style.display = step >= 7 ? 'flex' : 'none';
    if (phoneResult) phoneResult.style.display = step >= 8 ? 'block' : 'none';
    if (termPrompt) termPrompt.style.display = step >= 2 ? 'block' : 'none';
    if (termResponse) termResponse.style.display = step >= 3 ? 'block' : 'none';
    if (termPrompt2) termPrompt2.style.display = step >= 5 ? 'block' : 'none';
    if (termTools) termTools.style.display = step >= 6 ? 'block' : 'none';
    if (termPerm) termPerm.style.display = step >= 7 ? 'block' : 'none';
  }

  function hideAllTermSections() {
    var sections = [termPrompt, termResponse, termPrompt2, termTools, termPerm, termExec, termProcessing, termFetch, termResult];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i]) sections[i].style.display = 'none';
    }
  }

  function updateTermState(state) {
    hideAllTermSections();
    if (state === 'prompt' || state === 'transitioning_b') {
      if (termPrompt) termPrompt.style.display = buildStep >= 2 ? 'block' : 'none';
      if (termResponse) termResponse.style.display = buildStep >= 3 ? 'block' : 'none';
      if (termPrompt2) termPrompt2.style.display = buildStep >= 5 ? 'block' : 'none';
      if (termTools) termTools.style.display = buildStep >= 6 ? 'block' : 'none';
      if (termPerm) termPerm.style.display = buildStep >= 7 ? 'block' : 'none';
      if (state === 'transitioning_b' && termExec) termExec.style.display = 'block';
    } else if (state === 'processing') {
      if (termPrompt) termPrompt.style.display = 'block';
      if (termResponse) termResponse.style.display = 'block';
      if (termPrompt2) termPrompt2.style.display = 'block';
      if (termTools) termTools.style.display = 'block';
      if (termProcessing) termProcessing.style.display = 'block';
    } else if (state === 'fetch' || state === 'transitioning_d') {
      if (termPrompt) termPrompt.style.display = 'block';
      if (termResponse) termResponse.style.display = 'block';
      if (termPrompt2) termPrompt2.style.display = 'block';
      if (termTools) termTools.style.display = 'block';
      if (termFetch) termFetch.style.display = 'block';
      if (state === 'transitioning_d' && termExec) termExec.style.display = 'block';
    } else if (state === 'result') {
      if (termPrompt) termPrompt.style.display = 'block';
      if (termResponse) termResponse.style.display = 'block';
      if (termPrompt2) termPrompt2.style.display = 'block';
      if (termTools) termTools.style.display = 'block';
      if (termResult) termResult.style.display = 'block';
    }
  }

  function updatePermSelection(containerId, selectedIndex) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var opts = container.querySelectorAll('.s2-perm-opt');
    for (var i = 0; i < opts.length; i++) {
      if (i === selectedIndex) opts[i].classList.add('selected');
      else opts[i].classList.remove('selected');
    }
  }

  function updateDemoBtn() {
    if (!demoBtn) return;
    var icon = demoBtn.querySelector('.s2-demo-icon');
    var label = demoBtn.querySelector('.s2-demo-label');
    if (demoPhase === 'running') {
      demoBtn.classList.add('s2-demo-active');
      if (icon) icon.innerHTML = '&#9632;';
      if (label) label.textContent = '停止';
    } else if (demoPhase === 'done') {
      demoBtn.classList.remove('s2-demo-active');
      if (icon) icon.innerHTML = '&#8634;';
      if (label) label.textContent = '重播';
    } else {
      demoBtn.classList.remove('s2-demo-active');
      if (icon) icon.innerHTML = '&#9654;';
      if (label) label.textContent = '立即演示';
    }
  }

  function updateMacTab() {
    if (!macTab) return;
    macTab.textContent = (termState === 'prompt' || termState === 'transitioning_b') ? 'Claude Code' : '• Check Shanghai weather te...';
  }

  function updateMacStatus() {
    if (!macStatus) return;
    if (termState === 'prompt' || termState === 'transitioning_b') macStatus.textContent = 'Esc to cancel · Tab to amend';
    else if (termState === 'processing') macStatus.textContent = 'esc to interrupt';
    else if (termState === 'fetch' || termState === 'transitioning_d') macStatus.textContent = ' ';
    else if (termState === 'result') macStatus.textContent = '? for shortcuts · ← for agents';
  }

  function scrollTerminalToBottom() {
    if (macBody) macBody.scrollTop = macBody.scrollHeight;
    if (phoneContent) phoneContent.scrollTop = phoneContent.scrollHeight;   /* 移动端同步滚动到底，保持双端内容同步可见 */
  }

  function showKeyHint(label) {
    if (!keyHintEl) return;
    var pill = keyHintEl.querySelector('.s2-key-hint-pill');
    if (pill) pill.textContent = label;
    keyHintEl.classList.add('visible');
    keyHint = label;
  }

  function hideKeyHint() {
    if (!keyHintEl) return;
    keyHintEl.classList.remove('visible');
    keyHint = null;
  }

  function openSettings() {
    settingsOpen = true;
    if (settingsOverlay) { settingsOverlay.style.display = 'block'; requestAnimationFrame(function() { settingsOverlay.classList.add('visible'); }); }
    if (settingsSheet) { settingsSheet.style.display = 'block'; requestAnimationFrame(function() { requestAnimationFrame(function() { settingsSheet.classList.add('visible'); }); }); }
  }

  function closeSettings() {
    settingsOpen = false;
    if (settingsOverlay) settingsOverlay.classList.remove('visible');
    if (settingsSheet) settingsSheet.classList.remove('visible');
    setTimeout(function() {
      if (settingsOverlay) settingsOverlay.style.display = 'none';
      if (settingsSheet) settingsSheet.style.display = 'none';
    }, 380);
  }

  function updateSettingsSelection() {
    var modeOpts = settingsSheet ? settingsSheet.querySelectorAll('.s2-settings-option[data-mode]') : [];
    for (var i = 0; i < modeOpts.length; i++) {
      if (modeOpts[i].getAttribute('data-mode') === permMode) modeOpts[i].classList.add('selected');
      else modeOpts[i].classList.remove('selected');
      var dot = modeOpts[i].querySelector('.s2-settings-radio-dot');
      if (dot) dot.style.display = modeOpts[i].classList.contains('selected') ? 'block' : 'none';
    }
    var modelOpts = settingsSheet ? settingsSheet.querySelectorAll('.s2-settings-option[data-model]') : [];
    for (var j = 0; j < modelOpts.length; j++) {
      if (modelOpts[j].getAttribute('data-model') === model) modelOpts[j].classList.add('selected');
      else modelOpts[j].classList.remove('selected');
      var dot2 = modelOpts[j].querySelector('.s2-settings-radio-dot');
      if (dot2) dot2.style.display = modelOpts[j].classList.contains('selected') ? 'block' : 'none';
    }
  }

  function advanceTermState(newState) {
    termState = newState;
    updateTermState(termState);
    updateMacTab();
    updateMacStatus();
    scrollTerminalToBottom();
  }

  function startDemo() {
    clearTimers();
    termState = 'prompt'; buildStep = 0; selA = 0; selC = 1;
    settingsOpen = false; permMode = '默认'; model = 'default model';
    inputValue = ''; gearHighlight = false; keyHint = null;
    if (inputField) inputField.value = '';
    if (gearPing) gearPing.style.display = 'none';
    if (gearBtn) gearBtn.classList.remove('highlight');
    hideKeyHint();
    closeSettings();
    updateBuildStep(0);
    updateTermState('prompt');
    updatePermSelection('s2PermA', 0);
    updatePermSelection('s2PermC', 1);
    demoPhase = 'running';
    updateDemoBtn();
    demoStartTime = Date.now();
    track('demo_start');

    var t = 600;

    sched(t, function() { buildStep = 1; updateBuildStep(1); scrollTerminalToBottom(); }); t += 1200;
    var afterType1 = typeText('hi 早上好', t, 100);
    t = afterType1 + 300;
    sched(t, function() { if (inputField) inputField.value = ''; buildStep = 2; updateBuildStep(2); scrollTerminalToBottom(); }); t += 700;
    sched(t, function() { buildStep = 3; updateBuildStep(3); scrollTerminalToBottom(); }); t += 1800;
    sched(t, function() { buildStep = 4; updateBuildStep(4); scrollTerminalToBottom(); }); t += 700;
    var msg2 = '我想查一下今天上海市的天气状况如何？';
    var afterType2 = typeText(msg2, t, 75);
    t = afterType2 + 300;
    sched(t, function() { if (inputField) inputField.value = ''; buildStep = 5; updateBuildStep(5); scrollTerminalToBottom(); }); t += 700;
    sched(t, function() { buildStep = 6; updateBuildStep(6); scrollTerminalToBottom(); }); t += 1200;
    sched(t, function() { buildStep = 7; updateBuildStep(7); scrollTerminalToBottom(); }); t += 1000;
    t += 1000;

    sched(t, function() { gearHighlight = true; if (gearPing) gearPing.style.display = 'block'; if (gearBtn) gearBtn.classList.add('highlight'); }); t += 700;
    sched(t, function() { gearHighlight = false; if (gearPing) gearPing.style.display = 'none'; if (gearBtn) gearBtn.classList.remove('highlight'); openSettings(); }); t += 1400;
    sched(t, function() { permMode = '计划模式'; updateSettingsSelection(); }); t += 1000;
    sched(t, function() { permMode = '默认'; updateSettingsSelection(); }); t += 800;
    sched(t, function() { closeSettings(); }); t += 1200;

    showKeyHint('↓  ArrowDown'); sched(t + 100, function() { selA = 1; updatePermSelection('s2PermA', 1); scrollTerminalToBottom(); }); t += 750;
    showKeyHint('↓  ArrowDown'); sched(t + 100, function() { selA = 2; updatePermSelection('s2PermA', 2); scrollTerminalToBottom(); }); t += 750;
    showKeyHint('↑  ArrowUp'); sched(t + 100, function() { selA = 1; updatePermSelection('s2PermA', 1); scrollTerminalToBottom(); }); t += 750;
    showKeyHint('↑  ArrowUp'); sched(t + 100, function() { selA = 0; updatePermSelection('s2PermA', 0); scrollTerminalToBottom(); }); t += 800;
    showKeyHint('↵  Enter');
    sched(t + 200, function() { advanceTermState('transitioning_b'); }); t += 1000;
    sched(t + 5400, function() { advanceTermState('processing'); });
    sched(t + 5400 + 2500, function() { advanceTermState('fetch'); });
    t += 5400 + 2500 + 2500;

    showKeyHint('↓  ArrowDown'); sched(t + 100, function() { selC = 2; updatePermSelection('s2PermC', 2); scrollTerminalToBottom(); }); t += 750;
    showKeyHint('↑  ArrowUp'); sched(t + 100, function() { selC = 1; updatePermSelection('s2PermC', 1); scrollTerminalToBottom(); }); t += 750;
    showKeyHint('↑  ArrowUp'); sched(t + 100, function() { selC = 0; updatePermSelection('s2PermC', 0); scrollTerminalToBottom(); }); t += 750;
    showKeyHint('↓  ArrowDown'); sched(t + 100, function() { selC = 1; updatePermSelection('s2PermC', 1); scrollTerminalToBottom(); }); t += 800;
    showKeyHint('↵  Enter');
    sched(t + 200, function() { advanceTermState('transitioning_d'); }); t += 1000;
    sched(t + 5200, function() { advanceTermState('result'); buildStep = 8; updateBuildStep(8); scrollTerminalToBottom(); });
    sched(t + 5200 + 4500, function() {
      demoPhase = 'done';
      updateDemoBtn();
      track('demo_complete');
    });
  }

  function stopDemo() {
    clearTimers();
    hideKeyHint();
    gearHighlight = false;
    if (gearPing) gearPing.style.display = 'none';
    if (gearBtn) gearBtn.classList.remove('highlight');
    demoPhase = 'idle';
    updateDemoBtn();
    track('demo_stop');
  }

  document.addEventListener('keydown', function(e) {
    if (demoPhase === 'running') return;
    if (termState === 'prompt') {
      if (e.key === 'ArrowDown') { e.preventDefault(); selA = Math.min(selA + 1, 2); updatePermSelection('s2PermA', selA); scrollTerminalToBottom(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selA = Math.max(selA - 1, 0); updatePermSelection('s2PermA', selA); scrollTerminalToBottom(); }
      else if (e.key === 'Enter' && selA < 2) { e.preventDefault(); advanceTermState('transitioning_b'); setTimeout(function() { advanceTermState('processing'); }, 2500); setTimeout(function() { advanceTermState('fetch'); }, 5000); }
    } else if (termState === 'fetch') {
      if (e.key === 'ArrowDown') { e.preventDefault(); selC = Math.min(selC + 1, 2); updatePermSelection('s2PermC', selC); scrollTerminalToBottom(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selC = Math.max(selC - 1, 0); updatePermSelection('s2PermC', selC); scrollTerminalToBottom(); }
      else if (e.key === 'Enter' && selC < 2) { e.preventDefault(); advanceTermState('transitioning_d'); setTimeout(function() { advanceTermState('result'); }, 4500); }
    }
  });

  if (demoBtn) demoBtn.addEventListener('click', function() {
    if (demoPhase === 'running') stopDemo();
    else startDemo();
  });

  if (gearBtn) gearBtn.addEventListener('click', function() {
    if (settingsOpen) closeSettings();
    else openSettings();
  });

  if (settingsOverlay) settingsOverlay.addEventListener('click', function() { closeSettings(); });

  if (settingsSheet) settingsSheet.addEventListener('click', function(e) {
    var modeOpt = e.target.closest ? e.target.closest('.s2-settings-option[data-mode]') : null;
    if (modeOpt) { permMode = modeOpt.getAttribute('data-mode'); updateSettingsSelection(); return; }
    var modelOpt = e.target.closest ? e.target.closest('.s2-settings-option[data-model]') : null;
    if (modelOpt) { model = modelOpt.getAttribute('data-model'); updateSettingsSelection(); return; }
  });

  updateBuildStep(7);
  updatePermSelection('s2PermA', 0);
  updatePermSelection('s2PermC', 1);
})();