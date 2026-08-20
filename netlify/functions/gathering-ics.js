/**
 * Live gathering.ics — next Monday (holiday-aware) + VALARM 7d / 1d / 2h.
 * Subscribe via webcal://…/gathering.ics so native Calendar owns the alarms.
 */
exports.handler = async () => {
  const ics = buildIcs(nextGathering(new Date()));
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="sons-of-thunder.ics"',
      'Cache-Control': 'no-store'
    },
    body: ics
  };
};

function pad(n) { return String(n).padStart(2, '0'); }
function stamp(d) {
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}
function firstMonday(year, month) {
  const d = new Date(year, month, 1, 12, 0, 0);
  d.setDate(1 + ((8 - d.getDay()) % 7));
  return d;
}
function isLaborDay(date) {
  return date.getMonth() === 8 && date.getDate() === firstMonday(date.getFullYear(), 8).getDate();
}
function isMemorialDay(date) {
  if (date.getMonth() !== 4) return false;
  const last = new Date(date.getFullYear(), 4, 31, 12, 0, 0);
  last.setDate(31 - ((last.getDay() + 6) % 7));
  return date.getDate() === last.getDate();
}
function meetingMondayOf(year, month) {
  const first = firstMonday(year, month);
  if (isLaborDay(first) || isMemorialDay(first)) {
    const second = new Date(first);
    second.setDate(first.getDate() + 7);
    return second;
  }
  return first;
}
function nextGathering(from) {
  const now = new Date(from);
  let y = now.getFullYear();
  let m = now.getMonth();
  let candidate = meetingMondayOf(y, m);
  const moment = new Date(candidate);
  moment.setHours(18, 30, 0, 0);
  if (now >= moment) {
    m += 1;
    if (m > 11) { m = 0; y += 1; }
    candidate = meetingMondayOf(y, m);
  }
  return candidate;
}
function buildIcs(meet) {
  const start = new Date(meet);
  start.setHours(18, 30, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const uid = 'thunder-gathering@sonsofthunder.netlify.app';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sons of Thunder//Thunder Board//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Sons of Thunder',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + stamp(new Date()) + 'Z',
    'DTSTART:' + stamp(start),
    'DTEND:' + stamp(end),
    'SUMMARY:Sons of Thunder — Next Gathering',
    'DESCRIPTION:Sons of Thunder monthly gathering. Crooked Can Brewery Patio\\, Winter Garden. 6:30 PM.',
    'LOCATION:Crooked Can Brewery Patio, Winter Garden',
    'URL:https://sonsofthunder.netlify.app/',
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    'DESCRIPTION:One week out. Sons of Thunder gathers next Monday.',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Tomorrow — Sons of Thunder.',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Two hours. See you at the gathering.',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
