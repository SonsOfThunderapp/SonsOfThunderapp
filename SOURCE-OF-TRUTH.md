# Thunder Board — SOURCE OF TRUTH

> **Authority:** Current production source + repository constitution files outrank conversational memory.
> Start every change session at `GROK-START-HERE.md`.


**APP_BUILD:** `20260816-LOCKED`  
**Status:** Permanent production freeze of every system signed off through this morning’s integration pass.  
**Live URL:** https://sonsofthunder.netlify.app/

This file is the inventory of what MUST remain in the product. Future Grok sessions and the Housekeeping Manager must read it before changing code.

---

## Brand DNA (never regress)
- Pure black `#000`
- Official yellow-to-orange bolt + white outline (assets: `logo.png`, `bolt-only.png`, `icon-official.png`)
- Red CTAs `#E30600`, yellow `#FEF105`
- “Thunder doesn’t dull.”
- Private-room energy — not church-management, not Christian Facebook
- NASB only when quoting Scripture
- No full-box / rectangular glow on wordmark (bolt-shaped only)
- Shared ambient pulse: `--tb-breathe` / `boltLive` (4s)
- Mobile-first PWA

## Meeting engine
- First Monday monthly
- Labor Day (1st Monday Sept) / Memorial Day (last Monday May) → **second** Monday
- Venue: Crooked Can Brewery Patio, Winter Garden
- Time: from `TB_CONFIG.MEETING_TIME` (6:30 PM)
- Canonical: `getNextMeetingMonday` (+ post-meeting same-day rollover)

## Core pages
1. **Home** — logo, identity line, Next Gathering, I’m In, announcements, Sharpening Iron (RSS, 2 items), install secondary as designed
2. **Brothers** — empty invite +, profiles, detail sheet, Share Contact + QR (bolt center), no CALL/TEXT chip clutter
3. **Events** — RANGE/LAKE/BIBLE/GYM retractable RSS, Next Mission, Memories grid + lightbox + swipe, Add Memory
4. **More** — Who We Are, The Code (yellow + red glow pulse), Gathering Alerts, Refresh App, Leadership (mild PIN)

## Interaction systems (locked)
| System | Owner / trigger | Notes |
|--------|-----------------|-------|
| **ThunderFX** | Semantic effects | tap, success, lockedIn, select, tourComplete |
| **Profile Fireworks** | `profileComplete` after authoritative profile save | Not on failure; not on memory |
| **Laser Ignition** | Cold splash only (`tb_splash_done` + onceKey) | Never on ordinary resume |
| **I’m In** | `ThunderFX.lockedIn` | Compress → LOCKED IN; no tb-press fight |
| **ThunderVoice** | FAB / mic / `?ask=1&voice=1` | Opt-in Hey Thunder foreground only; stop on hide |
| **ThunderTap** | `/tap/{intent}` durable URLs | NFC/QR; never authority; owns route before Voice |
| **Housekeeping Governor** | launch/resume/online | Event-driven; no polling; no auto-delete content |
| **Ask Thunder** | Local keywords + Netlify `thunder-ai` → Grok | One pipeline; `__tbThunderInFlight` |
| **Push** | Gathering alerts only | VAPID server-side; announce on leadership save |
| **Supabase** | Shared brothers/memories/announcements when configured | Local fallback honest |

## Physical / entry doors (philosophy)
**Scan when away · Tap when here · Say “Hey Thunder” when you need something.**
- QR / Facebook / URL
- `/tap/ask` `/tap/gathering` `/tap/install` `/tap/brothers` `/tap/events`
- Manifest shortcuts (Ask Thunder, Next Gathering)
- Siri Shortcuts → Open URL (documented, not App Store)

## PWA / install
- Manifest standalone, icons, shortcuts
- Install Concierge / HOW → explainer (CapCut VO mp4, GIF-like chrome-free where applicable)
- REFRESH APP on More (SW unregister + cache clear + reload)
- `sw.js` thin: push + pass-through fetch (no aggressive offline HTML cache)

## Security boundaries (permanent)
- Browser UI is never authority
- Client LEADER_PIN = mild gate only
- No service_role / VAPID private / XAI key in client
- NFC/Tap/Voice cannot grant leadership, push, or destructive acts
- RLS / server paths own privileged writes when Supabase is on

## Housekeeping Manager mandate
On every future session touching this app:
1. Read Constitution + this SOURCE-OF-TRUTH + Decisions
2. Hard-fail gates first (logo box, oversized media, secrets, meeting rule, Netlify shape)
3. Collision audit (one owner per moment)
4. Surgical repair only — no feature invent
5. Answer: *easier to own for 24 months, or only more sophisticated?*

## Explicitly rejected (do not reintroduce)
- System-wide custom wake phrase replacing Siri/Google
- Silent NFC check-in as authoritative attendance
- NameDrop-style phone↔phone NFC in pure PWA
- Social feed, likes, followers, daily content machine
- Full-box logo glow / rectangular slab
- Confetti / rainbow hero effects
- Native shell unless separately authorized

## Files that define the machine
- `index.html` `css/styles.css` `js/app.js` `js/config.js`
- `sw.js` `manifest.json` `netlify.toml` `_redirects`
- `netlify/functions/thunder-ai.js` `push-*.js`
- `supabase-schema.sql`
- `THUNDER-CONSTITUTION.md` `THUNDER-DECISIONS.md` `SOURCE-OF-TRUTH.md`
- Assets under `assets/` (official bolt, logos, install-explainer.mp4)

---
*Locked 2026-08-16. Changing product surface requires explicit user order — not housekeeping enthusiasm.*
