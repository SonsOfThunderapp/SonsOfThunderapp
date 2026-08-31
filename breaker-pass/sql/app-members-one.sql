-- Run once in Supabase SQL editor. Identity row per auth user.
alter table public.app_members add column if not exists email text;
alter table public.app_members add column if not exists brother_id text;
alter table public.app_members add column if not exists name text;
alter table public.app_members add column if not exists bio text;
alter table public.app_members add column if not exists phone text;
alter table public.app_members add column if not exists birthday text;
alter table public.app_members add column if not exists occupation text;
alter table public.app_members add column if not exists updated_at timestamptz default now();

create unique index if not exists app_members_user_id_uidx on public.app_members (user_id);

alter table public.app_members enable row level security;

drop policy if exists members_select_room on public.app_members;
create policy members_select_room on public.app_members
  for select using (auth.uid() is not null);

drop policy if exists members_upsert_own on public.app_members;
create policy members_upsert_own on public.app_members
  for insert with check (auth.uid() = user_id);

drop policy if exists members_update_own on public.app_members;
create policy members_update_own on public.app_members
  for update using (auth.uid() = user_id);
