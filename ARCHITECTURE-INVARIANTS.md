# Thunder Board — Architecture Invariants (Constitution)

Read this before any future edit. Violations fail release.

## Product DNA (do not redesign)
- Pure black, official bolt, yellow glow, red CTAs
- “Thunder doesn’t dull.” Private-room energy — not a social network
- Mobile-first PWA; no complex login for viewing
- One CTA philosophy for install; REFRESH APP for forced update


## Sensory life blood (do not regress)
16. **Visual feedback is required** on all platforms. Vibration is optional Android progressive enhancement only (`navigator.vibrate` feature-detect). Never promise iPhone haptics. Never Capacitor-for-buzz.
17. **Semantic API only:** `tbFeedback.thunderImpact | press | confirm | warningOrError | selection`. No scattered raw vibrate. Config: `TB_CONFIG.SENSORY`.
18. Splash thunderImpact once per session only; confirm only after real success; warning sparingly.

## Visual locks (do not regress)
11. **Welcome card bolt** = `assets/bolt-only.png` only (official mark through-the-O energy). Never emoji ⚡. Must use `boltLive` / `--tb-breathe` with all other bolts.
12. **Logo / splash** — bolt-shaped effects only. NEVER full-box gradient, slab, pad, or rectangular glow around the wordmark or icon.
13. **Install explainer** = CapCut VO source → `assets/install-explainer.mp4` (H.264 + AAC). `INSTALL_EXPLAINER.keepAudio: true`. No permanent mute. No native controls. Loop + user-gesture play with sound.
15. **Save reward** = `TB_CONFIG.SAVE_REWARD` + `rewardSaveSuccess()` after successful profile save and successful memory upload only. ~3s, official bolt, no confetti. Never on failure.
14. Shared pulse class list must stay in sync: `.bolt-glow`, `.welcome-bolt`, `.mission-bolt`, `.about-bolt-glow`, FAB bolt, logo bolt soft glow, brother names, locked-in status, THE CODE title.

## Security
1. No server secrets in client (`service_role`, VAPID private, `XAI_API_KEY`, DB passwords).
2. Announcements / `events_board` writes: active leader/admin only (`is_sot_leader` / `app_members`).
3. `LEADER_PIN` is UI-only — never authority for DB or push.
4. Push broadcast: Supabase JWT + `app_members` on the server.
5. Memories bucket private; paths `private/<user_id>/…`; signed URLs ephemeral.

## One engines / isolation
6. **One meeting engine:** `getNextMeetingMonday` / `meetingMondayOf` (Labor Day & Memorial Day → second Monday; post-meeting-time → next month).
7. **I’m In** is device-local unless a deliberate shared RSVP is designed later.
8. **Network-first SW** — no offline HTML/JS caches that recreate stale PWAs.
9. Escape user / AI / RSS content before HTML.
10. RSS is non-critical — must not take down Home / Next Gathering.

## Source-of-truth map
| State | Authority |
|-------|-----------|
| Build id | Deploy metadata / `TB_CONFIG.APP_BUILD` + asset `?v=` |
| Meeting date | `getNextMeetingMonday()` only |
| Meeting time / venue | `config.js` (`MEETING_TIME`, `VENUE`) |
| Announcements / events_board (shared) | Supabase when pull succeeds; else local cache (honest messaging) |
| Brothers / memories (shared) | Supabase when signed in + enabled |
| I’m In / RSVP | localStorage (this phone) |
| Push ON for this device | `PushManager.getSubscription()` — not localStorage alone |
| Leadership UI unlock | Client PIN (cosmetic) |
| Leadership cloud write / push | Session + `app_members` + RLS / Netlify function |
| Thunder facts for AI | Injected context (next gathering, Code) + local keywords; Grok for the rest |

## Runtime housekeeping (allowed)
- Event-driven only (launch / visibility): re-read PushManager; quiet `getSession`
- In-flight guard on push broadcast
- Server-side delete of push endpoints on 404/410 only
- User-tapped REFRESH APP may unregister SW + clear caches + reload

## Runtime housekeeping (forbidden)
- Auto-reload / deploy / schema / RLS / role changes
- Auto-delete Memories or ambiguous Storage objects
- Polling timers for “health”
- Autonomous product or UX changes
- Behavioral surveillance of brothers

## Ops
- Prefer invite-only Supabase signup
- Run `supabase-schema.sql` on live; seed leaders in `app_members`
- Netlify env: see DEPLOY-NOTES.md
- Before deploy: `bash scripts/release-check.sh`
