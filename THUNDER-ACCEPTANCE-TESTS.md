# THUNDER-ACCEPTANCE-TESTS — must pass before calling a build done

Labels: each row is DEVICE VERIFIED only when a human completes it on a real phone after hard refresh matching `APP_BUILD`.

## A. Visual DNA (MASTERPIECE)
- [ ] No rectangle/slab around Home logo or splash
- [ ] Header bolt (if any) breathes without layout shift
- [ ] Brother **names** pulse in grid
- [ ] Brother **photo tiles** pulse
- [ ] Open seat / empty `+` pulses
- [ ] Modal title pulses when any sheet opens
- [ ] THE CODE pulses on More
- [ ] Event date glow present on Events
- [ ] More logo below status/safe area
- [ ] Cool FAB character present (no yellow circle)

## B. Core product
- [ ] Next Gathering date obeys first Monday / Labor / Memorial rule
- [ ] Venue shows Crooked Can Brewery Patio, Winter Garden
- [ ] I’m In → success only when confirm works; lock pulse
- [ ] Brothers empty invite / open seat → profile editor
- [ ] Profile detail opens/closes (X, backdrop, swipe if designed)
- [ ] Memory grid thumbs → full viewer → close works
- [ ] Ask Thunder local answer for next meeting
- [ ] Text a Leader / Have a question path works

## C. Install / More
- [ ] Install poster visible on More (when not installed)
- [ ] Poster or HOW opens explainer media
- [ ] Refresh App forces fresh load
- [ ] Gathering alerts toggle does not crash if push unavailable

## D. Concierge / tour (if enabled this build)
- [ ] First-run does not spam every launch
- [ ] Skip works; Replay from More works
- [ ] Install overlay wins if both relevant
- [ ] Failure leaves user on a usable Home

## E. Security smoke
- [ ] Anonymous can view public Home
- [ ] No service_role / XAI key / VAPID private in client source
- [ ] Leadership PIN alone cannot broadcast without server path

## F. Degradation
- [ ] With network blocked: static shell still opens
- [ ] Thunder local keywords still answer meeting/Code if Grok function fails

## G. Build identity
- [ ] Live `APP_BUILD` matches the zip just deployed
