import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { CatIconId } from '../../data/avatars';
import { coloredGlow } from '../../theme';

interface Props {
  expression: CatIconId;
  color: string;
  faceColor?: string;
  size?: number;
}

const VIEWBOX = 64;

export function CatFaceIcon({ expression, color, faceColor = '#FFFFFF', size = 64 }: Props) {
  return (
    <View style={[styles.outer, { borderRadius: size / 2 }, coloredGlow(color, 0.25)]}>
      <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          <Path d="M14 20 L22 6 L28 20 Z" fill={faceColor} />
          <Path d="M36 20 L42 6 L50 20 Z" fill={faceColor} />
          <Eyes expression={expression} faceColor={faceColor} />
          <Mouth expression={expression} faceColor={faceColor} />
        </Svg>
      </View>
    </View>
  );
}

function Eyes({ expression, faceColor }: { expression: CatIconId; faceColor: string }) {
  switch (expression) {
    case 'sleepy':
      return (
        <>
          <Path d="M20 34 Q24 38 28 34" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M36 34 Q40 38 44 34" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        </>
      );
    case 'curious':
      return (
        <>
          <Path d="M18 27 Q22 24 26 27" stroke={faceColor} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Circle cx="22" cy="34" r="4" fill={faceColor} />
          <Circle cx="40" cy="34" r="3" fill={faceColor} />
        </>
      );
    case 'grumpy':
      return (
        <>
          <Path d="M19 29 L27 32" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M45 29 L37 32" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx="24" cy="36" r="2.5" fill={faceColor} />
          <Circle cx="40" cy="36" r="2.5" fill={faceColor} />
        </>
      );
    case 'wink':
      return (
        <>
          <Path d="M20 34 Q24 38 28 34" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Circle cx="40" cy="34" r="3" fill={faceColor} />
        </>
      );
    case 'surprised':
      return (
        <>
          <Circle cx="24" cy="35" r="5" fill={faceColor} />
          <Circle cx="40" cy="35" r="5" fill={faceColor} />
        </>
      );
    case 'happy':
    default:
      return (
        <>
          <Circle cx="24" cy="34" r="3" fill={faceColor} />
          <Circle cx="40" cy="34" r="3" fill={faceColor} />
        </>
      );
  }
}

function Mouth({ expression, faceColor }: { expression: CatIconId; faceColor: string }) {
  switch (expression) {
    case 'sleepy':
      return <Path d="M28 46 L36 46" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" />;
    case 'curious':
      return <Circle cx="32" cy="47" r="2" fill={faceColor} />;
    case 'grumpy':
      return <Path d="M24 49 Q32 44 40 49" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" fill="none" />;
    case 'wink':
    case 'happy':
      return <Path d="M24 44 Q32 50 40 44" stroke={faceColor} strokeWidth={2.5} strokeLinecap="round" fill="none" />;
    case 'surprised':
      return <Circle cx="32" cy="48" r="4" fill={faceColor} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  outer: {},
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
