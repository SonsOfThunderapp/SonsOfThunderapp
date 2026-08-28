(function () {
  function $(id) { return document.getElementById(id); }
  function openSwap() {
    var swap = $('contact-swap'); if (!swap) return;
    swap.classList.remove('hidden'); swap.setAttribute('aria-hidden', 'false');
    try { if (window.tbFeedback && window.tbFeedback.confirm) window.tbFeedback.confirm(); } catch (e0) {}
  }
  function bindHandshake() {
    var btn = $('brother-share-contact');
    if (!btn || btn.dataset.tbWow === '1') return;
    btn.dataset.tbWow = '1';
    btn.addEventListener('click', function () { setTimeout(openSwap, 280); }, false);
    var closer = $('contact-swap-close');
    if (closer && closer.dataset.tbWow !== '1') {
      closer.dataset.tbWow = '1';
      closer.addEventListener('click', function () {
        var swap = $('contact-swap');
        if (swap) { swap.classList.add('hidden'); swap.setAttribute('aria-hidden', 'true'); }
      });
    }
  }
  function bindTent() {
    var drop = $('axum-drop') || document.querySelector('.axum-drop');
    var card = $('axum-card') || document.querySelector('.axum-card');
    if (!card || $('axum-bright')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'axum-bright'; b.textContent = 'BRIGHT';
    card.appendChild(b);
    b.addEventListener('click', function () {
      if (drop) drop.classList.toggle('is-tent');
      card.classList.toggle('is-tent');
      b.textContent = (drop && drop.classList.contains('is-tent')) ? 'DIM' : 'BRIGHT';
    });
  }
  function markSeat() {
    var grid = $('brothers-grid'); if (!grid) return;
    grid.querySelectorAll('.brother-card[data-brother-index]').forEach(function (card) {
      if (card.querySelector('#tb-own-edit-btn, .tb-own-edit-btn')) card.classList.add('tb-my-seat');
    });
  }
  function bind() { bindHandshake(); bindTent(); markSeat(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  setTimeout(bind, 700);
  var grid = document.getElementById('brothers-grid');
  if (grid && grid.dataset.tbWow !== '1') {
    grid.dataset.tbWow = '1';
    new MutationObserver(function () { setTimeout(markSeat, 40); }).observe(grid, { childList: true, subtree: true });
  }
})();
