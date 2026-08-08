-- Extends 0002_realtime.sql: profiles and unlocked_achievements are also
-- subscribed to via postgres_changes (userService.ts, achievementsService.ts)
-- but were never added to the publication, so live stat/badge updates
-- silently never arrived without a full app reload.
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.unlocked_achievements;
