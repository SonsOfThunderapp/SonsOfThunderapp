THUNDER BOARD — BREAKER PASS
Pulse: 20260831-breaker-pass
One diner ticket. Seven spaces. No museum.

This zip is the finalization pour. It protects the gathering card
and the red I'M IN button. It does not add a new product.

==================================================
ORDER
==================================================
1. Drop files into the live repo at the same relative paths.
2. Run the three SQL files once in the Supabase SQL editor
   (attendance, realtime comment, app_members).
3. Dashboard: Replication → gathering_attendance → ON.
4. Confirm Netlify function netlify/functions/founder-ping.js
   is deployed. Env: TWILIO_* and FOUNDER_SMS or +19314042031.
5. Paste config-inject-snippet.js lines into js/config.js IIFE.
   Do not overwrite config.js.
6. Stamp APP_BUILD = 20260831-breaker-pass if you stamp builds.
7. Deploy ONCE. Prove on the iPhone. Stop.

==================================================
86 — already live, do not recook
==================================================
app.js
index.html
css/first-paint.css
#view-home display rules
js/home-only-pull.js          (live 20260830-home-pull)
assets/current.mp4
assets/current.jpg            (114965 jpeg — real still)
More page order
Follow Thunder tour
Thunder character
PRODUCT_LOCK systems

==================================================
ALLERGY
==================================================
Do not overwrite app.js.
Do not overwrite js/config.js — inject only.
Do not load no-ios-ptr.css.
Do not pour Who's In / room-live counts.
Do not pour chair/mem/raffle charm rotators.
Do not pour header-slim.
Do not pour own-edit (still parked).
Do not point the film tile at Storage in this pass
  (Netlify /assets/current.jpg is the proven still).
Do not add a second clock, boot video fetch, or new observer island.
No Home PUT.
No P2.

==================================================
WHAT EACH SPACE GOT
==================================================
1. Core UX
   Home first minute = gathering + I'M IN.
   Install and Already-a-Member stay off Home.
   Film tile uses assets/current.jpg + TAP TO WATCH.
   Lying red dock dots removed.
   TEXT A LEADER lives on Memories.
   Empty chair gold line = Claim your spot (not Bring a brother).

2. Reliability
   Seated I'M IN upserts gathering_attendance.
   Guest I'M IN stays local. Status says "this phone".
   One auth.uid() → one app_members row.
   Founder SMS on I'm In / new seat, 8s debounce, Obie only.
   One Supabase client (tb-sb-one).

3. Mobile / PWA
   overscroll-behavior-y: none so Safari PTR does not dump Home.
   --tb-island-top keeps sheets out of the clock / Dynamic Island.
   _headers so current.jpg / current.mp4 cannot become SPA HTML.

4. Error / edge
   Fail note: "Couldn't reach the room. Your mark is still on
   this phone. Try again."
   Double-tap shares attendance inflight + 900ms lock.
   Empty Memories keeps the locked sentence.
   Local mark still works if the table is missing.

5. Performance
   No video fetch at boot.
   One new JS entry + four reliability siblings.
   No 400ms paint loop. No new boot observer stampede
   beyond a click listener already required for I'm In.

6. Visual polish
   Film tile 58vw / 34vh, cover, play cue, wordmarked still.
   Dock quiet. Ghosts parked (Last Fire, Sharpen RSS, Axum,
   Home mission, floating TEXT A LEADER).
   Does not restyle The Code, More order, or Thunder FAB.

7. Everything else
   STOP. Innovation freeze holds through September 14.

==================================================
FIRE — files in this zip
==================================================
css/breaker-pass.css
css/dock-quiet.css
js/breaker-pass.js
js/tb-sb-one.js
js/attendance.js
js/members-one.js
js/founder-ping.js
js/dock-quiet.js
netlify/functions/founder-ping.js
_headers
_redirects
sql/gathering-attendance.sql
sql/gathering-attendance-realtime.sql
sql/app-members-one.sql
config-inject-snippet.js
README.txt
BREAKER-MAP.txt

==================================================
PROVE — iPhone, not desktop
==================================================
Cold Safari open
  [ ] Home paints: logo, tagline, 14 DAYS / Sep 14 / I'M IN
  [ ] No install banner. No Already-a-Member card.
  [ ] No red dot on Home / Brothers / Memories.
  [ ] Film tile shows Obie studio still, not a cropped bolt.
  [ ] TAP TO WATCH is under the tile.
  [ ] Film tap opens Thunder Theater. No video request before tap.

Guest I'M IN
  [ ] Button becomes YOU'RE IN.
  [ ] Status reads "⚡ YOU'RE IN · this phone".
  [ ] Refresh keeps the local mark.
  [ ] No gathering_attendance row for an unsigned visitor.
  [ ] Double tap does not fire two founder texts.

Seated I'M IN (lock a seat first)
  [ ] Status reads "⚡ YOU'RE IN" without "this phone".
  [ ] One gathering_attendance row for (gathering_id, auth.uid()).
  [ ] Second tap does not insert a second row.
  [ ] GET THE PING appears. Not default-on.

Seat
  [ ] Lock stamps one app_members.user_id.
  [ ] No second b_ ghost.
  [ ] Founder SMS once.

Ugly
  [ ] Airplane mode I'M IN still marks this phone.
  [ ] Fail note appears if seated write cannot reach the table.
  [ ] Down-swipe on Brothers does not reload to Home.
  [ ] Seat sheet / profile sheet clear the Dynamic Island.
  [ ] Empty Memories still reads "The room gets real…"
  [ ] Empty chair does not say Bring a brother.
  [ ] TEXT A LEADER is at the bottom of Memories only.

Leave-Home
  [ ] More replaces Home. Header on More stays hidden.

Then stop.

==================================================
PARKED — do not mix into this pour
==================================================
Own-card EDIT (own-edit-3). Dead tap is known.
Who's In / N IN / room-live.
Chair / Memories / raffle charm rotators.
Header-slim.
More raffle until TONIGHT.
Thunder AI expansion.
Storage plate-src (unproven vs live Netlify jpg).

==================================================
STOP
==================================================
If a named P0 fails on the iPhone, repair that one thing.
Do not thaw P2. Do not add a feature to hide a miss.
The version the brotherhood already loves is the gathering
card and the red button. Protect that through September 14.
