import { useCallback, useEffect, useState } from 'react';
import { fetchPublicNearbyCats } from '../services/catsService';
import type { CatRecord } from '../types/models';
import type { Coords } from './useLocation';

/**
 * Any cat within radius, from any user — refetched (not live-subscribed,
 * since Realtime can't deliver cross-user rows without a public RLS policy)
 * whenever coords/radius change or the caller calls refetch().
 */
export function usePublicNearbyCats(coords: Coords | null, radiusKm: number) {
  const [cats, setCats] = useState<CatRecord[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const refetch = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    fetchPublicNearbyCats(coords.lat, coords.lng, radiusKm)
      .then((result) => {
        if (!cancelled) setCats(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng, radiusKm, refreshToken]);

  return { cats, refetch };
}
