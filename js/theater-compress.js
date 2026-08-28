(function (w) {
  w.tbCookTheaterPlate = null;

  var MAX = 50 * 1024 * 1024;
  var TARGET_BPS = 5500000;
  var FPS = 30;
  var MAX_SEC = 60;
  var PW = 1080;
  var PH = 1920;
  var MUX_URL = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/+esm';

  function ftypBrand(buf) {
    try {
      var u = new Uint8Array(buf);
      if (u.length < 12) return '';
      if (String.fromCharCode(u[4], u[5], u[6], u[7]) !== 'ftyp') return '';
      return String.fromCharCode(u[8], u[9], u[10], u[11]);
    } catch (e0) { return ''; }
  }

  function sniffHevc(buf) {
    try {
      var s = '';
      var u = new Uint8Array(buf);
      var n = Math.min(u.length, 256);
      for (var i = 0; i < n; i++) s += String.fromCharCode(u[i]);
      return /hev1|hvc1|qt  /.test(s);
    } catch (e1) { return false; }
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

  async function alreadyPlate(file) {
    if (!file || file.size > MAX) return false;
    var name = String(file.name || '').toLowerCase();
    if (name.slice(-4) === '.mov') return false;
    var buf = await file.slice(0, 256).arrayBuffer();
    if (sniffHevc(buf)) return false;
    var brand = ftypBrand(buf);
    if (!(brand === 'isom' || brand === 'mp41' || brand === 'mp42' || brand === 'avc1' || brand === 'iso2')) return false;
    var loaded = await loadVideo(file);
    try { URL.revokeObjectURL(loaded.url); } catch (e0) {}
    var w0 = loaded.v.videoWidth || 0;
    var h0 = loaded.v.videoHeight || 0;
    return w0 === PW && h0 === PH;
  }

  async function cook(file, status) {
    if (!w.VideoEncoder || !w.VideoFrame) throw new Error('This phone cannot cook the plate. Drop it in the kitchen.');
    status('Cooking the plate…');
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
      throw new Error('Keep it to a minute.');
    }

    var canvas = document.createElement('canvas');
    canvas.width = PW;
    canvas.height = PH;
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not draw the frame.');

    function padDraw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, PW, PH);
      var vw = v.videoWidth || PW;
      var vh = v.videoHeight || PH;
      var sc = Math.min(PW / vw, PH / vh);
      var dw = vw * sc;
      var dh = vh * sc;
      ctx.drawImage(v, (PW - dw) / 2, (PH - dh) / 2, dw, dh);
    }

    var target = new ArrayBufferTarget();
    var muxer = new Muxer({
      target: target,
      video: { codec: 'avc', width: PW, height: PH },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset'
    });

    var encoder = new VideoEncoder({
      output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); },
      error: function (e) { console.warn('plate encoder', e && e.message); }
    });
    encoder.configure({
      codec: 'avc1.42001E',
      width: PW,
      height: PH,
      bitrate: TARGET_BPS,
      framerate: FPS,
      latencyMode: 'quality',
      hardwareAcceleration: 'prefer-hardware',
      avc: { format: 'avc' }
    });

    v.muted = true;
    try { await v.play(); } catch (ePlay) {}

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
          padDraw();
          var ts = Math.round(t * 1e6);
          var frame = new VideoFrame(canvas, { timestamp: ts, duration: Math.round(1e6 / FPS) });
          var key = (t - lastKey) >= 1 || t < 0.05;
          if (key) lastKey = t;
          encoder.encode(frame, { keyFrame: key });
          frame.close();
          var pct = Math.min(99, Math.round((t / dur) * 100));
          if (pct !== lastPct && pct % 5 === 0) {
            lastPct = pct;
            status('Cooking the plate… ' + pct + '%');
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
    try {
      if (await alreadyPlate(file)) {
        status('Already a plate.');
        return file;
      }
    } catch (eA) {}
    var plate = await cook(file, status);
    if (plate.size > MAX) throw new Error('Still over 50 MB. Shoot HD 30, not 4K.');
    if (plate.size < 20 * 1024) throw new Error('Encode was empty. Drop the clip in the kitchen.');
    status('Plate is ready');
    return plate;
  };

  w.tbEncodeHomePlate = function (file, status) {
    return w.tbCookTheaterPlate(file, status).then(function (out) {
      if (out && out.name === 'current.mp4') return out;
      return new File([out], 'current.mp4', { type: 'video/mp4' });
    });
  };
})(window);
