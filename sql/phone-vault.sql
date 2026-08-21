-- =============================================================================
-- PHONE VAULT — run in Supabase → SQL Editor. Safe to re-run.
-- Repo / Netlify deploy cannot apply this. Live anon REST stays open until you run it.
-- Goal: anon cannot SELECT brothers.phone (column hidden). Client already omits
-- phone when unsigned. Do not log numbers.
-- =============================================================================

alter table public.brothers enable row level security;

-- Directory stays publicly readable at the ROW level. Column privilege hides phone.
drop policy if exists "brothers read" on public.brothers;
create policy "brothers read" on public.brothers
  for select
  using (true);

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
