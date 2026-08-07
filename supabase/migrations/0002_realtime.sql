-- Enable Realtime on tables the app subscribes to via postgres_changes.
-- Without this, subscribeToUserCats() (catsService.ts) never receives INSERT
-- events, so MapScreen — which stays mounted across tab navigation — never
-- learns about a newly saved cat until the app is fully reloaded.
alter publication supabase_realtime add table public.cats;
alter publication supabase_realtime add table public.sightings;
