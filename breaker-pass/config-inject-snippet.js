/* PASTE into js/config.js addCss/addJs IIFE. Do not replace the file.
   Pulse: 20260831-breaker-pass
   Put tb-sb-one BEFORE breaker-pass. Do not add a second copy of any line. */

addCss('breaker-pass.css', 'css/breaker-pass.css');
addJs('tb-sb-one.js', 'js/tb-sb-one.js');
addJs('breaker-pass.js', 'js/breaker-pass.js');
addJs('attendance.js', 'js/attendance.js');
addJs('members-one.js', 'js/members-one.js');
addJs('founder-ping.js', 'js/founder-ping.js');

/* Identity only, if you stamp a build:
   APP_BUILD: '20260831-breaker-pass'
   Do not recook home-pull, first-paint, or app.js. */
