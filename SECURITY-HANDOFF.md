# Thunder Board — Security Handoff

**Live:** https://sonsofthunderboard.com  
**Folder build (this tree):** see `js/config.js` `APP_BUILD` + `build.json`  
**Live build (2026-08-24 probe):** `20260824-splash1` — confirm match before you treat findings as current.

**Stack:** Static PWA (Netlify) + Netlify Functions + Supabase Auth / Postgres / Storage + Web Push + xAI Grok via server proxy.

**Standard:** Treat the browser as hostile. The attacker has the entire client, every endpoint, and can change every request. Authorization and validation must hold **server-side and in RLS**. Hidden UI, CSS, localStorage, and a client PIN are not security.

Do **not** modify production brother data, send real bulk SMS/push, or run destructive tests. Use controlled test accounts.

---

## 0. Trust model

| Tier | Who | Intended power |
|------|-----|----------------|
| Public | Anyone with the URL | View Home / About / Code / install; local device I’m In |
| Authenticated | Supabase session | Shared roster / memories **only as RLS allows**; edit own profile |
| Leader / admin | `app_members.role` in (`leader`,`admin`) + active | Content tools; `push-broadcast` after **server** membership check |
| Server | Netlify env | `XAI_API_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

**Non-claims (document these as design, then verify):**

- `LEADER_PIN` in `js/config.js` = **mild UI gate only**. View Source reveals it. It must not authorize anything on the server.
- `LEADER_SMS_PARTS` reconstructs a leadership contact number. Treat as a **public contact line**, not a secret.
- Supabase **anon / publishable** key and **VAPID public** key are expected in the browser.
- A **service-role** key, xAI key, or VAPID **private** key in client / Git / source maps = CRITICAL.

---

## 1. Attack list (do these first)

### 1.1 Supabase / RLS — CRITICAL

Using the **same anon key shipped in `js/config.js`**, without the UI:

- SELECT / INSERT / UPDATE / DELETE on profiles, memories, announcements, events, RSVP/attendance, `app_members`, push subscriptions, birthday / phone columns.
- Storage bucket `Sons Of Thunder Memories`: list, read, write, delete, cross-user paths, public URL guessing, signed URL scope.
- Auth: can a stranger sign up? Does `authenticated` equal “approved brother”?

**Do not accept “RLS enabled.”** Run the unauthorized operations.

### 1.2 Leadership / PIN bypass — CRITICAL (red-circle)

- Extract `LEADER_PIN` from the shipped JS.
- Call leadership UI paths **and** functions **without** the PIN.
- **Pass condition:** PIN knowledge alone cannot authorize `push-broadcast`, `leader-room`, DB writes, or any privileged Netlify action.

Expected: `push-broadcast` requires Bearer access token + `app_members` leader/admin. Live unauthenticated POST returned `{"error":"Sign in required"}` (2026-08-24). Re-verify after deploy.

### 1.3 Netlify Functions — CRITICAL

Attack each function **off-UI**. Live endpoints observed 2026-08-24:

| Function | Live OPTIONS | Unauth probe | Intended gate |
|----------|--------------|--------------|---------------|
| `thunder-ai` | 204 | POST `{}` → `question required` | POST; server `XAI_API_KEY`; IP rate limit (~20/min/instance) |
| `push-broadcast` | 204 | POST no token → `Sign in required` | Bearer session + leader/admin |
| `push-subscribe` | 204 | | Upsert subscription; origin lock; rate limit in this folder |
| `push-unsubscribe` | 204 | | Same family |
| `leader-room` | 204 | GET → `Sign in required` | Session + leader (source may live only on Netlify, not this folder) |
| `push-im-in` | 204 | POST `{}` → `Bad meeting` | Input validation exists; prove authz separately |
| `sms-leader` | **404** | | **No function** — do not assume Twilio from the UI |

Check: authn, authz, validation, rate limits, CORS origin, error leakage.

### 1.4 Secrets exposure — CRITICAL

Search deployed JS/HTML, config, source maps, repo, Git history, function error bodies.

| Material | Expected |
|----------|----------|
| Anon key, VAPID public, `SUPABASE_URL` | Visible — OK |
| `XAI_API_KEY`, VAPID private, service role, Twilio tokens | **Must not** exist in client |

### 1.5 SMS abuse — HIGH if a server sender exists; INFORMATIONAL if not

**Current core path:** `sms:` deep link opens the **device** Messages app to a leadership number. That is not server-side Twilio.

Still prove:

- No Netlify function sends SMS or bills Twilio (`sms-leader` was 404 on live).
- Birthday honor SMS is local `sms:` / local notification, not a blast API.
- If Twilio credentials exist in Netlify env or another branch, treat as HIGH: replay, recipient swap, mass send, rate limit.

Do **not** send real bulk texts during the test.

### 1.6 Photo uploads / Storage — HIGH

Hostile files: oversized, lying MIME, SVG/HTML, path traversal names, EXIF, replace/delete another brother’s object, unsigned public URLs.

### 1.7 Stored XSS — HIGH

Inject into names, bios, announcements, captions, memories, Thunder input, leadership-editable copy. Another phone must **not** execute script. Client uses `esc()` before many `innerHTML` sinks — sample every sink; do not trust the comment.

### 1.8 Also inspect

CORS, CSP, sessions, IDOR/BOLA, CSRF where cookies matter, rate limits, service worker / cache, PWA scope, retention, backups, logging, verbose errors.

**Live CSP (2026-08-24):** `frame-ancestors 'none'` only.  
**This folder `netlify.toml`:** full `default-src` policy is staged — **not live until this tree is deployed**.

---

## 2. What is already honest / already fail-closed (verify)

- Grok key only on server.
- VAPID private only on server.
- Function CORS locked to `https://sonsofthunderboard.com` in this folder.
- `push-broadcast` comment and code: client PIN is not trusted.
- Baseline headers live: HSTS, `X-Frame-Options: DENY`, nosniff.
- `esc()` exists for HTML text.

