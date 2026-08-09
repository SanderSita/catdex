import { useEffect, useState } from 'react';
import { subscribeToFriendsCats } from '../services/friendsService';
import { filterWithinRadius } from '../services/geo';
import type { CatRecord } from '../types/models';
import type { Coords } from './useLocation';

/** Mirrors useNearbyCats, scoped to accepted friends' cats instead of the caller's own. */
export function useFriendsNearbyCats(friendUids: string[], coords: Coords | null, radiusKm: number) {
  const [allCats, setAllCats] = useState<CatRecord[]>([]);
  const key = friendUids.slice().sort().join(',');

  useEffect(() => {
    return subscribeToFriendsCats(friendUids, setAllCats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const nearby = coords ? filterWithinRadius(allCats, coords.lat, coords.lng, radiusKm) : [];

  return { allCats, nearby };
}
