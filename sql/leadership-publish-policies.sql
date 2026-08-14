-- Run once in Supabase SQL Editor if Leadership Save still fails without sign-in.
-- Opens events_board + announcements writes (Leadership PIN is the app gate).

drop policy if exists "events_board insert" on public.events_board;
drop policy if exists "events_board update" on public.events_board;
create policy "events_board insert" on public.events_board for insert with check (true);
create policy "events_board update" on public.events_board for update using (true);

drop policy if exists "announcements insert" on public.announcements;
drop policy if exists "announcements update" on public.announcements;
drop policy if exists "announcements delete" on public.announcements;
create policy "announcements insert" on public.announcements for insert with check (true);
create policy "announcements update" on public.announcements for update using (true);
create policy "announcements delete" on public.announcements for delete using (true);
