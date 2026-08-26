/* Brothers only: gold TEXT A LEADER above the dock.
   Reuses #text-leader-btn (openLeaderSms). Never on Home, More, Memories, QR box, OPEN CHAIR. */
(function () {
  var ID = 'tb-text-leader-brothers';
  var STYLE_ID = 'tb-text-leader-brothers-style';

  function onBrothers() {
    var v = document.getElementById('view-brothers');
    return !!(v && v.classList.contains('active'));
  }

  function detailOpen() {
    var d = document.getElementById('brother-detail');
    return !!(d && !d.classList.contains('hidden'));
  }

  function fire(ev) {
    if (ev) {
      try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
    }
    try {
      var tb = document.getElementById('text-leader-btn');
      if (tb) { tb.click(); return; }
    } catch (e2) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '#' + ID + '{position:fixed;left:0;right:72px;bottom:calc(66px + var(--safe-bottom, env(safe-area-inset-bottom, 0px)));' +
      'z-index:280;display:none;align-items:center;justify-content:center;height:34px;margin:0;padding:0;' +
      'border:0;background:transparent;color:#FEF105;font:inherit;font-size:13px;font-weight:800;' +
      'letter-spacing:.16em;text-transform:uppercase;line-height:1;cursor:pointer;-webkit-tap-highlight-color:transparent;}' +
      '#' + ID + '[data-on="1"]{display:flex;}' +
      '@media (min-width:900px){#' + ID + '{right:88px;font-size:15px;}}';
    (document.head || document.documentElement).appendChild(s);
  }

  function sync() {
    ensureStyle();
    var btn = document.getElementById(ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = ID;
      btn.type = 'button';
      btn.textContent = 'TEXT A LEADER';
      btn.setAttribute('aria-label', 'TEXT A LEADER');
      btn.addEventListener('click', fire);
      (document.body || document.documentElement).appendChild(btn);
    }
    var show = onBrothers() && !detailOpen();
    btn.setAttribute('data-on', show ? '1' : '0');
    btn.setAttribute('aria-hidden', show ? 'false' : 'true');
    btn.tabIndex = show ? 0 : -1;
  }

  function boot() {
    sync();
    var obs = new MutationObserver(function () { sync(); });
    var brothers = document.getElementById('view-brothers');
    var detail = document.getElementById('brother-detail');
    if (brothers) obs.observe(brothers, { attributes: true, attributeFilter: ['class'] });
    if (detail) obs.observe(detail, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('click', function (ev) {
      var n = ev.target && ev.target.closest && ev.target.closest('.nav-item');
      if (n) setTimeout(sync, 0);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
