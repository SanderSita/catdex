import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function subscribeToUnlockedAchievements(uid: string, onChange: (unlockedIds: Set<string>) => void) {
  return onSnapshot(collection(db, 'users', uid, 'unlockedAchievements'), (snap) => {
    onChange(new Set(snap.docs.map((d) => d.id)));
  });
}
