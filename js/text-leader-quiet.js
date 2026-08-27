/* 20260827-proof2: Home TEXT A LEADER copy only. Same openLeaderSms click. */
(function () {
  function paint() {
    var b = document.getElementById('text-leader-btn');
    if (!b) return;
    b.textContent = 'TEXT A LEADER';
    b.setAttribute('aria-label', 'TEXT A LEADER');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
})();
