-- 20261002_revoke_lock_seat_anon.sql
-- One-line security fix: lock_seat is SECURITY DEFINER and writes RSVPs.
-- Anon had EXECUTE, so any visitor with the public publishable key could
-- call it without signing in. Revoke anon, re-grant authenticated only.
-- Safe to apply anytime: does not change app behavior for signed-in brothers.
-- Apply in Supabase SQL editor. Not applied by this commit.

REVOKE EXECUTE ON FUNCTION public.lock_seat FROM anon;
GRANT  EXECUTE ON FUNCTION public.lock_seat TO authenticated;
