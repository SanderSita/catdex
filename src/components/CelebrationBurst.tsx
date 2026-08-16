import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SPRING_BOUNCY, TIMING_FAST } from '../theme';

const RAY_COUNT = 8;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => i * (360 / RAY_COUNT));

interface Props {
  /** Ray/glow color. */
  color: string;
  /** Size of the wrapped child, used to scale the burst around it. */
  size: number;
  /** Change this value to replay the animation (e.g. a new item in a queue). */
  replayKey: string | number;
  children: ReactNode;
}

/** Spring-in + radial burst-flash, for celebratory moments (achievement unlocks, catching a cat). */
export function CelebrationBurst({ color, size, replayKey, children }: Props) {
  const burstSize = size * 1.83;
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const burstScale = useSharedValue(0.3);
  const burstOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = 0.6;
    opacity.value = 0;
    scale.value = withSpring(1, SPRING_BOUNCY);
    opacity.value = withTiming(1, TIMING_FAST);

    burstScale.value = 0.3;
    burstOpacity.value = 0;
    burstScale.value = withTiming(1.3, { duration: 500 });
    burstOpacity.value = withSequence(withTiming(0.55, { duration: 150 }), withTiming(0, { duration: 450 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  const childStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: burstOpacity.value,
  }));

  return (
    <View style={[styles.stack, { width: burstSize, height: burstSize }]}>
      <Animated.View style={[styles.burst, { width: burstSize, height: burstSize }, burstStyle]}>
        {RAYS.map((deg) => (
          <View
            key={deg}
            style={[styles.ray, { backgroundColor: color, transform: [{ rotate: `${deg}deg` }, { translateY: -burstSize / 2 }] }]}
          />
        ))}
      </Animated.View>
      <Animated.View style={childStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center', justifyContent: 'center' },
  burst: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ray: { position: 'absolute', width: 5, height: 26, borderRadius: 3 },
});
