-- Lets a tour be published as a group departure instead of a private tour.
--
-- Group tours are real catalog entries: their own price tiers, images, itinerary
-- and inclusions. They are hidden from the private-tour listings (/featured-tours,
-- /packages/<category>) and surfaced through the Upcoming tours calendar instead,
-- so booking prices them from their own tiers rather than a private tour's.

alter table public.tours
  add column if not exists tour_type text not null default 'private';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tours'::regclass
      and conname = 'tours_tour_type_check'
  ) then
    alter table public.tours
      add constraint tours_tour_type_check
      check (tour_type in ('private', 'group'));
  end if;
end $$;

-- Everything that already exists stays a private tour.
update public.tours
set tour_type = 'private'
where tour_type is null;

-- Listings filter on (status, tour_type) together.
create index if not exists tours_status_tour_type_idx
  on public.tours (status, tour_type);
