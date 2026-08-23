/* 20260823-safe1: installed iOS PWA cannot reliably share a .vcf file. Do not hack Apple. Fall through to text share. Safari untouched. */
(function () {
  var stand = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (!stand) return;
  if (!navigator.canShare) return;
  var orig = navigator.canShare.bind(navigator);
  try {
    navigator.canShare = function (data) {
      if (data && data.files && data.files.length) return false;
      return orig(data);
    };
  } catch (e) {}
})();
