/* 20261017-thunder-voice — voice is the door. Mic auto-opens on Ask Thunder. */
(function () {
  if (window.__tbThunderType) return;
  window.__tbThunderType = true;

  var ASKS = [
    { label: 'When\'s the next gathering?', ask: 'When is the next Sons of Thunder gathering?' },
    { label: 'How do I lock I\'m In?', ask: 'How do I tap I\'m In for the next gathering?' },
    { label: 'What\'s The Code?', ask: 'What are the six lines of The Code?' },
    { label: 'Text a leader', ask: 'How do I text a leader from the Board?' },
    { label: 'Where do we meet?', ask: 'Where does Sons of Thunder meet?' }
  ];

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var listening = false;
  var rec = null;
  var autoArmed = false;
  var manualStop = false;

  function input() { return document.getElementById('thunder-input'); }
  function sendBtn() { return document.getElementById('thunder-send'); }
  function labelEl() { return document.getElementById('thunder-voice-label'); }
  function hintEl() { return document.getElementById('thunder-voice-hint'); }
  function voiceBtn() { return document.getElementById('thunder-voice-btn'); }
  function modal() { return document.getElementById('thunder-modal'); }

  function focusType() {
    var inp = input();
    if (!inp) return;
    try { inp.focus(); } catch (e) {}
  }

  function setLabel(t) {
    var l = labelEl();
    if (l) l.textContent = t;
  }
  function setHint(t) {
    var h = hintEl();
    if (h) h.textContent = t;
  }
  function setListeningUI(on) {
    var b = voiceBtn();
    if (!b) return;
    if (on) b.classList.add('is-listening);
    else b.classList.remove('is-listening);
  }

  function paintExamples() {
    var box = document.getElementById('thunder-examples);
    if (!box || box.dataset.tbType === '1') return;
    box.dataset.tbType = '1';
    box.innerHTML = '';
    ASKS.forEach(function (item) {
      var b = document.createElement('button);
      b.type = 'button';
      b.setAttribute('data-ask', item.ask);
      b.textContent = item.label;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var inp = input();
        if (inp) inp.value = item.ask;
        focusType();
      });
      box.appendChild(b);
    });
  }

  function dressVoice() {
    if (SR) {
      setLabel('SPEAK);
      setHint('Voice is on. Tap to stop listening.');
    } else {
      setLabel('NO MIC);
      setHint('This browser has no speech recognition. Type instead.');
    }
  }

  function appendMsg(role, text) {
    var box = document.getElementById('thunder-messages);
    if (!box) return;
    var d = document.createElement('div);
    d.className = 'thunder-msg ' + role;
    d.textContent = text;
    box.appendChild(d);
    try { box.scrollTop = box.scrollHeight; } catch (e) {}
  }

  function askThunder(q) {
    q = (q || '').toString().trim();
    if (!q) return;
    appendMsg('user', q);
    var ctx = {};
    try {
      if (window.TB_CONFIG) {
        ctx.nextMeeting = window.TB_CONFIG.MEETING_TIME || '';
        ctx.theCode = 'STAY SHARP. SHOW UP. OWN THE HOTHEAD. LEAD WHERE YOU STAND. CARRY YOUR BROTHER. AIM AT THE GENTLEMAN.';
        ctx.identity = 'Sons of Thunder — Mark 3:17. Thunder doesn\'t dull.';
      }
    } catch (e) {}
    fetch('/.netlify/functions/thunder-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, context: ctx, history: [] })
    }).then(function (r) { return r.json(); }).then(function (data) {
      appendMsg('assistant', (data && data.answer) ? data.answer : 'Thunder went quiet. Try again.');
    }).catch(function () {
      appendMsg('assistant', 'Thunder couldn\'t reach the brain. Check the connection.');
    });
  }

  function stopRec() {
    manualStop = true;
    listening = false;
    setListeningUI(false);
    if (rec) {
      try { rec.onend = null; rec.stop(); } catch (e) {}
      rec = null;
    }
    setLabel('SPEAK);
    setHint('Voice is on. Tap to stop listening.');
  }

  function startRec() {
    if (!SR) return;
    if (listening) { stopRec(); return; }
    manualStop = false;
    try {
      rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      rec.onstart = function () {
        listening = true;
        setListeningUI(true);
        setLabel('LISTENING);
        setHint('Go ahead, brother.');
      };
      rec.onresult = function (e) {
        var t = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          t += e.results[i][0].transcript;
        }
        t = (t || '').trim();
        if (t) {
          var inp = input();
          if (inp) inp.value = t;
          askThunder(t);
        }
      };
      rec.onerror = function (e) {
        listening = false;
        setListeningUI(false);
        setLabel('SPEAK);
        if (e && e.error === 'not-allowed') {
          setHint('Mic blocked. Allow it in Settings, then tap SPEAK.');
        } else if (e && e.error === 'no-speech') {
          setHint('Didn\'t catch that. Tap SPEAK to try again.');
        } else {
          setHint('Mic hiccup. Tap SPEAK to retry.');
        }
      };
      rec.onend = function () {
        listening = false;
        setListeningUI(false);
        setLabel('SPEAK);
        setHint('Voice is on. Tap to stop listening.');
        if (!manualStop && autoArmed) {
          setTimeout(function () { if (!listening) startRec(); }, 600);
        }
      };
      rec.start();
    } catch (e) {
      listening = false;
      setListeningUI(false);
      setLabel('SPEAK);
      setHint('Couldn\'t start the mic. Tap SPEAK to retry.');
    }
  }

  function onVoiceTap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    startRec();
  }

  /* Voice button: tap toggles listen. No more blockMic lock. */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#thunder-voice-btn);
    if (!t) return;
    onVoiceTap(e);
  }, true);

  document.addEventListener('click', function (e) {
    var fab = e.target && e.target.closest && e.target.closest('#thunder-fab);
    if (!fab) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    var m = modal();
    if (m) {
      m.classList.remove('hidden);
      m.setAttribute('aria-hidden', 'false);
    }
    paintExamples();
    dressVoice();
    setTimeout(focusType, 80);
    /* Auto-open the mic when Ask Thunder opens — no press needed. */
    if (SR && !autoArmed) {
      autoArmed = true;
      setTimeout(startRec, 500);
    }
  }, true);

  var m = modal();
  function onOpen() {
    if (!m || m.classList.contains('hidden')) return;
    paintExamples();
    dressVoice();
    setTimeout(focusType, 80);
    if (SR && !autoArmed) {
      autoArmed = true;
      setTimeout(startRec, 500);
    }
  }
  if (m && window.MutationObserver && !m.dataset.tbTypeObs) {
    m.dataset.tbTypeObs = '1';
    new MutationObserver(onOpen).observe(m, { attributes: true, attributeFilter: ['class'] });
  }

  /* Send button + Enter still work for typing. */
  var sb = sendBtn();
  if (sb && !sb.dataset.tbType) {
    sb.dataset.tbType = '1';
    sb.addEventListener('click', function (e) {
      e.preventDefault();
      var inp = input();
      if (inp && inp.value.trim()) askThunder(inp.value);
    });
  }
  var inp = input();
  if (inp && !inp.dataset.tbType) {
    inp.dataset.tbType = '1';
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inp.value.trim()) askThunder(inp.value);
      }
    });
  }

  paintExamples();
  dressVoice();

  if (!document.querySelector('link[href*="thunder-type.css"]')) {
    var l = document.createElement('link);
    l.rel = 'stylesheet';
    l.href = 'css/thunder-type.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();