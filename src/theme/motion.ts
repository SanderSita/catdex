import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

/** Snappy, low-overshoot — press feedback, toggles. */
export const SPRING_SNAPPY: WithSpringConfig = { damping: 16, stiffness: 260, mass: 0.7 };

/** Bouncier, more overshoot — celebratory pop-ins, unlocks, catches. */
export const SPRING_BOUNCY: WithSpringConfig = { damping: 9, stiffness: 140 };

export const TIMING_FAST: WithTimingConfig = { duration: 150, easing: Easing.out(Easing.quad) };
export const TIMING_MEDIUM: WithTimingConfig = { duration: 280, easing: Easing.out(Easing.cubic) };
