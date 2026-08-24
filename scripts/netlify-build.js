#!/usr/bin/env node
/* Thunder Board is a static PWA. Netlify must not run a real compile.
   Never-white: refuse to publish if index.html was cut off. */
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
if (html.length < 45000 || html.indexOf('</html>') === -1 || html.indexOf("I'M IN") === -1) {
  console.error('REFUSE: index.html is incomplete (' + html.length + ' bytes). Will not publish a white screen.');
  process.exit(1);
}
process.stdout.write('Thunder Board: static publish (' + html.length + ' bytes, homepage whole)\n');
process.exit(0);
