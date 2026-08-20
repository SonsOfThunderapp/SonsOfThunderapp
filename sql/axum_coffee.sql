-- First sign-in Axum coffee. One row per user. Redeem once.
-- Run in Supabase SQL editor.

create table if not exists public.axum_coffee (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text unique not null,
  name text,
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz
);

alter table public.axum_coffee enable row level security;

drop policy if exists axum_coffee_select on public.axum_coffee;
drop policy if exists axum_coffee_insert on public.axum_coffee;
drop policy if exists axum_coffee_update on public.axum_coffee;

create policy axum_coffee_select on public.axum_coffee
  for select to authenticated using (auth.uid() = user_id);

create policy axum_coffee_insert on public.axum_coffee
  for insert to authenticated with check (auth.uid() = user_id);

create policy axum_coffee_update on public.axum_coffee
  for update to authenticated
  using (auth.uid() = user_id and redeemed_at is null)
  with check (auth.uid() = user_id);
