(function () {
  if (window.__tbProofPipe) return;
  window.__tbProofPipe = true;

  var rawFile = null;
  var cookedBlob = null;
  var cookedUrl = null;

  function $(id) { return document.getElementById(id); }

  function status(msg) {
    var el = $('tb-proof-status');
    if (el) el.textContent = msg || '';
  }

  function closePipe() {
    var box = $('tb-proof-pipe');
    if (box) box.classList.remove('is-on');
    rawFile = null;
    cookedBlob = null;
    if (cookedUrl) { try { URL.revokeObjectURL(cookedUrl); } catch (e) {} }
    cookedUrl = null;
    var img = $('tb-proof-pipe-img');
    if (img) img.removeAttribute('src');
    status('');
  }

  function compress(file) {
    return new Promise(function (resolve, reject) {
      if (!file || file.size > 12 * 1024 * 1024) {
        reject(new Error('Choose a smaller photo.'));
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var max = 1200;
          if (w > max || h > max) {
            var s = Math.min(max / w, max / h);
            w = Math.round(w * s);
            h = Math.round(h * s);
          }
          var c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          c.toBlob(function (blob) {
            try { URL.revokeObjectURL(url); } catch (e1) {}
            if (!blob) reject(new Error('Could not cook that photo.'));
            else resolve(blob);
          }, 'image/jpeg', 0.72);
        } catch (e2) {
          try { URL.revokeObjectURL(url); } catch (e3) {}
          reject(e2);
        }
      };
      img.onerror = function () {
        try { URL.revokeObjectURL(url); } catch (e4) {}
        reject(new Error('Could not read that photo.'));
      };
      img.src = url;
    });
  }

  function mount() {
    if ($('tb-proof-pipe')) return;
    var box = document.createElement('div');
    box.id = 'tb-proof-pipe';
    box.innerHTML =
      '<img id="tb-proof-pipe-img" alt="">' +
      '<div id="tb-proof-status"></div>' +
      '<div id="tb-proof-pipe-bar">' +
      '<button type="button" id="tb-proof-cancel">CANCEL</button>' +
      '<button type="button" id="tb-proof-use">USE THIS</button>' +
      '</div>';
    document.body.appendChild(box);
    $('tb-proof-cancel').addEventListener('click', closePipe);
    $('tb-proof-use').addEventListener('click', persist);
    var input = document.createElement('input');
    input.type = 'file';
    input.id = 'tb-proof-input';
    input.accept = 'image/*';
    input.setAttribute('style', 'position:absolute;left:-9999px;opacity:0;width:1px;height:1px;');
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      rawFile = input.files && input.files[0];
      input.value = '';
      if (!rawFile) return;
      status('COOKING…');
      compress(rawFile).then(function (blob) {
        cookedBlob = blob;
        cookedUrl = URL.createObjectURL(blob);
        var img = $('tb-proof-pipe-img');
        if (img) img.src = cookedUrl;
        status('USE THIS or CANCEL');
        box.classList.add('is-on');
      }).catch(function (err) {
        closePipe();
        alert((err && err.message) || 'Could not cook that photo.');
      });
    });
  }

  function persist() {
    if (!cookedBlob) return;
    var dest = $('media-file');
    var save = $('save-media');
    if (!dest || !save) {
      alert('Memory save is not on this build.');
      return;
    }
    try {
      var file = new File([cookedBlob], 'memory.jpg', { type: 'image/jpeg' });
      var dt = new DataTransfer();
      dt.items.add(file);
      dest.files = dt.files;
    } catch (e) {
      alert('This phone could not hand the cooked photo to Memories.');
      return;
    }
    status('UPLOADING…');
    var before = save.textContent;
    save.click();
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (!save.disabled && save.textContent === 'Add to Memories' && n > 2) {
        clearInterval(t);
        closePipe();
      }
      if (n > 80) {
        clearInterval(t);
        status('Still working… if nothing posts, sign in under Brothers and try again.');
      }
    }, 200);
  }

  function openChoose() {
    mount();
    var input = $('tb-proof-input');
    if (input) input.click();
  }

  function wire() {
    var line = document.querySelector('#view-events .events-hit-line');
    if (!line || line.dataset.tbPipe === '1') return;
    line.dataset.tbPipe = '1';
    line.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openChoose();
    }, true);
  }

  mount();
  wire();
  setTimeout(wire, 400);
  document.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('[data-view="events"], #nav-events')) {
      setTimeout(wire, 40);
    }
  }, true);
})();
