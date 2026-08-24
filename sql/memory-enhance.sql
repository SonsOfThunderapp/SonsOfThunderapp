-- Memories polish pipeline. Original stays. Display is a derivative.
-- Run once in Supabase SQL editor. Safe to re-run.

alter table public.memories add column if not exists original_path text;
alter table public.memories add column if not exists display_path text;
alter table public.memories add column if not exists card_path text;
alter table public.memories add column if not exists enhance_status text default '';
alter table public.memories add column if not exists enhance_error text;

update public.memories
set original_path = storage_path
where original_path is null and storage_path is not null;
