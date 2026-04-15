-- Add selected store tracking for onboarding v2 resume flow.
alter table public.onboarding
  add column if not exists selected_store_slug text;

create index if not exists onboarding_selected_store_slug_idx
  on public.onboarding (selected_store_slug);
