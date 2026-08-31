/* 20260831-sb-one — one Supabase client, one session. Seat + plate + Axum share it. */
(function () {
  if (window.__tbSbOneLock) return;
  window.__tbSbOneLock = true;

  function cfg() {
    return window.TB_CONFIG || window.tbConfig || {};
  }

  function make() {
    var c = cfg();
    if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY || !window.supabase || !window.supabase.createClient) {
      return null;
    }
    return window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage
      },
      realtime: { params: { eventsPerSecond: 5 } }
    });
  }

  function one() {
    if (window.__tbSbOne) return window.__tbSbOne;
    if (window.__tbLastSb) {
      window.__tbSbOne = window.__tbLastSb;
      return window.__tbSbOne;
    }
    window.__tbSbOne = make();
    if (window.__tbSbOne) {
      window.__tbLastSb = window.__tbSbOne;
      window.__tbTheaterSb = window.__tbSbOne;
    }
    return window.__tbSbOne;
  }

  var prev = window.getSb;
  window.getSb = function () {
    if (typeof prev === 'function') {
      try {
        var existing = prev();
        if (existing) {
          window.__tbSbOne = existing;
          window.__tbLastSb = existing;
          window.__tbTheaterSb = existing;
          return existing;
        }
      } catch (e0) {}
    }
    return one();
  };

  one();
})();
