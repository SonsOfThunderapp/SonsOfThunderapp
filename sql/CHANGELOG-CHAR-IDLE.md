# char-idle1 change log

## Files changed
- `index.html` — FAB wraps img in `.tb-char-stage` + glow ring + 2 spark spans; class `tb-char-idle`
- `css/styles.css` — living idle keyframes + pause/reduced-motion rules; character img no longer uses plain `boltLive` while idle
- `js/app.js` — ThunderCharacter: visibility pause, smile pauses idle then resumes
- `js/config.js` — APP_BUILD `20260816-char-idle1`

## Animation states
| State | Behavior |
|-------|----------|
| idle | breathe (4s stage) + glow (4s img) + personality (16s) + rare sparks |
| fab-hit / smile | idle animations off via `:not(.fab-hit)`; resume after smile timer |
| tb-thunder-wake | idle suppressed same way |
| tab hidden | `animation-play-state: paused` |
| prefers-reduced-motion | static soft drop-shadow only |

## Seamless loop
- Every keyframe set uses identical `0%` and `100%` transforms/opacity/filters
- Breathe on stage, personality rotate on img — no competing transform on one node
- No full-image Ken Burns scale loop

## Performance
- GPU-friendly `transform` / `opacity` / `filter` only
- No continuous JS timers for idle (CSS only)
- Pause when `document.hidden`
- Single fixed 48×48 stage — no layout shift

## Regression checks (source)
- [x] Same cool/smile/bond assets
- [x] Scope A flashSmile path intact
- [x] No yellow circle restored
- [x] Tour host / Bond hero markup unchanged
- [x] `node --check js/app.js` pass
- [ ] DEVICE: confirm idle feel + smile resume on phone after deploy
### 20260816-character1
- Central ThunderCharacter state machine: hidden/entering/idle/speaking/guiding/reacting/exiting.
- Tour beginGuiding / endGuiding; encouragement beginSpeaking / endSpeaking.
- Living-idle continues when visible + idle; paused when active or backgrounded.
- Authoritative Thunder assets only for FAB + tour host.
