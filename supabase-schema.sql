-- Thunder Board shared data schema
-- Run once in Supabase → SQL Editor

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

-- Memories (photos/videos metadata; files in Storage)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  brother_id text,
  caption text default '',
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  created_at timestamptz default now()
);

create index if not exists memories_created_at_idx on public.memories (created_at desc);

-- Storage buckets (run in SQL; or create in Dashboard → Storage)
insert into storage.buckets (id, name, public)
values ('brother-photos', 'brother-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

-- Open read for brotherhood app (anon). Writes allowed with anon key for simplicity
-- (private fraternity app; tighten later with auth if needed)
alter table public.brothers enable row level security;
alter table public.memories enable row level security;

drop policy if exists "brothers read" on public.brothers;
drop policy if exists "brothers upsert" on public.brothers;
drop policy if exists "brothers update" on public.brothers;
drop policy if exists "memories read" on public.memories;
drop policy if exists "memories insert" on public.memories;

create policy "brothers read" on public.brothers for select using (true);
create policy "brothers upsert" on public.brothers for insert with check (true);
create policy "brothers update" on public.brothers for update using (true);

create policy "memories read" on public.memories for select using (true);
create policy "memories insert" on public.memories for insert with check (true);

-- Storage policies: public read, anon upload
drop policy if exists "brother photos public read" on storage.objects;
drop policy if exists "brother photos upload" on storage.objects;
drop policy if exists "memories public read" on storage.objects;
drop policy if exists "memories upload" on storage.objects;

create policy "brother photos public read" on storage.objects
  for select using (bucket_id = 'brother-photos');
create policy "brother photos upload" on storage.objects
  for insert with check (bucket_id = 'brother-photos');

create policy "memories public read" on storage.objects
  for select using (bucket_id = 'memories');
create policy "memories upload" on storage.objects
  for insert with check (bucket_id = 'memories');
