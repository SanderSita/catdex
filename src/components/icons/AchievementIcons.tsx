import Svg, { Circle, Line, Path } from 'react-native-svg';
import type { AchievementIconProps } from '../../types/models';

export function PawIcon({ size, color }: AchievementIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx={12} cy={15.6} r={4.6} />
      <Circle cx={5.3} cy={10.2} r={2.15} />
      <Circle cx={9.4} cy={6.3} r={2.15} />
      <Circle cx={14.6} cy={6.3} r={2.15} />
      <Circle cx={18.7} cy={10.2} r={2.15} />
    </Svg>
  );
}

export function MagnifierIcon({ size, color }: AchievementIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.3} cy={10.3} r={6.3} stroke={color} strokeWidth={2} />
      <Line x1={15} y1={15} x2={20.3} y2={20.3} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function CompassIcon({ size, color }: AchievementIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Path d="M15.6 8.4L10.8 10.8L8.4 15.6L13.2 13.2Z" fill={color} />
    </Svg>
  );
}

export function MoonIcon({ size, color }: AchievementIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20 14.7A8.5 8.5 0 1 1 9.3 4a6.9 6.9 0 0 0 10.7 10.7Z" />
    </Svg>
  );
}

export function FlameIcon({ size, color }: AchievementIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C9.5 6 6.2 8.3 6.2 13a5.8 5.8 0 0 0 11.6 0c0-2.4-1.1-4.3-2.3-5.7c.3 1.8-.6 2.9-1.7 3.4C14.9 8.2 13 5.3 12 2Z" />
      <Path
        d="M12 9.2c-1.1 1.4-1.9 2.6-1.9 4a2.6 2.6 0 0 0 5.2 0c0-1.1-.5-2-1-2.7c.05.8-.3 1.3-.8 1.5C13.6 10.9 12.7 10 12 9.2Z"
        opacity={0.45}
      />
    </Svg>
  );
}

export function StarIcon({ size, color }: AchievementIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 3L14.6 9.2L21.3 9.8L16.2 14.1L17.8 20.7L12 17.1L6.2 20.7L7.8 14.1L2.7 9.8L9.4 9.2Z" />
    </Svg>
  );
}
