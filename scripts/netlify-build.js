#!/usr/bin/env node
/* Thunder Board is a static PWA. Netlify must not run a real compile.
   Never-white: refuse to publish if index.html was cut off.
   20260826-repair1: apply the exact seat-claim patch to js/app.js at publish if needed. */
const fs = require('fs');
const { execSync } = require('child_process');
const html = fs.readFileSync('index.html', 'utf8');
if (html.length < 45000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
  console.error('REFUSE: index.html is incomplete (' + html.length + ' bytes). Will not publish a white screen.');
  process.exit(1);
}
const app = fs.readFileSync('js/app.js');
if (app.indexOf('20260826-repair1: no full reload') === -1) {
  if (!fs.existsSync('.github/repair1-app.js.patch')) {
    console.error('REFUSE: app.js missing repair1 stamp and patch file is gone.');
    process.exit(1);
  }
  execSync('patch -p0 < .github/repair1-app.js.patch', { stdio: 'inherit' });
}
const app2 = fs.readFileSync('js/app.js');
if (app2.indexOf('20260826-repair1: no full reload') === -1 || app2.indexOf("softRefreshApp('Signed in") !== -1) {
  console.error('REFUSE: app.js repair1 seat-claim patch did not land.');
  process.exit(1);
}
process.stdout.write('Thunder Board: static publish (' + html.length + ' bytes, homepage whole, app.js ' + app2.length + ')\n');
process.exit(0);
