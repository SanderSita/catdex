-- Private profiles: an opt-in setting that removes a user's cats from other
-- users' `nearby_cats` map results (0009_public_nearby_cats.sql). Friends
-- can already see everything via the "select friends cats/sightings" RLS
-- policies (0005_friends.sql) regardless of this flag, so private only ever
-- narrows the *map* audience from "any nearby authenticated user" down to
-- "the owner and accepted friends". Public (the default) keeps today's
-- behavior unchanged.

alter table public.profiles add column is_private boolean not null default false;

create or replace function public.nearby_cats(
  viewer_lat double precision, viewer_lng double precision, radius_km double precision
)
returns setof public.cats
language sql
stable
security definer
set search_path = public
as $$
  select c.*
  from public.cats c
  join public.profiles p on p.id = c.user_id
  where public.haversine_km(viewer_lat, viewer_lng, c.lat, c.lng) <= least(radius_km, 25)
    and (
      not p.is_private
      or c.user_id = auth.uid()
      or public.are_friends(auth.uid(), c.user_id)
    )
  order by public.haversine_km(viewer_lat, viewer_lng, c.lat, c.lng)
  limit 300;
$$;
