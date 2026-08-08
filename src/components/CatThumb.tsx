import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';

interface CatThumbProps {
  uri?: string | null;
  shape?: 'circle' | 'rect' | 'rounded';
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function CatThumb({ uri, shape = 'rounded', size, style }: CatThumbProps) {
  const radius = shape === 'circle' ? 999 : shape === 'rect' ? 0 : 16;
  return (
    <View
      style={[
        styles.wrap,
        { borderRadius: radius },
        size ? { width: size, height: size } : null,
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.creamMuted2,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.creamMuted3,
  },
});
