# RLS POLICY FIXES — packet (2026-10-02)

**PROJECT** = Sons of Thunder Board (TB1)  
**Branch:** `security/rls-policy-fixes`  
**SQL:** `sql/20261002_rls_policy_fixes.sql`  
**NOT run. NOT merged. NOT poured.**

## Leaky policies found (live audit)

| Table | Policy | Roles | Cmd | USING / CHECK | Risk |
|-------|--------|-------|-----|---------------|------|
| brothers | brothers read | public | SELECT | true | **CRITICAL** — phone, birthday, bio to anon |
| brothers | brothers_select_public | anon,authenticated | SELECT | true | duplicate of above |
| memories | memories read | public | SELECT | true | full memory captions/paths to anon |
| memories | memories_select_public | anon,authenticated | SELECT | true | duplicate |
| memories | Brothers can view memories | authenticated | SELECT | true | OK (auth) — kept via new policy |
| rsvps | rsvps_select | public | SELECT | true | who locked in (brother_id) |
| push_subs | push_subs upsert | public | INSERT | WITH CHECK true | **CRITICAL write** |
| push_subs | push_subs update | public | UPDATE | true | **CRITICAL write** |
| push_subs | push_subs delete | public | DELETE | true | **CRITICAL write** |
| raffle_draws | raffle_read | public | SELECT | true | winner names |
| announcements | announcements read + announcements_select_public | public / anon+auth | SELECT | true | intentional guest glass? |
| events_board | events_board read + events_board_select_public | public / anon+auth | SELECT | true | intentional guest glass? |
| last_fire | last_fire_read | public | SELECT | true | intentional guest glass? |
| theater_current | theater_current_read | public | SELECT | true | intentional guest glass? |
| app_members | members_select_room | public | SELECT | auth.uid() IS NOT NULL | anon blocked in practice; tighten roles |
| gathering_attendance | attendance_* | public | * | auth.uid() gates | tighten roles |

## SECURITY DEFINER RPCs executable by anon (all 17)

`lock_seat` (worst — writes RSVPs as definer), `whos_in`, `search_brothers`, `seat_count`, `meeting_stats`, `birthdays_today`, `birthdays_this_week`, `claim_invite`, `invite_ok`, `clear_stale_carried`, `fresh_last_fire`, `draw_raffle`, `prune_stale_push`, `log_leader`, `issue_axum_code`, `can_upload_memory`, `is_sot_leader`.

Note: `brothers` currently has **no anon SELECT GRANT** (policy still says anon — defense-in-depth still drop it). Anon cannot “list tables” as a catalog dump via PostgREST, but every GRANTed table with a permissive SELECT policy is queryable by name with the publishable key.

## What the migration does

- Kill anon SELECT on brothers / memories / rsvps / raffle_draws  
- Deny all on push_subs  
- Tighten app_members + gathering_attendance to `TO authenticated`  
- Revoke anon EXECUTE on all listed SECURITY DEFINER RPCs; re-GRANT authenticated  
- **Keep** public SELECT on announcements, events_board, last_fire, theater_current (guest Home)
- REVOKE ALL table grants from anon, then GRANT SELECT only on the four guest tables

## Would break live if applied without client/auth work

1. Guest (not signed in) Home that reads `brothers` / `rsvps` / `memories` via anon client → empty until sign-in.  
2. Guest “Who’s In” that calls `whos_in` / `seat_count` / `lock_seat` as anon → 401/permission denied.  
3. If I’m In / RSVP presence on public Home uses anon `rsvps` SELECT or `lock_seat` — **must** move to authenticated session or a new count-only RPC with no PII before pour.  
4. Guest memories wall → requires auth.

## NEED DECISION (Obie / Chief)

1. Keep guest-readable announcements / events_board / last_fire / theater_current? (migration KEPT them)  
2. Public RSVP **count only** (no names) via a new `SECURITY INVOKER` RPC — yes/no before pour?  
3. Apply SQL in Supabase SQL editor on lab first, then live — who FIREs?  
4. Rotate publishable anon key after policies land? (recommended hygiene; not required for RLS itself)
