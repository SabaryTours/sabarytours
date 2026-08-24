-- Remove any lingering one-card-per-month constraint, regardless of its name.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.trip_year_outline'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) like '%year%month%'
  loop
    execute format(
      'alter table public.trip_year_outline drop constraint %I',
      constraint_row.conname
    );
  end loop;
end $$;

create index if not exists trip_year_outline_year_month_sort_idx
  on public.trip_year_outline (year, month, sort_order, updated_at desc);