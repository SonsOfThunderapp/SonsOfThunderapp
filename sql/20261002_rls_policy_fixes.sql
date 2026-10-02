-- =============================================================================
-- PROJECT = Sons of Thunder Board (TB1)
-- Migration: 20261002_rls_policy_fixes
-- Branch: security/rls-policy-fixes
-- DO NOT RUN until Chief review + Obie yes. Not applied from this packet.
-- Project: mnsempcgomukcpofgvlm
-- =============================================================================
-- Intent:
--   Anon (publishable key alone) must not read phones/full roster/memories/RSVP
--   row detail or write push_subs. Authenticated brothers keep room glass.
--   Narrow public SELECTs kept only where guest glass needs them (announcements,
--   events_board, last_fire, theater_current) — see NEED DECISION in packet.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) brothers — CRITICAL: anon SELECT true exposes phone, birthday, bio
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "brothers read" ON public.brothers;
DROP POLICY IF EXISTS "brothers_select_public" ON public.brothers;

CREATE POLICY "brothers_select_authenticated"
  ON public.brothers
  FOR SELECT
  TO authenticated
  USING (true);

-- keep existing insert/update (owner_id = auth.uid()) — no change

-- ---------------------------------------------------------------------------
-- 2) memories — anon SELECT true + duplicate policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Brothers can view memories" ON public.memories;
DROP POLICY IF EXISTS "memories read" ON public.memories;
DROP POLICY IF EXISTS "memories_select_public" ON public.memories;
DROP POLICY IF EXISTS "memories insert" ON public.memories; -- public role; keep auth-only inserts
DROP POLICY IF EXISTS "memories update" ON public.memories; -- public role; keep auth-only updates

CREATE POLICY "memories_select_authenticated"
  ON public.memories
  FOR SELECT
  TO authenticated
  USING (true);

-- Remaining insert/update/delete own policies on authenticated stay.

-- ---------------------------------------------------------------------------
-- 3) rsvps — anon SELECT true leaks who is in (names via join / brother_id)
-- Prefer RPC seat_count / meeting_stats for public counts (after RPC revoke).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "rsvps_select" ON public.rsvps;

CREATE POLICY "rsvps_select_authenticated"
  ON public.rsvps
  FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 4) push_subs — CRITICAL write: INSERT/UPDATE/DELETE USING true for public
-- (legacy empty table; push_subscriptions already deny_all)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "push_subs delete" ON public.push_subs;
DROP POLICY IF EXISTS "push_subs update" ON public.push_subs;
DROP POLICY IF EXISTS "push_subs upsert" ON public.push_subs;

CREATE POLICY "push_subs_deny_all"
  ON public.push_subs
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- 5) raffle_draws — anon SELECT true (winner names)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "raffle_read" ON public.raffle_draws;

CREATE POLICY "raffle_select_authenticated"
  ON public.raffle_draws
  FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 6) announcements / events_board / last_fire / theater_current
-- Guest Home may need these. Default KEEP narrow public SELECT; drop duplicates.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "announcements read" ON public.announcements;
-- keep announcements_select_public (anon+authenticated SELECT true)

DROP POLICY IF EXISTS "events_board read" ON public.events_board;
-- keep events_board_select_public

-- last_fire_read / theater_current_read: KEEP for guest theater/home glass

-- ---------------------------------------------------------------------------
-- 7) app_members / gathering_attendance — roles {public} but gated by auth.uid()
-- Tighten roles to authenticated only (same logic, clearer).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "members_select_room" ON public.app_members;
DROP POLICY IF EXISTS "members_update_own" ON public.app_members;
DROP POLICY IF EXISTS "members_upsert_own" ON public.app_members;

CREATE POLICY "members_select_room"
  ON public.app_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "members_update_own"
  ON public.app_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_upsert_own"
  ON public.app_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "attendance_select_room" ON public.gathering_attendance;
DROP POLICY IF EXISTS "attendance_update_own" ON public.gathering_attendance;
DROP POLICY IF EXISTS "attendance_upsert_own" ON public.gathering_attendance;

CREATE POLICY "attendance_select_room"
  ON public.gathering_attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "attendance_update_own"
  ON public.gathering_attendance
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_upsert_own"
  ON public.gathering_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 8) SECURITY DEFINER RPCs — revoke anon EXECUTE where dangerous
-- lock_seat: anon can INSERT any brother_id into rsvps (bypasses RLS)
-- whos_in / search_brothers / seat_count / meeting_stats / birthdays_*: leak PII
-- claim_invite / invite_ok: invite probing
-- prune_stale_push / draw_raffle / log_leader: leader paths (is_sot_leader gated
--   but still revoke anon)
-- issue_axum_code / can_upload_memory: auth.uid() gated — revoke anon anyway
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.lock_seat(text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.whos_in(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.search_brothers(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.seat_count(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.meeting_stats(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.birthdays_today() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.birthdays_this_week() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.claim_invite(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.invite_ok(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.clear_stale_carried() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.fresh_last_fire(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.draw_raffle(text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.prune_stale_push(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_leader(text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.issue_axum_code(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_upload_memory() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_sot_leader() FROM anon, public;

-- Re-grant authenticated where the room needs them
GRANT EXECUTE ON FUNCTION public.lock_seat(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.whos_in(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_brothers(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seat_count(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.meeting_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.birthdays_today() TO authenticated;
GRANT EXECUTE ON FUNCTION public.birthdays_this_week() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_invite(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_ok(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_stale_carried() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fresh_last_fire(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.draw_raffle(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prune_stale_push(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_leader(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_axum_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_upload_memory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_sot_leader() TO authenticated;

-- ---------------------------------------------------------------------------
-- 9) Table GRANT hygiene — anon currently has INSERT/UPDATE/DELETE/TRUNCATE
-- on most tables (RLS stops most writes, but defense-in-depth).
-- Note: brothers already lacks anon SELECT grant; policies still named anon.
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
-- Narrow guest glass only:
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.events_board TO anon;
GRANT SELECT ON public.last_fire TO anon;
GRANT SELECT ON public.theater_current TO anon;


COMMIT;
