/* 20260831-thunder-type — type first. Mic does not auto-open. */
(function () {
  if (window.__tbThunderType) return;
  window.__tbThunderType = true;

  var ASKS = [
    { label: 'When’s the next gathering?', ask: 'When is the next Sons of Thunder gathering?' },
    { label: 'How do I lock I’m In?', ask: 'How do I tap I’m In for the next gathering?' },
    { label: 'What’s The Code?', ask: 'What are the six lines of The Code?' },
    { label: 'Text a leader', ask: 'How do I text a leader from the Board?' },
    { label: 'Where do we meet?', ask: 'Where does Sons of Thunder meet?' }
  ];

  function input() { return document.getElementById('thunder-input'); }
  function send() { return document.getElementById('thunder-send'); }

  function focusType() {
    var inp = input();
    if (!inp) return;
    try { inp.focus(); } catch (e) {}
  }

  function paintExamples() {
    var box = document.getElementById('thunder-examples');
    if (!box || box.dataset.tbType === '1') return;
    box.dataset.tbType = '1';
    box.innerHTML = '';
    ASKS.forEach(function (item) {
      var b = document.createElement('button');
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
    var label = document.getElementById('thunder-voice-label');
    var hint = document.getElementById('thunder-voice-hint');
    if (label) label.textContent = 'SPEAK INSTEAD';
    if (hint) hint.textContent = 'Optional. Typing is the door.';
  }

  function blockMic(e) {
    var t = e.target && e.target.closest && e.target.closest('#thunder-voice-btn');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    focusType();
  }

  document.addEventListener('click', function (e) {
    var fab = e.target && e.target.closest && e.target.closest('#thunder-fab');
    if (!fab) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    var m = document.getElementById('thunder-modal');
    if (m) {
      m.classList.remove('hidden');
      m.setAttribute('aria-hidden', 'false');
    }
    paintExamples();
    dressVoice();
    setTimeout(focusType, 80);
  }, true);
  document.addEventListener('click', blockMic, true);

  var modal = document.getElementById('thunder-modal');
  function onOpen() {
    if (!modal || modal.classList.contains('hidden')) return;
    paintExamples();
    dressVoice();
    setTimeout(focusType, 80);
  }
  if (modal && window.MutationObserver && !modal.dataset.tbTypeObs) {
    modal.dataset.tbTypeObs = '1';
    new MutationObserver(onOpen).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  paintExamples();
  dressVoice();

  if (!document.querySelector('script[src*="thunder-stay.js"]')) {
    var st = document.createElement('script');
    st.src = 'js/thunder-stay.js';
    st.defer = true;
    (document.body || document.documentElement).appendChild(st);
  }
  if (!document.querySelector('link[href*="thunder-type.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/thunder-type.css';
    (document.head || document.documentElement).appendChild(l);
  }
})();