---

## 3. Ops items the site owner must confirm (not in JS)

1. Supabase **disable open signup** / invite-only.  
2. Seed `app_members` leader row for the real admin user id.  
3. RLS policies match `supabase-schema.sql` **as applied**, not as written.  
4. Storage: no public-read on private memory objects; no client DELETE policy.  
5. Netlify env names only: `XAI_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.  
6. Deploy identity: live `build.json` must equal the package under test.

---

## 4. Report format

- Severity: CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL  
- Component  
- Reproduction (controlled accounts)  
- Impact  
- Remediation  
- Separate **confirmed exploit** vs **documented design limitation** (PIN visible, SMS number reconstructible, anon key public).

---

## 5. Paste to the assessor

> Treat the browser as hostile. Assume the attacker has the entire client source, knows every endpoint, can modify every request, can call APIs without the UI, and can change anything stored in the browser. Prove authorization and validation happen server-side.
>
> Attempt to access another user’s data, escalate to leadership, invoke privileged Netlify functions, send unauthorized SMS **if a server path exists**, manipulate RSVPs, upload hostile files, access/delete other users’ uploads, inject persistent content, enumerate users, bypass rate limits, extract secrets, and query Supabase directly with the public anon key.
>
> Do not accept “RLS enabled” as proof.
>
> Inspect every Netlify function independently, including `leader-room` and `push-im-in` if present on the live site.
>
> **Red-circle:** Prove that knowing or bypassing the client `LEADER_PIN` alone cannot authorize a push broadcast or any privileged server operation.
>
> Search the deployed client, repository, and Git history for secrets.
>
> Report CRITICAL → INFORMATIONAL with repro steps. Do not modify production data or send bulk real messages.

---

*Sons of Thunder / Thunder Board — cyber handoff. Product owner: Obie. Re-check live `APP_BUILD` before you start.*
