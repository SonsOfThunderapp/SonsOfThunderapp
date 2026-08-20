-- Server-only log so gathering pings fire once per window.
create table if not exists public.push_dispatch (
  kind text not null,
  meeting_key text not null,
  sent_at timestamptz not null default now(),
  primary key (kind, meeting_key)
);
alter table public.push_dispatch enable row level security;
-- No policies: browser cannot read/write. Service role (Netlify) only.
