-- Beer / hat raffle. One winner per prize per meeting. Check-in = ticket.
create table if not exists public.raffle_draws (
  meeting_key text not null,
  prize text not null,
  winner_id text,
  winner_name text,
  drawn_at timestamptz not null default now(),
  primary key (meeting_key, prize)
);
alter table public.raffle_draws enable row level security;
drop policy if exists raffle_read on public.raffle_draws;
drop policy if exists raffle_write on public.raffle_draws;
create policy raffle_read on public.raffle_draws for select using (true);
create policy raffle_write on public.raffle_draws
  for insert to authenticated
  with check (public.is_sot_leader());
create policy raffle_update on public.raffle_draws
  for update to authenticated
  using (public.is_sot_leader())
  with check (public.is_sot_leader());
