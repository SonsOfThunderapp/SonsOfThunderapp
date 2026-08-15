-- Thunder Board shared data schema
-- Run once in Supabase → SQL Editor (required for live shared memories).
-- Must match js/app.js: memories columns + bucket "Sons Of Thunder Memories".

-- Profiles (brothers directory)
create table if not exists public.brothers (
  id text primary key,
  name text not null,
  bio text default '',
  photo_url text,
  skills text default '',
  available boolean default true,
  updated_at timestamptz default now()
);

-- Memories metadata (files live in Storage under private/<user_id>/...)
-- Matches app.js pullMemories / pushMemory exactly
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  storage_path text not null,
  caption text default '',
  uploader_name text default '',
  created_at timestamptz default now()
);

-- If an older memories table exists with different columns, migrate carefully in Dashboard.
-- This file is the source of truth for a clean project.

create index if not exists memories_created_at_idx on public.memories (created_at desc);
create index if not exists memories_user_id_idx on public.memories (user_id);

-- Private storage bucket (exact name used by config.js MEMORIES_BUCKET)
insert into storage.buckets (id, name, public)
values (
  'Sons Of Thunder Memories',
  'Sons Of Thunder Memories',
  false
)
on conflict (id) do update set public = false, name = excluded.name;

-- Optional legacy public buckets (not used by current app.js; safe to ignore)
insert into storage.buckets (id, name, public)
values ('brother-photos', 'brother-photos', true)
on conflict (id) do nothing;

alter table public.brothers enable row level security;
alter table public.memories enable row level security;

drop policy if exists "brothers read" on public.brothers;
drop policy if exists "brothers upsert" on public.brothers;
drop policy if exists "brothers update" on public.brothers;
drop policy if exists "memories read" on public.memories;
drop policy if exists "memories insert" on public.memories;
drop policy if exists "memories update" on public.memories;
drop policy if exists "memories delete" on public.memories;

-- Brothers: readable by all (directory); writes open for simple fraternity use
create policy "brothers read" on public.brothers for select using (true);
create policy "brothers upsert" on public.brothers for insert with check (true);
create policy "brothers update" on public.brothers for update using (true);

-- Memories: signed-in brothers can read; insert only as yourself
create policy "memories read" on public.memories
  for select using (auth.role() = 'authenticated');

create policy "memories insert" on public.memories
  for insert with check (
    auth.role() = 'authenticated'
    and (user_id is null or user_id = auth.uid())
  );

create policy "memories update" on public.memories
  for update using (auth.uid() = user_id);

-- No authenticated DELETE on memories (per remediation: no DELETE permission)

-- Storage: private bucket — upload only under private/<own_uid>/ ; read via signed URLs
drop policy if exists "sot memories read" on storage.objects;
drop policy if exists "sot memories upload" on storage.objects;
drop policy if exists "sot memories update" on storage.objects;
drop policy if exists "sot memories delete" on storage.objects; -- drop if present; no DELETE policy recreated
drop policy if exists "brother photos public read" on storage.objects;
drop policy if exists "brother photos upload" on storage.objects;
drop policy if exists "memories public read" on storage.objects;
drop policy if exists "memories upload" on storage.objects;

create policy "sot memories read" on storage.objects
  for select using (
    bucket_id = 'Sons Of Thunder Memories'
    and auth.role() = 'authenticated'
  );

