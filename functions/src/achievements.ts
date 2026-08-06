// Mirrors src/data/achievements.ts on the client (kept as plain data here
// since Cloud Functions is a separate npm package from the Expo app).
// Any threshold change must be made in both places.
export interface AchievementDef {
  id: string;
  check: (stats: { catsFound: number; breedsUnlocked: number; dayStreak: number }) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-catch', check: (s) => s.catsFound >= 1 },
  { id: 'breed-hunter', check: (s) => s.breedsUnlocked >= 5 },
  { id: 'explorer', check: (s) => s.catsFound >= 10 },
  { id: 'streak-7', check: (s) => s.dayStreak >= 7 },
  { id: 'local-legend', check: (s) => s.catsFound >= 25 },
];
