/**
 * Thunder Board — Quiet Guardians (event-driven, no redesign)
 * APP lineage: 20260817-guardians1
 *
 * Observe / protect / recover only.
 * No timers that poll every few seconds.
 * No UI redesign. No secrets. No autonomous writes to Supabase as admin.
 */
(function (global) {
  'use strict';

  var BUILD = (global.TB_CONFIG && global.TB_CONFIG.APP_BUILD) || 'unknown';
  var STORE = 'tb_guardian_v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE) || '{}') || {};
    } catch (e) {
      return {};
    }
  }
  function save(state) {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }
  function now() {
    return Date.now();
  }

  /* ── 1. Experience Watchdog ─────────────────────────────────── */
  var Watchdog = {
    max: 40,
    push: function (entry) {
      try {
        var s = load();
        s.errors = s.errors || [];
        s.errors.unshift({
          t: now(),
          build: BUILD,
          online: typeof navigator !== 'undefined' ? navigator.onLine : null,
          standalone:
            typeof window !== 'undefined' &&
            (window.matchMedia('(display-mode: standalone)').matches ||
              window.navigator.standalone === true),
          type: entry.type || 'error',
          message: String(entry.message || '').slice(0, 240),
          source: String(entry.source || '').slice(0, 120),
          view: (document.body && document.body.dataset && document.body.dataset.view) || null
        });
        if (s.errors.length > Watchdog.max) s.errors.length = Watchdog.max;
        save(s);
      } catch (e) {}
    },
    install: function () {
      if (Watchdog._on) return;
      Watchdog._on = true;
      window.addEventListener('error', function (ev) {
        Watchdog.push({
          type: 'js',
          message: (ev && (ev.message || (ev.error && ev.error.message))) || 'error',
          source: (ev && ev.filename) || ''
        });
      });
      window.addEventListener('unhandledrejection', function (ev) {
        var r = ev && ev.reason;
        Watchdog.push({
          type: 'promise',
          message: (r && (r.message || String(r))) || 'rejection'
        });
      });
    },
    report: function () {
      return (load().errors || []).slice(0, 20);
    }
  };

  /* ── 2. Offline Action Queue ────────────────────────────────── */
  var Queue = {
    key: 'queue',
    list: function () {
      var s = load();
      return Array.isArray(s[Queue.key]) ? s[Queue.key] : [];
    },
    set: function (arr) {
      var s = load();
      s[Queue.key] = arr.slice(0, 30);
      save(s);
    },
    enqueue: function (action) {
      if (!action || !action.type) return null;
      var id =
        action.id ||
        'q_' + now() + '_' + Math.random().toString(36).slice(2, 8);
      var item = {
        id: id,
        type: String(action.type).slice(0, 40),
        payload: action.payload || {},
        created: now(),
        tries: 0,
        status: 'pending'
      };
      // Never queue destructive/security actions
      if (/delete|broadcast|leader|pin|admin/i.test(item.type)) return null;
      var arr = Queue.list().filter(function (x) {
        return !(x.type === item.type && x.id === item.id);
      });
      arr.unshift(item);
      Queue.set(arr);
      return id;
    },
    markDone: function (id) {
      Queue.set(
        Queue.list().filter(function (x) {
          return x.id !== id;
        })
      );
    },
    markFail: function (id, permanent) {
      var arr = Queue.list().map(function (x) {
        if (x.id !== id) return x;
        x.tries = (x.tries || 0) + 1;
        x.status = permanent || x.tries >= 5 ? 'failed' : 'pending';
        x.lastErrorAt = now();
        return x;
      });
      Queue.set(arr);
    },
    flush: async function (handlers) {
      if (!navigator.onLine) return { ran: 0 };
      var arr = Queue.list().filter(function (x) {
        return x.status === 'pending';
      });
      var ran = 0;
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        var fn = handlers && handlers[item.type];
        if (typeof fn !== 'function') continue;
        try {
          await fn(item.payload, item);
          Queue.markDone(item.id);
          ran++;
        } catch (e) {
          Queue.markFail(item.id, false);
          Watchdog.push({
            type: 'queue',
            message: (e && e.message) || 'queue flush failed',
            source: item.type
          });
        }
      }
      return { ran: ran };
    }
  };

  /* ── 3. Data Integrity Guardian ─────────────────────────────── */
  var Integrity = {
    isIsoDate: function (s) {
      return typeof s === 'string' && s.length >= 8;
    },
    brother: function (row) {
      if (!row || typeof row !== 'object') return null;
      var name = String(row.name || row.display_name || '').trim();
      if (!name || name.length > 80) return null;
      return row;
    },
    announcement: function (row) {
      if (!row || typeof row !== 'object') return null;
      var title = String(row.title || '').trim();
      if (!title || title.length > 200) return null;
      return row;
    },
    memory: function (row) {
      if (!row || typeof row !== 'object') return null;
      if (!row.storage_path && !row.url && !row.photo) return null;
      return row;
    },
    preferNewer: function (localTs, remoteTs) {
      var a = Number(localTs) || 0;
      var b = Number(remoteTs) || 0;
      return b >= a ? 'remote' : 'local';
    },
    dedupeById: function (list, idKey) {
      var k = idKey || 'id';
      var seen = {};
      var out = [];
      (list || []).forEach(function (item) {
        if (!item) return;
        var id = item[k];
        if (id == null) {
          out.push(item);
          return;
        }
        if (seen[id]) return;
        seen[id] = 1;
        out.push(item);
      });
      return out;
    }
  };

  /* ── 4. Performance Governor ────────────────────────────────── */
  var Perf = {
    strained: false,
    noteLongTask: function (ms) {
      if (ms > 120) Perf.strained = true;
    },
    shouldReduceFx: function () {
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      } catch (e) {}
      return !!Perf.strained;
    },
    /** Temporary only — never strips Thunder, CTAs, or protected DNA */
    applyHints: function () {
      try {
        if (Perf.shouldReduceFx()) {
          document.documentElement.setAttribute('data-tb-perf', 'strain');
        } else {
          document.documentElement.removeAttribute('data-tb-perf');
        }
      } catch (e) {}
    }
  };

  /* ── 5. Media Optimization helpers ──────────────────────────── */
  var Media = {
    maxBytes: 6 * 1024 * 1024,
    allowed: /^image\/(jpeg|jpg|png|webp|gif)$/i,
    validateFile: function (file) {
      if (!file) return { ok: false, reason: 'No file' };
      if (file.size > Media.maxBytes) return { ok: false, reason: 'Image too large (max 6MB)' };
      if (file.type && !Media.allowed.test(file.type)) {
        return { ok: false, reason: 'Use a photo (JPEG, PNG, WebP)' };
      }
      return { ok: true };
    },
    /** Prefer existing app compressImageDataUrl when available */
    compress: function (dataUrl, maxW, quality) {
      if (typeof global.tbCompressImage === 'function') {
        return global.tbCompressImage(dataUrl, maxW, quality);
      }
      return Promise.resolve(dataUrl);
    }
  };

  /* ── 6. Privacy / Security Sentinel (client hygiene only) ────── */
  var Privacy = {
    scanClientConfig: function () {
      var issues = [];
      try {
        var cfg = global.TB_CONFIG || {};
        var blob = JSON.stringify(cfg);
        if (/service_role|SUPABASE_SERVICE|BEGIN RSA|sk-proj|xai-[a-z0-9]{20,}/i.test(blob)) {
          issues.push('Possible secret-shaped value in TB_CONFIG');
        }
        if (cfg.LEADER_PIN && String(cfg.LEADER_PIN).length > 0) {
          // Expected mild gate — not a finding, just note
        }
      } catch (e) {
        issues.push('config scan failed');
      }
      return issues;
    },
    install: function () {
      var issues = Privacy.scanClientConfig();
      if (issues.length) {
        Watchdog.push({ type: 'privacy', message: issues.join('; ') });
      }
    }
  };

  /* ── 7. Thunder Quality Guard ───────────────────────────────── */
  var ThunderQ = {
    maxQuestionChars: 500,
    sanitizeQuestion: function (q) {
      var s = String(q || '').trim().slice(0, ThunderQ.maxQuestionChars);
      return s;
    },
    /** Prefer local/facts path labels; caller still owns routing */
    shouldPreferLocal: function (q) {
      var s = String(q || '').toLowerCase();
      return (
        /next meeting|next gathering|when('s| is) (the )?(next|meeting)|crooked can|i'?m in|the code|mark 3:17|who can i call|rough night/.test(
          s
        )
      );
    },
    validateAnswer: function (text) {
      var t = String(text || '').trim();
      if (!t) return { ok: false, reason: 'empty' };
      if (t.length > 4000) t = t.slice(0, 4000) + '…';
      // Soft checks only — do not invent content
      return { ok: true, text: t };
    }
  };

  /* ── Orchestrator ───────────────────────────────────────────── */
  var Guardians = {
    Watchdog: Watchdog,
    Queue: Queue,
    Integrity: Integrity,
    Perf: Perf,
    Media: Media,
    Privacy: Privacy,
    ThunderQ: ThunderQ,
    health: function () {
      var s = load();
      return {
        build: BUILD,
        online: typeof navigator !== 'undefined' ? navigator.onLine : null,
        errors: (s.errors || []).length,
        queuePending: Queue.list().filter(function (x) {
          return x.status === 'pending';
        }).length,
        privacyIssues: Privacy.scanClientConfig(),
        lastSync: s.lastSync || null
      };
    },
    markSync: function () {
      var s = load();
      s.lastSync = now();
      save(s);
    },
    init: function () {
      Watchdog.install();
      Privacy.install();
      Perf.applyHints();
      window.addEventListener('online', function () {
        try {
          Queue.flush(Guardians._handlers || {});
        } catch (e) {}
      });
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && navigator.onLine) {
          try {
            Queue.flush(Guardians._handlers || {});
          } catch (e) {}
        }
      });
    },
    setHandlers: function (handlers) {
      Guardians._handlers = handlers || {};
    }
  };

  global.TBGuardians = Guardians;
})(typeof window !== 'undefined' ? window : this);
