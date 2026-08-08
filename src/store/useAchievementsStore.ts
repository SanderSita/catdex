import { create } from 'zustand';
import { subscribeToUnlockedAchievements } from '../services/achievementsService';

interface AchievementsState {
  unlockedIds: Set<string>;
  subscribe: (uid: string) => () => void;
}

export const useAchievementsStore = create<AchievementsState>((set) => ({
  unlockedIds: new Set(),
  subscribe: (uid: string) => subscribeToUnlockedAchievements(uid, (unlockedIds) => set({ unlockedIds })),
}));
