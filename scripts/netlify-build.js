#!/usr/bin/env node
/* Thunder Board is a static PWA. Netlify must not run a real compile.
   Never-white: refuse to publish if index.html was cut off.
   20260826-repair1: apply the exact seat-claim patch to js/app.js at publish if needed.
   20260826-month9: expose getSb + currentUser so THIS MONTH can use the chair session.
   20260827-sdk1: restore a whole homepage if GitHub has a stub, then land local supabase script tag. */
const fs = require('fs');
const { execSync } = require('child_process');
function loadHtml() {
  return fs.readFileSync('index.html', 'utf8');
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
  if (html.indexOf('/js/supabase.min.js?v=20260827-sdk1') === -1 || html.length < 50000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
    console.error('REFUSE: sdk1 script tag did not land cleanly (' + html.length + ' bytes).');
    process.exit(1);
  }
}
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
process.stdout.write('Thunder Board: static publish (' + html.length + ' bytes, homepage whole, app.js ' + app2.length + ', getSb exposed, sdk1 supabase tag)\n');
process.exit(0);
