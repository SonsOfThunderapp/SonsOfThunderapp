# Thunder Board — Quiet Guardians

**Build:** `20260817-guardians1`  
**Mode:** Observe / protect / recover — not a redesign.

| # | System | Status in this build |
|---|--------|----------------------|
| 1 | Experience Watchdog | **ON** — `error` + `unhandledrejection` → local ring buffer (no PII) |
| 2 | Offline Action Queue | **ON** — queue API + flush on `online` / visible; handlers empty until wired per action |
| 3 | Data Integrity Guardian | **ON** — validators for brother / announcement / memory rows + dedupe helper |
| 4 | Performance Governor | **ON** — `data-tb-perf=strain` hint only; never strips Thunder/DNA |
| 5 | Media Optimization | **ON** — file validate + uses existing `compressImageDataUrl` |
| 6 | Privacy / Security Sentinel | **ON** — client config shape scan only; real security = Netlify env + RLS |
| 7 | Thunder Quality Guard | **ON** — question length + local-prefer hints + answer length soft check |

## Rules
- Event-driven (no multi-second polling loops)
- RSVP remains **device-local** by design (already works offline)
- No autonomous Supabase admin writes
- No UI chrome for errors (console.debug health only)
- Secrets stay in Netlify env

## API
`window.TBGuardians.health()`  
`window.TBGuardians.Watchdog.report()`  
`window.TBGuardians.Queue.enqueue({ type, payload })`

## Not in this slice
Full freshness system (`version.json`, rewrite SW, content-config, update-controller). Separate approval.
