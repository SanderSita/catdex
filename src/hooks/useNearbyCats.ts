import { useEffect, useState } from 'react';
import { subscribeToUserCats } from '../services/catsService';
import { filterWithinRadius } from '../services/geo';
import type { CatRecord } from '../types/models';
import type { Coords } from './useLocation';

/**
 * Live-subscribes to all of the user's cats and filters to a radius
 * client-side. Simpler than re-running a geohash range query on every pan
 * (fine at v1 scale — a single user's own cats, not a shared dataset).
 */
export function useNearbyCats(uid: string | null, coords: Coords | null, radiusKm: number) {
  const [allCats, setAllCats] = useState<CatRecord[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserCats(uid, setAllCats);
  }, [uid]);

  const nearby = coords ? filterWithinRadius(allCats, coords.lat, coords.lng, radiusKm) : [];

  return { allCats, nearby };
}
