/* 20260823-share1: iOS Home Screen PWA cannot share a .vcf file.
   Strip files from Web Share, keep name + number text. Clipboard if share dies.
   Safari (not standalone) is untouched. No homepage, no app.js. */
(function () {
  var stand = false;
  try {
    stand = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      || window.navigator.standalone === true;
  } catch (e0) {}
  if (!stand) return;

  function toast(msg) {
    try {
      if (typeof showInstallToast === 'function') { showInstallToast(msg); return; }
    } catch (e1) {}
    try { alert(msg); } catch (e2) {}
  }

  if (navigator.canShare) {
    try {
      var origCan = navigator.canShare.bind(navigator);
      navigator.canShare = function (data) {
        if (data && data.files && data.files.length) return false;
        return origCan(data);
      };
    } catch (e3) {}
  }

  if (navigator.share) {
    try {
      var origShare = navigator.share.bind(navigator);
      navigator.share = function (data) {
        var d = data || {};
        if (d.files && d.files.length) {
          d = { title: d.title || 'Sons of Thunder', text: d.text || 'Sons of Thunder contact' };
        }
        return origShare(d).catch(function (err) {
          if (err && err.name === 'AbortError') throw err;
          var line = String((d.title || '') + '\n' + (d.text || '')).trim();
          if (navigator.clipboard && navigator.clipboard.writeText && line) {
            return navigator.clipboard.writeText(line).then(function () {
              toast('Copied. Paste it in Messages.');
            });
          }
          throw err;
        });
      };
    } catch (e4) {}
  }
})();
