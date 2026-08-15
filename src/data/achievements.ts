import { achievementColors } from '../theme';
import { CompassIcon, FlameIcon, MagnifierIcon, MoonIcon, PawIcon, StarIcon } from '../components/icons/AchievementIcons';
import type { Achievement } from '../types/models';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-catch', color: achievementColors[0], icon: PawIcon },
  {
    id: 'breed-hunter',
    color: achievementColors[1],
    icon: MagnifierIcon,
    progress: (s) => Math.min(s.breedsUnlocked / 5, 1),
  },
  {
    id: 'explorer',
    color: achievementColors[2],
    icon: CompassIcon,
    progress: (s) => Math.min(s.catsFound / 10, 1),
  },
  { id: 'night-owl', color: achievementColors[3], icon: MoonIcon },
  {
    id: 'streak-7',
    color: achievementColors[4],
    icon: FlameIcon,
    progress: (s) => Math.min(s.dayStreak / 7, 1),
  },
  {
    id: 'local-legend',
    color: achievementColors[5],
    icon: StarIcon,
    progress: (s) => Math.min(s.catsFound / 25, 1),
  },
];
