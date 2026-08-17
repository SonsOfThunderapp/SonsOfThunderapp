# NON-REGRESSION CHECKLIST

Run before every production zip claim.

## Hard fails

- [ ] No full-box logo/splash slab (glimmer kill still wins cascade)
- [ ] No service_role / VAPID private / XAI key values in client JS/HTML
- [ ] `getNextMeetingMonday` still sole meeting authority; Labor/Memorial intact
- [ ] Venue/time still from config
- [ ] `scripts/release-check.sh` exits 0
- [ ] `node --check js/app.js` passes
- [ ] index.html at zip root
- [ ] `.npmrc` is public registry only

## Product surface still present

- [ ] I’m In, Next Gathering, announcements, Sharpening Iron
- [ ] Brothers + profile/QR/share paths
- [ ] Events memories grid + compress upload
- [ ] The Code + Who We Are + Mark 3:17
- [ ] Ask Thunder local + function path
- [ ] Tour host DOM + Skip/Replay
- [ ] Install explainer asset referenced
- [ ] Refresh App control
- [ ] Text a Leader button
- [ ] Push function files present

## Tour-specific

- [ ] Only one tour root
- [ ] Typing timers cancel on step change / close
- [ ] body.tb-tour-open removed on exit
- [ ] Ambient pulses not left paused forever

## Phone smoke (human)

- [ ] iPhone Safari open/close modals
- [ ] I’m In
- [ ] Ask Thunder meeting question
- [ ] Replay tour once
- [ ] Reduced motion if available

## Thunder character unity (locked 2026-08-16)

Thunder is the single official mascot and concierge character. The concierge lightning bolt must always use the authoritative Thunder character (sunglasses bolt assets: thunder-cool / smile variants). Whenever Thunder is visible but not actively performing, he uses a subtle living-idle animation. Active concierge behavior and idle behavior are coordinated through one state system (`hidden | entering | idle | speaking | guiding | reacting | exiting`) and must never conflict.

- No generic concierge bolt competing with Thunder.
- Encouragement bubbles (10 exact lines, 15s cycle) pause during guiding; living-idle pauses during speaking/guiding.
- Future ZIPs may not silently restore a generic bolt, freeze idle, or allow overlapping bubbles/states.

