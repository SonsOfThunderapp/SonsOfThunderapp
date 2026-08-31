-- Enable live lock-in / hat counts. Run after gathering-attendance.sql.
alter table public.gathering_attendance replica identity full;
-- Dashboard: Database → Replication → gathering_attendance → ON
-- If you use SQL:
-- alter publication supabase_realtime add table public.gathering_attendance;
