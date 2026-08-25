-- Push subscriptions: CLIENT MUST NOT enumerate or wipe the list.
-- All read/list/delete-by-endpoint for broadcast runs via Netlify + SERVICE_ROLE.
-- Browser only ever talks to /.netlify/functions/push-subscribe|unsubscribe.

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  updated_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

-- Revoke direct table API access from browser roles
drop policy if exists "push_subs_insert" on public.push_subscriptions;
drop policy if exists "push_subs_update" on public.push_subscriptions;
drop policy if exists "push_subs_delete" on public.push_subscriptions;
drop policy if exists "push_subs_select" on public.push_subscriptions;

-- No policies for anon/authenticated = no direct REST access.
-- Service role bypasses RLS for Netlify functions only.

-- Optional: if you ever need authenticated self-manage without functions,
-- store user_id and policy endpoint ownership. Current architecture uses functions only.
