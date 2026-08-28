#!/usr/bin/env node
/* Thunder Board is a static PWA. Netlify must not run a real compile.
   Never-white: refuse to publish if index.html was cut off.
   20260826-repair1 / month9 / sdk1 / legal1 / room1 / axum2 / seat-lock / refresh-bust. */
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
function cutButton(html, id) {
  var needle = 'id="' + id + '"';
  var i = html.indexOf(needle);
  if (i === -1) return html;
  var start = html.lastIndexOf('<button', i);
  var end = html.indexOf('</button>', i);
  if (start === -1 || end === -1) return html;
  return html.slice(0, start) + html.slice(end + 9);
}
function cutAllButtons(html, id) {
  var guard = 0;
  while (html.indexOf('id="' + id + '"') !== -1 && guard < 8) {
    var next = cutButton(html, id);
    if (next === html) break;
    html = next;
    guard += 1;
  }
  return html;
}
function replaceInputById(html, id, neu) {
  var needle = 'id="' + id + '"';
  var i = html.indexOf(needle);
  if (i === -1) return html;
  var start = html.lastIndexOf('<input', i);
  var end = html.indexOf('>', i);
  if (start === -1 || end === -1) return html;
  return html.slice(0, start) + neu + html.slice(end + 1);
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
if (fs.existsSync('.github/axum-drop-card.html')) {
  var dropStart = html.indexOf('<div id="axum-drop"');
  var dropEnd = dropStart === -1 ? -1 : sliceDiv(html, dropStart);
  var cardStart = html.indexOf('<div id="axum-card"');
  var cardEnd = cardStart === -1 ? -1 : sliceDiv(html, cardStart);
  var blocks = fs.readFileSync('.github/axum-drop-card.html', 'utf8').replace(/\s+$/, '');
  if (dropStart !== -1 && dropEnd !== -1 && cardStart !== -1 && cardEnd !== -1 && cardStart >= dropEnd) {
    html = html.slice(0, dropStart) + blocks + html.slice(cardEnd);
    fs.writeFileSync('index.html', html);
    html = loadHtml();
  } else if (html.indexOf('HOLD TO REDEEM') === -1) {
    var rf = html.indexOf('<!-- LIVE RAFFLE');
    if (rf === -1) rf = html.indexOf('<div id="raffle-live"');
    if (rf !== -1) {
      html = html.slice(0, rf) + blocks + '\n\n  ' + html.slice(rf);
      fs.writeFileSync('index.html', html);
      html = loadHtml();
    }
  }
}
html = cutAllButtons(html, 'text-leader-btn');
var vg = html.indexOf('id="brothers-grid"');
if (vg !== -1) {
  var vgStart = html.lastIndexOf('<div', vg);
  var afterGrid = sliceDiv(html, vgStart);
  if (afterGrid !== -1) {
    html = html.slice(0, afterGrid) + '\n          <button type="button" id="text-leader-btn" class="btn-text-leader">TEXT A LEADER</button>' + html.slice(afterGrid);
    fs.writeFileSync('index.html', html);
    html = loadHtml();
  }
}
html = cutButton(html, 'admin-lastfire-btn');
fs.writeFileSync('index.html', html);
html = loadHtml();
if (html.indexOf('id="who-we-are-kicker"') === -1) {
  var who = html.indexOf('<h1 class="about-title">WHO WE ARE</h1>');
  if (who !== -1) {
    var p1 = html.indexOf('<p class="about-text">', who);
    var p2 = html.indexOf('<p class="about-text about-text-2">', who);
    var p2end = p2 === -1 ? -1 : html.indexOf('</p>', p2);
    if (p1 !== -1 && p2 !== -1 && p2end !== -1) {
      var paras = html.slice(p1, p2end + 4);
      var wrapped =
        '<h1 class="about-title" id="who-we-are-title">WHO WE ARE</h1>\n          ' +
        '<button type="button" id="who-we-are-kicker" class="about-kicker">Wild men. Need brothers.</button>\n          ' +
        '<div id="who-we-are-body" class="who-we-are-body">\n          ' +
        paras +
        '\n          </div>';
      html = html.slice(0, who) + wrapped + html.slice(p2end + 4);
      fs.writeFileSync('index.html', html);
      html = loadHtml();
    }
  }
}
html = replaceInputById(html, 'auth-password', '<input type="password" id="auth-password" name="password" placeholder="Password" autocomplete="new-password" />');
html = replaceInputById(html, 'auth-email', '<input type="email" id="auth-email" name="email" placeholder="Email" autocomplete="username" inputmode="email" required />');
html = replaceInputById(html, 'auth-phone', '<input type="tel" id="auth-phone" name="tel" placeholder="Phone" autocomplete="tel" inputmode="tel" maxlength="20" />');
fs.writeFileSync('index.html', html);
html = loadHtml();
var homeView = html.indexOf('id="view-home"');
var brosView = html.indexOf('id="view-brothers"');
var homeChunk = (homeView !== -1 && brosView !== -1) ? html.slice(homeView, brosView) : '';
if (homeChunk.indexOf('id="text-leader-btn"') !== -1) {
  console.error('REFUSE: text-leader still on Home');
  process.exit(1);
}
var brosEnd = brosView === -1 ? -1 : html.indexOf('</section>', brosView);
var brosChunk = (brosView !== -1 && brosEnd !== -1) ? html.slice(brosView, brosEnd) : '';
if (brosChunk.indexOf('id="text-leader-btn"') === -1) {
  console.error('REFUSE: text-leader missing on Brothers');
  process.exit(1);
}
var stamp = '1';
try {
  var bj = JSON.parse(fs.readFileSync('build.json', 'utf8'));
  if (bj && bj.APP_BUILD) stamp = String(bj.APP_BUILD);
} catch (eStamp) {}
html = html.replace(/\/js\/config\.js\?v=[^"'>\s]+/g, '/js/config.js?v=' + stamp);
html = html.replace(/\/js\/app\.js\?v=[^"'>\s]+/g, '/js/app.js?v=' + stamp);
fs.writeFileSync('index.html', html);
html = loadHtml();
if (html.length < 50000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
  console.error('REFUSE: homepage broke after lump splice (' + html.length + ' bytes).');
  process.exit(1);
}
var tmjs = fs.readFileSync('js/theater-month.js', 'utf8');
var oldNeed =
  "function needSeat() {\n    if (chairFromApp()) {\n      showWritePass(false);\n      status('Chair ready');\n      return;\n    }\n    showWritePass(true);";
var newNeed = "function needSeat() {\n    showWritePass(true);";
if (tmjs.indexOf(oldNeed) !== -1) {
  fs.writeFileSync('js/theater-month.js', tmjs.replace(oldNeed, newNeed));
}
let cfg = fs.readFileSync('js/config.js', 'utf8');
var cfgDirty = false;
function ensureLine(needle, after, insert) {
  if (cfg.indexOf(needle) !== -1) return;
  if (cfg.indexOf(after) !== -1) {
    cfg = cfg.replace(after, after + '\n    ' + insert);
    cfgDirty = true;
  }
}
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
ensureLine("addCss('text-leader-brothers.css'", "addJs('axum-wire.js', 'js/axum-wire.js');", "addCss('text-leader-brothers.css', 'css/text-leader-brothers.css');");
ensureLine("addJs('text-leader-brothers.js'", "addCss('text-leader-brothers.css', 'css/text-leader-brothers.css');", "addJs('text-leader-brothers.js', 'js/text-leader-brothers.js');");
ensureLine("addJs('text-leader-quiet.js'", "addJs('text-leader-brothers.js', 'js/text-leader-brothers.js');", "addJs('text-leader-quiet.js', 'js/text-leader-quiet.js');");
ensureLine("addCss('axum-loot.css'", "addJs('axum-wire.js', 'js/axum-wire.js');", "addCss('axum-loot.css', 'css/axum-loot.css');");
ensureLine("addCss('brothers-seat.css'", "addCss('axum-loot.css', 'css/axum-loot.css');", "addCss('brothers-seat.css', 'css/brothers-seat.css');");
ensureLine("addCss('memories-tight.css'", "addCss('brothers-seat.css', 'css/brothers-seat.css');", "addCss('memories-tight.css', 'css/memories-tight.css');");
ensureLine("addCss('code-tight.css'", "addCss('memories-tight.css', 'css/memories-tight.css');", "addCss('code-tight.css', 'css/code-tight.css');");
ensureLine("addJs('code-tight.js'", "addCss('code-tight.css', 'css/code-tight.css');", "addJs('code-tight.js', 'js/code-tight.js');");
ensureLine("addCss('auth-seat.css'", "addJs('theater-month.js', 'js/theater-month.js');", "addCss('auth-seat.css', 'css/auth-seat.css');");
ensureLine("addJs('auth-seat.js'", "addCss('auth-seat.css', 'css/auth-seat.css');", "addJs('auth-seat.js', 'js/auth-seat.js');");
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
process.stdout.write('Thunder Board: static publish (' + html.length + ' bytes, homepage whole, app.js ' + app2.length + ', seat-lock)\n');
process.exit(0);
