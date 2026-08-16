import { Platform } from 'react-native';
import { colors } from './colors';

function shadow(color: string, opacity: number, radius: number, offsetY: number, elevation: number) {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: offsetY },
    ...Platform.select({ android: { elevation }, default: {} }),
  };
}

/** Named elevation levels. Higher levels sit "further" off the background. */
export const shadows = {
  level1: shadow('#000', 0.08, 4, 2, 2),
  level2: shadow('#000', 0.12, 8, 4, 4),
  level3: shadow('#000', 0.16, 14, 7, 8),
  /** For elements that float over other content, e.g. FABs, bottom sheets, modals. */
  floating: shadow('#000', 0.18, 16, 8, 10),
} as const;

/** A shadow tinted to match a given color, e.g. an achievement badge or the coral FAB. */
export function coloredGlow(color: string, opacity = 0.4) {
  return shadow(color, opacity, 10, 6, 6);
}

export const fabShadow = coloredGlow(colors.coral, 0.45);
