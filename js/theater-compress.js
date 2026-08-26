/* Patio plate cooker. iPhone HEVC in, H.264 1080/30 out, under 50 MB. Leader only. */
(function (w) {
  if (w.tbCookTheaterPlate) return;

  var MAX = 50 * 1024 * 1024;
  var TARGET_BPS = 5500000;
  var FPS = 30;
  var MAX_SEC = 60;
  var MUX_URL = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/+esm';

  function even(n) { n = Math.round(n); return n - (n % 2); }

  function sizeFor(v) {
    var w = v.videoWidth || 1080;
    var h = v.videoHeight || 1920;
    if (w > 1080) { var s = 1080 / w; w = 1080; h = h * s; }
    if (h > 1920) { var s2 = 1920 / h; h = 1920; w = w * s2; }
    return { w: even(w), h: even(h) };
  }

  function loadVideo(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.preload = 'auto';
      v.src = url;
      var done = false;
      v.onloadedmetadata = function () {
        if (done) return;
        done = true;
        resolve({ v: v, url: url });
      };
      v.onerror = function () {
        try { URL.revokeObjectURL(url); } catch (e) {}
        reject(new Error('Could not read that clip'));
      };
      setTimeout(function () {
        if (done) return;
        done = true;
        reject(new Error('Clip took too long to open'));
      }, 8000);
    });
  }

  async function cook(file, status) {
    if (!w.VideoEncoder || !w.VideoFrame) throw new Error('This phone cannot cook the plate');
    status('Cooking the plate\u2026');
    var muxMod = await import(MUX_URL);
    var Muxer = muxMod.Muxer || (muxMod.default && muxMod.default.Muxer);
    var ArrayBufferTarget = muxMod.ArrayBufferTarget || (muxMod.default && muxMod.default.ArrayBufferTarget);
    if (!Muxer || !ArrayBufferTarget) throw new Error('Cooker failed to load');

    var loaded = await loadVideo(file);
    var v = loaded.v;
    var srcUrl = loaded.url;
    var dur = Math.min(Number(v.duration) || 0, MAX_SEC);
    if (!dur || dur < 1) {
      try { URL.revokeObjectURL(srcUrl); } catch (e0) {}
      throw new Error('Keep it to a minute');
    }
    var dim = sizeFor(v);
    var target = new ArrayBufferTarget();
    var muxer = new Muxer({
      target: target,
      video: { codec: 'avc', width: dim.w, height: dim.h },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset'
    });

    var encoder = new VideoEncoder({
      output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); },
      error: function (err) { console.warn('plate encode', err); }
    });
    encoder.configure({
      codec: 'avc1.640028',
      width: dim.w,
      height: dim.h,
      bitrate: TARGET_BPS,
      framerate: FPS,
      latencyMode: 'quality',
      hardwareAcceleration: 'prefer-hardware',
      avc: { format: 'avc' }
    });

    v.muted = false;
    v.volume = 0;
    try { await v.play(); } catch (ePlay) { v.muted = true; await v.play(); }

    var lastPct = -1;
    var lastKey = 0;
    await new Promise(function (resolve, reject) {
      var stop = false;
      var finish = function () {
        if (stop) return;
        stop = true;
        try { v.pause(); } catch (e1) {}
        resolve();
      };
      var onFrame = function () {
        if (stop) return;
        try {
          var t = v.currentTime || 0;
          if (v.ended || t >= dur) { finish(); return; }
          var ts = Math.round(t * 1e6);
          var frame = new VideoFrame(v, { timestamp: ts, duration: Math.round(1e6 / FPS) });
          var key = (t - lastKey) >= 1 || t < 0.05;
          if (key) lastKey = t;
          encoder.encode(frame, { keyFrame: key });
          frame.close();
          var pct = Math.min(99, Math.round((t / dur) * 100));
          if (pct !== lastPct && pct % 5 === 0) {
            lastPct = pct;
            status('Cooking the plate\u2026 ' + pct + '%');
          }
        } catch (eFrame) {
          finish();
          reject(eFrame);
          return;
        }
        if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(onFrame);
        else setTimeout(onFrame, 1000 / FPS);
      };
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(onFrame);
      else setTimeout(onFrame, 40);
      setTimeout(function () { finish(); }, (dur + 2) * 1000);
    });

    await encoder.flush();
    encoder.close();
    muxer.finalize();
    try { URL.revokeObjectURL(srcUrl); } catch (e2) {}
    var blob = new Blob([target.buffer], { type: 'video/mp4' });
    if (!blob.size) throw new Error('Cooker made an empty plate');
    return blob;
  }

  w.tbCookTheaterPlate = async function (file, status) {
    status = status || function () {};
    if (!file) throw new Error('Choose a clip first');
    var name = String(file.name || '').toLowerCase();
    var type = String(file.type || '').toLowerCase();
    var alreadySmall = file.size <= MAX;
    var looksCooked = type.indexOf('avc') !== -1 || (/\.mp4$/i.test(name) && file.size < 40 * 1024 * 1024);
    if (alreadySmall && looksCooked) return file;
    try {
      var plate = await cook(file, status);
      if (plate.size > MAX) {
        if (alreadySmall) return file;
        throw new Error('Still over 50 MB. Shoot HD 30, not 4K.');
      }
      if (plate.size < 20 * 1024 && alreadySmall) return file;
      status('Plate is ready');
      return plate;
    } catch (err) {
      if (alreadySmall) return file;
      throw err;
    }
  };
})(window);