create policy "sot memories upload" on storage.objects
  for insert with check (
    bucket_id = 'Sons Of Thunder Memories'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'private'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "sot memories update" on storage.objects
  for update using (
    bucket_id = 'Sons Of Thunder Memories'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = 'private'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- No authenticated DELETE on storage objects for this bucket

-- Optional brother-photos (if used later)
create policy "brother photos public read" on storage.objects
  for select using (bucket_id = 'brother-photos');
create policy "brother photos upload" on storage.objects
  for insert with check (bucket_id = 'brother-photos');

-- Shared Events board (gathering note + Next Mission) — one row, id = 'default'
-- Leadership edits via app (PIN is UI-only). Writes require authenticated session.
-- Run this in Supabase SQL Editor for live shared notices.
create table if not exists public.events_board (
  id text primary key default 'default',
  events_note text default '',
  mission_title text default '',
  mission_detail text default '',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.events_board (id, events_note, mission_title, mission_detail)
values ('default', '', 'Outside the Patio', 'Range, lake, Word, or gym — details at the next gathering.')
on conflict (id) do nothing;

alter table public.events_board enable row level security;

drop policy if exists "events_board read" on public.events_board;
drop policy if exists "events_board insert" on public.events_board;
drop policy if exists "events_board update" on public.events_board;

-- Anyone can read published gathering notices (needed before login on Events page)
create policy "events_board read" on public.events_board
  for select using (true);

-- Writes open for fraternity use. Real gate is Leadership PIN in the app (mild, not real auth).
create policy "events_board insert" on public.events_board
  for insert with check (true);

create policy "events_board update" on public.events_board
  for update using (true);

-- Web Push subscriptions (Gathering alerts)
create table if not exists public.push_subs (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz default now()
);

alter table public.push_subs enable row level security;

drop policy if exists "push_subs read" on public.push_subs;
drop policy if exists "push_subs upsert" on public.push_subs;
drop policy if exists "push_subs update" on public.push_subs;
drop policy if exists "push_subs delete" on public.push_subs;

create policy "push_subs read" on public.push_subs for select using (true);
create policy "push_subs upsert" on public.push_subs for insert with check (true);
create policy "push_subs update" on public.push_subs for update using (true);
create policy "push_subs delete" on public.push_subs for delete using (true);

-- Web Push subscriptions (Gathering Alerts)
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

-- Allow anon insert/update/delete for opt-in (endpoint is opaque; no PII required)
drop policy if exists "push_subs_insert" on public.push_subscriptions;
create policy "push_subs_insert" on public.push_subscriptions for insert to anon, authenticated with check (true);

drop policy if exists "push_subs_update" on public.push_subscriptions;
create policy "push_subs_update" on public.push_subscriptions for update to anon, authenticated using (true) with check (true);

drop policy if exists "push_subs_delete" on public.push_subscriptions;
create policy "push_subs_delete" on public.push_subscriptions for delete to anon, authenticated using (true);

drop policy if exists "push_subs_select" on public.push_subscriptions;
create policy "push_subs_select" on public.push_subscriptions for select to anon, authenticated using (true);

-- ========== Shared Announcements (Home) ==========
-- Leadership publishes via app when signed in. Everyone can read.
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

create policy "announcements read" on public.announcements
  for select using (true);

-- Writes open; Leadership PIN in the app is the mild gate (same model as events_board)
create policy "announcements insert" on public.announcements
  for insert with check (true);

create policy "announcements update" on public.announcements
  for update using (true);

create policy "announcements delete" on public.announcements
  for delete using (true);

-- Seed locked live content (safe to re-run; upserts)
insert into public.announcements (id, title, body, created_at, sort_order) values
  (
    'ann-welcome',
    'Welcome to the Thunderboard, Gentlemen!',
    'This is our private room. Next Gathering, I''m In, announcements, the Brothers directory, Events & Memories, and The Code. Everything you need, nothing you don''t.',
    now(),
    0
  ),
  (
    'ann-next-meeting',
    'Next Meeting',
    'Next Gathering is Monday, September 14. Labor Day falls on the first Monday, so we move to the second Monday of the month — same rule every time a holiday hits the first.',
    now(),
    1
  ),
  (
    'ann-ai-night',
    'Is AI going to kill us?! Maybe but not today',
    'AI Night
At the next Gathering, Joel (our cyber security specialist) is breaking down AI — the good, the bad, and the ugly — and how we actually survive and use it without getting owned by it.',
    now(),
    2
  )
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  sort_order = excluded.sort_order;

-- Brothers: optional phone field for contact share
alter table public.brothers add column if not exists phone text default '';

-- Seed Events board with locked Heads Up + Next Mission
insert into public.events_board (id, events_note, mission_title, mission_detail, updated_at)
values (
  'default',
  'P.S. Got an interesting hobby that you think the fellas will like? Have a crazy story about your life that the guys could benefit from? This is your push to let us in on it and help grow the guys of the group!',
  'PARTY''S ON THE PATIO / DOWNTOWN WINTER GARDEN',
  'Gun Range, lake adventures, digging into the Word, or a Gym Giant — you''ll find your tribe here!',
  now()
)
on conflict (id) do update set
  events_note = excluded.events_note,
  mission_title = excluded.mission_title,
  mission_detail = excluded.mission_detail,
  updated_at = excluded.updated_at;

-- ============================================================
-- REALTIME (required once so postgres_changes reach the app)
-- Supabase Dashboard alternative: Database → Replication → enable
-- for tables: brothers, announcements, events_board, memories
-- ============================================================
alter table public.brothers replica identity full;
alter table public.announcements replica identity full;
alter table public.events_board replica identity full;
alter table public.memories replica identity full;

-- Add tables to the supabase_realtime publication (ignore if already added)
do $$
begin
  begin
    alter publication supabase_realtime add table public.brothers;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.announcements;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.events_board;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.memories;
  exception when duplicate_object then null;
  end;
end $$;
