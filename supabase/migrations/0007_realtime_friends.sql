-- Extends 0002_realtime.sql/0003_realtime_profiles_achievements.sql:
-- friendships is subscribed to via postgres_changes (friendsService.ts) so
-- FriendsScreen sees incoming requests and acceptances live. push_tokens is
-- server-read-only and doesn't need realtime.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'friendships'
  ) then
    alter publication supabase_realtime add table public.friendships;
  end if;
end $$;
