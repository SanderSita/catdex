import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

/** Light tick — button presses, tab switches, toggles. */
export function tapLight() {
  if (isWeb) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Slightly stronger tick — selecting a tile, confirming a choice. */
export function tapMedium() {
  if (isWeb) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Success buzz — saves, confirmations. */
export function success() {
  if (isWeb) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Bigger celebratory buzz — catching a cat, unlocking an achievement. */
export function catchCelebration() {
  if (isWeb) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 120);
}
