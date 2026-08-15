-- Public map discovery: any authenticated user can see any cat's pin, but
-- only within a radius of their own current location (Pokemon-Go-style
-- "wild" sightings). Enforced via a SECURITY DEFINER function rather than a
-- public SELECT policy on `cats`, so the raw table stays owner+friends-only
-- (0001_init.sql / 0005_friends.sql policies untouched) — nobody can dump
-- every user's precise location with a raw REST query or an inflated radius.

create or replace function public.haversine_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
)
returns double precision
language sql
immutable
as $$
  select 2 * 6371 * asin(sqrt(
    sin(radians(lat2 - lat1) / 2) ^ 2 +
    cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lng2 - lng1) / 2) ^ 2
  ));
$$;

-- radius_km is clamped server-side (the UI only ever offers up to 10) so a
-- crafted call can't sweep a whole country.
create or replace function public.nearby_cats(
  viewer_lat double precision, viewer_lng double precision, radius_km double precision
)
returns setof public.cats
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.cats
  where public.haversine_km(viewer_lat, viewer_lng, lat, lng) <= least(radius_km, 25)
  order by public.haversine_km(viewer_lat, viewer_lng, lat, lng)
  limit 300;
$$;

grant execute on function public.haversine_km(double precision, double precision, double precision, double precision) to authenticated;
grant execute on function public.nearby_cats(double precision, double precision, double precision) to authenticated;
