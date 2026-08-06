import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { UserStats } from '../types/models';

export interface UserProfile {
  displayName: string;
  avatarUrl: string | null;
  joinedAt: number;
  defaultRadiusKm: number;
  notificationsEnabled: boolean;
  stats: UserStats;
}

const DEFAULT_STATS: UserStats = { catsFound: 0, breedsUnlocked: 0, dayStreak: 0 };

const DEFAULTS: Omit<UserProfile, 'joinedAt'> = {
  displayName: 'New Catcher',
  avatarUrl: null,
  defaultRadiusKm: 3,
  notificationsEnabled: true,
  stats: DEFAULT_STATS,
};

function userDoc(uid: string) {
  return doc(db, 'users', uid);
}

export async function ensureUserProfile(uid: string): Promise<void> {
  const ref = userDoc(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...DEFAULTS, joinedAt: serverTimestamp() });
  }
}

export function subscribeToUserProfile(uid: string, onChange: (profile: UserProfile | null) => void) {
  return onSnapshot(userDoc(uid), (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data();
    onChange({
      displayName: data.displayName ?? DEFAULTS.displayName,
      avatarUrl: data.avatarUrl ?? null,
      joinedAt: data.joinedAt?.toMillis?.() ?? Date.now(),
      defaultRadiusKm: data.defaultRadiusKm ?? DEFAULTS.defaultRadiusKm,
      notificationsEnabled: data.notificationsEnabled ?? DEFAULTS.notificationsEnabled,
      stats: { ...DEFAULT_STATS, ...(data.stats ?? {}) },
    });
  });
}

export async function updateUserSettings(uid: string, patch: Partial<Pick<UserProfile, 'defaultRadiusKm' | 'notificationsEnabled'>>): Promise<void> {
  await updateDoc(userDoc(uid), patch);
}
