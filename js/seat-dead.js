(function () {
  if (window.__tbSeatDead) return;
  window.__tbSeatDead = true;
  /* 20261002-seat-dead-neutralized
     Former job: close the profile modal when __tbSeatAllow was false,
     fighting seat-attach.js which opens it. That close logic is gone.
     File kept as a harmless flag so the loader line in config.js stays valid
     and no future island can reintroduce the slam by accident.
     Seat ownership now belongs to seat-attach.js alone. */
})();