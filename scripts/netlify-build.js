#!/usr/bin/env node
/* Thunder Board is a static PWA. Netlify must not run a real compile.
   Never-white: refuse to publish if index.html was cut off.
   20260826-repair1 / month9 / sdk1 / legal1 / room1 / axum1. */
const fs = require('fs');
const { execSync } = require('child_process');
function loadHtml() {
  return fs.readFileSync('index.html', 'utf8');
}
function sliceDiv(html, start) {
  var i = start, depth = 0;
  while (i < html.length) {
    var nxtOpen = html.indexOf('<div', i);
    var nxtClose = html.indexOf('</div>', i);
    if (nxtClose === -1) return -1;
    if (nxtOpen !== -1 && nxtOpen < nxtClose) { depth += 1; i = nxtOpen + 4; }
    else { depth -= 1; i = nxtClose + 6; if (depth === 0) return i; }
  }
  return -1;
}
let html = loadHtml();
if (html.length < 45000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
  console.warn('index.html is a stub (' + html.length + ' bytes). Restoring from live.');
  execSync('curl -fsS https://sonsofthunder.netlify.app/ -o index.html', { stdio: 'inherit' });
  html = loadHtml();
  if (html.length < 45000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
    console.error('REFUSE: could not restore a whole homepage (' + html.length + ' bytes).');
    process.exit(1);
  }
}
if (html.indexOf('/js/supabase.min.js?v=20260827-sdk1') === -1) {
  var cdnPkg = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>';
  var cdnUmd = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>';
  var local = '<script src="/js/supabase.min.js?v=20260827-sdk1"></script>';
  if (html.indexOf(cdnPkg) !== -1) {
    html = html.replace(cdnPkg, local + '\n  ' + cdnPkg);
  } else if (html.indexOf(cdnUmd) !== -1) {
    html = html.replace(cdnUmd, local + '\n  ' + cdnUmd);
  } else {
    console.error('REFUSE: supabase CDN script not found, cannot insert sdk1 tag.');
    process.exit(1);
  }
  fs.writeFileSync('index.html', html);
  html = loadHtml();
}
var legalOpen = html.indexOf('<p id="tb-legal-row"');
if (legalOpen !== -1) {
  var legalClose = html.indexOf('</p>', legalOpen);
  if (legalClose !== -1) {
    var legalBlock = html.slice(legalOpen, legalClose + 4);
    var without = html.slice(0, legalOpen) + html.slice(legalClose + 4);
    var lastTools = -1;
    var searchFrom = without.indexOf('<div class="more-tools">');
    if (searchFrom !== -1) lastTools = sliceDiv(without, searchFrom);
    if (lastTools !== -1) {
      html = without.slice(0, lastTools) + '\n            ' + legalBlock.trim() + without.slice(lastTools);
      fs.writeFileSync('index.html', html);
      html = loadHtml();
    }
  }
}
if (html.indexOf('class="room-steps"') === -1 && fs.existsSync('.github/room-night-modal.html')) {
  var roomStart = html.indexOf('<div id="admin-room-modal"');
  var roomEnd = roomStart === -1 ? -1 : sliceDiv(html, roomStart);
  if (roomStart !== -1 && roomEnd !== -1) {
    var neu = fs.readFileSync('.github/room-night-modal.html', 'utf8').replace(/\s+$/, '');
    html = html.slice(0, roomStart) + neu + html.slice(roomEnd);
    fs.writeFileSync('index.html', html);
    html = loadHtml();
  }
}
if (html.indexOf('id="axum-chip"') === -1 && fs.existsSync('.github/axum-chip.html')) {
  var chip = fs.readFileSync('.github/axum-chip.html', 'utf8').trim();
  var lf = html.indexOf('<!-- Last Fire:');
  if (lf === -1) lf = html.indexOf('<div id="last-fire"');
  if (lf !== -1) {
    html = html.slice(0, lf) + chip + '\n          ' + html.slice(lf);
    fs.writeFileSync('index.html', html);
    html = loadHtml();
  }
}
if (html.indexOf('id="axum-card"') === -1 && fs.existsSync('.github/axum-drop-card.html')) {
  var blocks = fs.readFileSync('.github/axum-drop-card.html', 'utf8').replace(/\s+$/, '');
  var rf = html.indexOf('<!-- LIVE RAFFLE');
  if (rf === -1) rf = html.indexOf('<div id="raffle-live"');
  if (rf !== -1) {
    html = html.slice(0, rf) + blocks + '\n\n  ' + html.slice(rf);
    fs.writeFileSync('index.html', html);
    html = loadHtml();
  }
}
if (html.length < 50000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
  console.error('REFUSE: homepage broke after axum/legal/room splice (' + html.length + ' bytes).');
  process.exit(1);
}
let cfg = fs.readFileSync('js/config.js', 'utf8');
var cfgDirty = false;
if (cfg.indexOf("addCss('more-legal.css'") === -1 && cfg.indexOf('function addCss') !== -1) {
  cfg = cfg.replace("addJs('more-legal.js', 'js/more-legal.js');", "addCss('more-legal.css', 'css/more-legal.css');\n    addJs('more-legal.js', 'js/more-legal.js');");
  cfgDirty = true;
}
if (cfg.indexOf("addCss('room-night.css'") === -1 && cfg.indexOf('function addCss') !== -1) {
  cfg = cfg.replace("addJs('more-legal.js', 'js/more-legal.js');", "addJs('more-legal.js', 'js/more-legal.js');\n    addCss('room-night.css', 'css/room-night.css');\n    addJs('room-night.js', 'js/room-night.js');");
  cfgDirty = true;
}
if (cfg.indexOf("addJs('axum-wire.js'") === -1 && cfg.indexOf('function addJs') !== -1) {
  if (cfg.indexOf("addJs('room-night.js'") !== -1) {
    cfg = cfg.replace("addJs('room-night.js', 'js/room-night.js');", "addJs('room-night.js', 'js/room-night.js');\n    addJs('axum-wire.js', 'js/axum-wire.js');");
  } else {
    cfg = cfg.replace("addJs('more-legal.js', 'js/more-legal.js');", "addJs('more-legal.js', 'js/more-legal.js');\n    addJs('axum-wire.js', 'js/axum-wire.js');");
  }
  cfgDirty = true;
}
if (cfgDirty) fs.writeFileSync('js/config.js', cfg);
const app = fs.readFileSync('js/app.js');
if (app.indexOf('20260826-repair1: no full reload') === -1) {
  if (!fs.existsSync('.github/repair1-app.js.patch')) {
    console.error('REFUSE: app.js missing repair1 stamp and patch file is gone.');
    process.exit(1);
  }
  execSync('patch -p0 < .github/repair1-app.js.patch', { stdio: 'inherit' });
}
let src = fs.readFileSync('js/app.js', 'utf8');
if (src.indexOf('20260826-repair1: no full reload') === -1 || src.indexOf("softRefreshApp('Signed in") !== -1) {
  console.error('REFUSE: app.js repair1 seat-claim patch did not land.');
  process.exit(1);
}
if (src.indexOf('window.getSb = getSb') === -1) {
  if (src.indexOf('function getSb() {') === -1) {
    console.error('REFUSE: getSb missing, cannot expose chair session.');
    process.exit(1);
  }
  src = src.replace('function getSb() {', 'function getSb() { window.getSb = getSb; if (typeof currentUser === \'function\') window.currentUser = currentUser;');
  src = src.replace('function currentUser() {', 'function currentUser() { window.currentUser = currentUser; if (typeof getSb === \'function\') window.getSb = getSb;');
  fs.writeFileSync('js/app.js', src);
}
const app2 = fs.readFileSync('js/app.js', 'utf8');
if (app2.indexOf('window.getSb = getSb') === -1) {
  console.error('REFUSE: window.getSb expose did not land.');
  process.exit(1);
}
process.stdout.write('Thunder Board: static publish (' + html.length + ' bytes, homepage whole, app.js ' + app2.length + ', sdk1 legal1 room1 axum1)\n');
process.exit(0);
