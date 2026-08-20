-- Shared I'm In — one row per brother per gathering.
-- Run in Supabase SQL editor, then enable Realtime on public.rsvps.

create table if not exists public.rsvps (
  brother_id text not null,
  meeting_key text not null,
  in_at timestamptz not null default now(),
  primary key (brother_id, meeting_key)
);

alter table public.rsvps enable row level security;

drop policy if exists rsvps_select on public.rsvps;
drop policy if exists rsvps_insert on public.rsvps;
drop policy if exists rsvps_update on public.rsvps;
drop policy if exists rsvps_delete on public.rsvps;

create policy rsvps_select on public.rsvps
  for select using (true);

create policy rsvps_insert on public.rsvps
  for insert to authenticated with check (true);

create policy rsvps_update on public.rsvps
  for update to authenticated using (true) with check (true);

create policy rsvps_delete on public.rsvps
  for delete to authenticated using (true);

-- Realtime (ignore error if already added)
do $$
begin
  alter publication supabase_realtime add table public.rsvps;
exception when duplicate_object then
  null;
end $$;
