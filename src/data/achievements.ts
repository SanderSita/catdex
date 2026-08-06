import { achievementColors } from '../theme';
import type { Achievement } from '../types/models';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-catch', label: 'First Catch', color: achievementColors[0], check: (s) => s.catsFound >= 1 },
  { id: 'breed-hunter', label: 'Breed Hunter', color: achievementColors[1], check: (s) => s.breedsUnlocked >= 5 },
  { id: 'explorer', label: 'Explorer', color: achievementColors[2], check: (s) => s.catsFound >= 10 },
  { id: 'night-owl', label: 'Night Owl', color: achievementColors[3], check: () => false },
  { id: 'streak-7', label: '7-Day Streak', color: achievementColors[4], check: (s) => s.dayStreak >= 7 },
  { id: 'local-legend', label: 'Local Legend', color: achievementColors[5], check: (s) => s.catsFound >= 25 },
];
