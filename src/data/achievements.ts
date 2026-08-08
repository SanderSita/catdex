import { achievementColors } from '../theme';
import type { Achievement } from '../types/models';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-catch', label: 'First Catch', color: achievementColors[0] },
  {
    id: 'breed-hunter',
    label: 'Breed Hunter',
    color: achievementColors[1],
    progress: (s) => Math.min(s.breedsUnlocked / 5, 1),
  },
  {
    id: 'explorer',
    label: 'Explorer',
    color: achievementColors[2],
    progress: (s) => Math.min(s.catsFound / 10, 1),
  },
  { id: 'night-owl', label: 'Night Owl', color: achievementColors[3] },
  {
    id: 'streak-7',
    label: '7-Day Streak',
    color: achievementColors[4],
    progress: (s) => Math.min(s.dayStreak / 7, 1),
  },
  {
    id: 'local-legend',
    label: 'Local Legend',
    color: achievementColors[5],
    progress: (s) => Math.min(s.catsFound / 25, 1),
  },
];
