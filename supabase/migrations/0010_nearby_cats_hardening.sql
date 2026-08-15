-- Pin search_path (matches handle_new_sighting's convention) and make sure
-- an unauthenticated (anon) session can't call nearby_cats — Postgres grants
-- EXECUTE to PUBLIC by default on function creation unless revoked.

create or replace function public.haversine_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
)
returns double precision
language sql
immutable
set search_path = public
as $$
  select 2 * 6371 * asin(sqrt(
    sin(radians(lat2 - lat1) / 2) ^ 2 +
    cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lng2 - lng1) / 2) ^ 2
  ));
$$;

-- Supabase grants EXECUTE to `anon` directly on new public-schema functions
-- by default (via default privileges, not just the PUBLIC pseudo-role), so
-- both must be revoked explicitly.
revoke execute on function public.haversine_km(double precision, double precision, double precision, double precision) from public, anon;
revoke execute on function public.nearby_cats(double precision, double precision, double precision) from public, anon;
grant execute on function public.haversine_km(double precision, double precision, double precision, double precision) to authenticated;
grant execute on function public.nearby_cats(double precision, double precision, double precision) to authenticated;
