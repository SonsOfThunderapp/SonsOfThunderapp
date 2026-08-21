-- =============================================================================
-- THUNDER BOARD — run this ONCE in Supabase → SQL Editor → Run
-- Safe to re-run. Does not wipe brothers or memories.
-- After this: Auth → Users → copy YOUR uuid → run the last block (seed leader).
-- =============================================================================

-- ---------- BROTHERS ----------
create table if not exists public.brothers (
  id text primary key,
  name text not null,
  bio text default '',
  phone text default '',
  photo_url text,
  skills text default '',
  available boolean default true,
  updated_at timestamptz default now()
);
alter table public.brothers add column if not exists phone text default '';
alter table public.brothers add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.brothers add column if not exists birthday text;
alter table public.brothers add column if not exists joined_at timestamptz;
create index if not exists brothers_owner_id_idx on public.brothers (owner_id);

alter table public.brothers enable row level security;
drop policy if exists "brothers read" on public.brothers;
drop policy if exists "brothers upsert" on public.brothers;
drop policy if exists "brothers update" on public.brothers;
drop policy if exists "brothers insert auth" on public.brothers;
drop policy if exists "brothers update auth" on public.brothers;
create policy "brothers read" on public.brothers for select using (true);
create policy "brothers insert auth" on public.brothers
  for insert to authenticated
  with check (owner_id = auth.uid());
create policy "brothers update auth" on public.brothers
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ---------- MEMORIES ----------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  storage_path text not null,
  caption text default '',
  uploader_name text default '',
  created_at timestamptz default now()
);
create index if not exists memories_created_at_idx on public.memories (created_at desc);
create index if not exists memories_user_id_idx on public.memories (user_id);

alter table public.memories enable row level security;
drop policy if exists "memories read" on public.memories;
drop policy if exists "memories insert" on public.memories;
drop policy if exists "memories update" on public.memories;
drop policy if exists "memories delete" on public.memories;
create policy "memories read" on public.memories for select to authenticated using (true);
create policy "memories insert" on public.memories
  for insert to authenticated with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('Sons Of Thunder Memories', 'Sons Of Thunder Memories', false)
on conflict (id) do update set public = false, name = excluded.name;

-- ---------- EVENTS BOARD ----------
create table if not exists public.events_board (
  id text primary key default 'default',
  events_note text default '',
  mission_title text default '',
  mission_detail text default '',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.events_board (id, events_note, mission_title, mission_detail)
values (
  'default',
  'P.S. Got an interesting hobby that you think the fellas will like? Have a crazy story about your life that the guys could benefit from? This is your push to let us in on it and help grow the guys of the group!',
  'PARTY''S ON THE PATIO / DOWNTOWN WINTER GARDEN',
  'Gun Range, lake adventures, digging into the Word, or a Gym Giant — you''ll find your tribe here!'
)
on conflict (id) do nothing;

alter table public.events_board enable row level security;
drop policy if exists "events_board read" on public.events_board;
drop policy if exists "events_board insert" on public.events_board;
drop policy if exists "events_board update" on public.events_board;
drop policy if exists "events_board insert auth" on public.events_board;
drop policy if exists "events_board update auth" on public.events_board;
drop policy if exists "events_board insert leader" on public.events_board;
drop policy if exists "events_board update leader" on public.events_board;
create policy "events_board read" on public.events_board for select using (true);

-- ---------- APP MEMBERS (you = leader) ----------
create table if not exists public.app_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('brother', 'leader', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.app_members enable row level security;
drop policy if exists "app_members read own" on public.app_members;
create policy "app_members read own" on public.app_members
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_sot_leader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_members m
    where m.user_id = auth.uid()
      and m.active = true
      and m.role in ('leader', 'admin')
  );
$$;
revoke all on function public.is_sot_leader() from public;
grant execute on function public.is_sot_leader() to authenticated;
grant execute on function public.is_sot_leader() to anon;

create policy "events_board insert leader" on public.events_board
  for insert to authenticated with check (public.is_sot_leader());
create policy "events_board update leader" on public.events_board
  for update to authenticated using (public.is_sot_leader()) with check (public.is_sot_leader());

-- ---------- ANNOUNCEMENTS ----------
create table if not exists public.announcements (
  id text primary key,
  title text not null default '',
  body text not null default '',
  created_at timestamptz default now(),
  sort_order int default 0
);
alter table public.announcements enable row level security;
drop policy if exists "announcements read" on public.announcements;
drop policy if exists "announcements insert" on public.announcements;
drop policy if exists "announcements update" on public.announcements;
drop policy if exists "announcements delete" on public.announcements;
drop policy if exists "announcements insert auth" on public.announcements;
drop policy if exists "announcements update auth" on public.announcements;
drop policy if exists "announcements delete auth" on public.announcements;
drop policy if exists "announcements insert leader" on public.announcements;
drop policy if exists "announcements update leader" on public.announcements;
drop policy if exists "announcements delete leader" on public.announcements;
create policy "announcements read" on public.announcements for select using (true);
create policy "announcements insert leader" on public.announcements
  for insert to authenticated with check (public.is_sot_leader());
create policy "announcements update leader" on public.announcements
  for update to authenticated using (public.is_sot_leader()) with check (public.is_sot_leader());
create policy "announcements delete leader" on public.announcements
  for delete to authenticated using (public.is_sot_leader());

-- ---------- I'M IN ----------
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
create policy rsvps_select on public.rsvps for select using (true);
create policy rsvps_insert on public.rsvps for insert to authenticated with check (true);
create policy rsvps_update on public.rsvps for update to authenticated using (true) with check (true);
create policy rsvps_delete on public.rsvps for delete to authenticated using (true);
do $$
begin
  alter publication supabase_realtime add table public.rsvps;
exception when duplicate_object then
  null;
end $$;

-- ---------- PUSH (service role only for list) ----------
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subs_insert" on public.push_subscriptions;
drop policy if exists "push_subs_update" on public.push_subscriptions;
drop policy if exists "push_subs_delete" on public.push_subscriptions;
drop policy if exists "push_subs_select" on public.push_subscriptions;
-- Functions use service role. Browser never lists this table.

create table if not exists public.push_dispatch (
  kind text not null,
  meeting_key text not null,
  sent_at timestamptz not null default now(),
  primary key (kind, meeting_key)
);
alter table public.push_dispatch enable row level security;

-- =============================================================================
-- AFTER the run succeeds:
-- 1. Authentication → Users → your row → copy User UID
-- 2. Paste it below, uncomment, Run just that line.
-- =============================================================================
-- insert into public.app_members (user_id, role, active)
-- values ('PASTE-YOUR-AUTH-UUID-HERE', 'admin', true)
-- on conflict (user_id) do update set role = 'admin', active = true;

-- PHONE VAULT (20260821-chief1)
-- Anon directory read without the contact column. Authenticated still gets phone.
-- Repo push does not change live Supabase — run this file (or sql/phone-vault.sql) in SQL Editor.
revoke select on table public.brothers from anon;
revoke select (phone) on table public.brothers from anon;
revoke select (phone) on table public.brothers from public;
grant select (
  id,
  name,
  bio,
  photo_url,
  skills,
  available,
  updated_at,
  birthday,
  owner_id
) on table public.brothers to anon;
grant select on table public.brothers to authenticated;
