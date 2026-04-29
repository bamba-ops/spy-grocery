alter table public.products
  add column if not exists valid_from timestamptz,
  add column if not exists valid_to timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_validity_window_check'
  ) then
    alter table public.products
      add constraint products_validity_window_check
      check (
        valid_from is null
        or valid_to is null
        or valid_from <= valid_to
      );
  end if;
end $$;

update public.products
set
  valid_from = coalesce(
    valid_from,
    nullif(raw_payload #>> '{item,valid_from}', '')::timestamptz,
    nullif(raw_payload #>> '{item_detail,valid_from}', '')::timestamptz,
    nullif(raw_payload #>> '{flyer,valid_from}', '')::timestamptz
  ),
  valid_to = coalesce(
    valid_to,
    nullif(raw_payload #>> '{item,valid_to}', '')::timestamptz,
    nullif(raw_payload #>> '{item_detail,valid_to}', '')::timestamptz,
    nullif(raw_payload #>> '{flyer,valid_to}', '')::timestamptz
  )
where raw_payload is not null
  and (
    valid_from is null
    or valid_to is null
  );
