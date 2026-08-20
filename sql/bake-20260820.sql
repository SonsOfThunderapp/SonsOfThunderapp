-- Thunder Board bake — paste in a NEW Supabase query (line 1) and Run.
-- Safe to re-run. Does not wipe data. Axum table is separate (run that too if you haven't).

-- 1) Invites (empty table = nobody blocked. Once you add emails, only those can join.)
create table if not exists public.invites (
  email text primary key,
  invited_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.invites enable row level security;
drop policy if exists invites_leader_all on public.invites;
create policy invites_leader_all on public.invites
  for all to authenticated
  using (public.is_sot_leader())
  with check (public.is_sot_leader());

create or replace function public.invite_ok(e text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when (select count(*) from public.invites) = 0 then true
    else exists (
      select 1 from public.invites
      where lower(trim(email)) = lower(trim(e))
    )
  end;
$$;
revoke all on function public.invite_ok(text) from public;
grant execute on function public.invite_ok(text) to anon, authenticated;

-- 2) Push tied to a brother
alter table public.push_subscriptions add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists push_subs_user_idx on public.push_subscriptions (user_id);

-- 3) Showed up vs I'm In
alter table public.rsvps add column if not exists showed_up boolean not null default false;
alter table public.rsvps add column if not exists showed_at timestamptz;

-- 4) Last Fire — one shared row
create table if not exists public.last_fire (
  id text primary key default 'current',
  caption text default '',
  photo text default '',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.last_fire (id, caption, photo)
values ('current', '', '')
on conflict (id) do nothing;
alter table public.last_fire enable row level security;
drop policy if exists last_fire_read on public.last_fire;
drop policy if exists last_fire_write on public.last_fire;
create policy last_fire_read on public.last_fire for select using (true);
create policy last_fire_write on public.last_fire
  for update to authenticated
  using (public.is_sot_leader())
  with check (public.is_sot_leader());

-- 5) Memories glued to that gathering
alter table public.memories add column if not exists meeting_key text;
create index if not exists memories_meeting_idx on public.memories (meeting_key);
