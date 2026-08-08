-- Enable Realtime on tables the app subscribes to via postgres_changes.
-- Without this, subscribeToUserCats() (catsService.ts) never receives INSERT
-- events, so MapScreen — which stays mounted across tab navigation — never
-- learns about a newly saved cat until the app is fully reloaded.
-- Guarded with existence checks: some environments already had `cats` added
-- to the publication manually (e.g. via the dashboard) before this migration
-- existed, which makes the bare ALTER PUBLICATION fail with a duplicate-member error.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cats'
  ) then
    alter publication supabase_realtime add table public.cats;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sightings'
  ) then
    alter publication supabase_realtime add table public.sightings;
  end if;
end $$;
