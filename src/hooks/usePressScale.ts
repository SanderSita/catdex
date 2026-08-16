import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SPRING_BOUNCY, SPRING_SNAPPY } from '../theme';
import * as haptics from '../utils/haptics';

interface Options {
  /** Scale while pressed. Defaults to 0.96. */
  pressedScale?: number;
  /** Fire a light haptic tick on press-in. Defaults to true. */
  haptic?: boolean;
}

/** Shared press-in/press-out scale animation + optional haptic, for any Pressable. */
export function usePressScale({ pressedScale = 0.96, haptic = true }: Options = {}) {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(pressedScale, SPRING_SNAPPY);
    if (haptic) haptics.tapLight();
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING_BOUNCY);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, animatedStyle };
}
