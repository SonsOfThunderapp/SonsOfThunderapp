-- Run once in Supabase SQL editor. RLS: a brother writes only his row.
create table if not exists public.gathering_attendance (
  gathering_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  locked_in boolean not null default false,
  in_hat boolean not null default false,
  ping boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (gathering_id, user_id)
);

alter table public.gathering_attendance enable row level security;

drop policy if exists attendance_select_room on public.gathering_attendance;
create policy attendance_select_room on public.gathering_attendance
  for select using (auth.uid() is not null);

drop policy if exists attendance_upsert_own on public.gathering_attendance;
create policy attendance_upsert_own on public.gathering_attendance
  for insert with check (auth.uid() = user_id);

drop policy if exists attendance_update_own on public.gathering_attendance;
create policy attendance_update_own on public.gathering_attendance
  for update using (auth.uid() = user_id);
