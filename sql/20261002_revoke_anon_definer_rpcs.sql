-- 20261002_revoke_anon_definer_rpcs.sql
-- Thunder Ops audit: 17 SECURITY DEFINER RPCs had anon EXECUTE.
-- Revoke anon, re-grant authenticated on all of them.
-- lock_seat covered here too (see also 20261002_revoke_lock_seat_anon.sql).
-- Safe for signed-in brothers: no app behavior change.
-- Apply in Supabase SQL editor. Not applied by this commit.

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', r.fn);
    EXECUTE format('GRANT  EXECUTE ON FUNCTION %s TO authenticated', r.fn);
  END LOOP;
END $$;
