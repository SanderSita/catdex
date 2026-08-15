import { achievementColors } from '../theme';

export const CAT_ICON_IDS = ['happy', 'sleepy', 'curious', 'grumpy', 'wink', 'surprised'] as const;
export type CatIconId = (typeof CAT_ICON_IDS)[number];

export const AVATAR_COLORS = achievementColors;

export const DEFAULT_AVATAR_ICON: CatIconId = 'happy';
export const DEFAULT_AVATAR_COLOR: string = AVATAR_COLORS[0];

export function isCatIconId(value: string): value is CatIconId {
  return (CAT_ICON_IDS as readonly string[]).includes(value);
}
