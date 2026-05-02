create or replace function public.set_products_seo_fields()
returns trigger
language plpgsql
as $function$
begin
  if tg_op = 'INSERT' then
    new.store_slug := coalesce(new.store_slug, nullif(public.to_slug(new.store), ''));
    new.title_slug := coalesce(new.title_slug, nullif(public.to_slug(new.title), ''));
    return new;
  end if;

  new.store_slug := coalesce(old.store_slug, new.store_slug, nullif(public.to_slug(new.store), ''));
  new.title_slug := coalesce(old.title_slug, new.title_slug, nullif(public.to_slug(new.title), ''));
  return new;
end;
$function$;
