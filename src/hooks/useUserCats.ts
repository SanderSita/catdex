import { useEffect, useState } from 'react';
import { subscribeToUserCats } from '../services/catsService';
import type { CatRecord } from '../types/models';

export function useUserCats(uid: string | null) {
  const [cats, setCats] = useState<CatRecord[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserCats(uid, setCats);
  }, [uid]);

  return cats;
}
