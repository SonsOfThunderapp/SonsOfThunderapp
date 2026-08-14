-- Run once in Supabase → SQL Editor (safe to re-run)
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subs_insert" on public.push_subscriptions;
create policy "push_subs_insert" on public.push_subscriptions for insert to anon, authenticated with check (true);

drop policy if exists "push_subs_update" on public.push_subscriptions;
create policy "push_subs_update" on public.push_subscriptions for update to anon, authenticated using (true) with check (true);

drop policy if exists "push_subs_delete" on public.push_subscriptions;
create policy "push_subs_delete" on public.push_subscriptions for delete to anon, authenticated using (true);

drop policy if exists "push_subs_select" on public.push_subscriptions;
create policy "push_subs_select" on public.push_subscriptions for select to anon, authenticated using (true);
