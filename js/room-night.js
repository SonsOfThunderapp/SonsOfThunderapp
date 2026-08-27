/* The Room night board. Keeps patio / draw IDs. Hides the white QR until Door Code opens. */
(function () {
  function paintQr() {
    try {
      if (typeof window.paintPatioTapQr === 'function') window.paintPatioTapQr();
    } catch (e0) {}
  }
  function bind() {
    var block = document.getElementById('patio-tap-block');
    if (block && block.dataset.tbNight !== '1') {
      block.dataset.tbNight = '1';
      block.addEventListener('toggle', function () {
        if (block.open) paintQr();
      });
    }
    var roomBtn = document.getElementById('admin-room-btn');
    if (roomBtn && roomBtn.dataset.tbNight !== '1') {
      roomBtn.dataset.tbNight = '1';
      roomBtn.addEventListener('click', function () {
        setTimeout(paintQr, 400);
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
