(function () {
  if (window.__tbQrInstall) return;
  window.__tbQrInstall = true;
  var path = String(location.pathname || '');
  if (path.indexOf('/tap/install') === -1) return;

  function fire() {
    var more = document.querySelector('.bottom-nav [data-view="about"], #nav-about');
    if (more) more.click();
    var btn = document.getElementById('install-share-btn')
      || document.getElementById('install-help-btn')
      || document.querySelector('.install-card-btn');
    if (btn) {
      setTimeout(function () { btn.click(); }, 300);
      return;
    }
    try { if (window.openIosInstallOverlay) window.openIosInstallOverlay(); } catch (e) {}
  }
  setTimeout(fire, 500);
  setTimeout(fire, 1400);
})();
