import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { CatThumb } from './CatThumb';
import { usePressScale } from '../hooks/usePressScale';
import { colors, fonts, shadows } from '../theme';
import type { CatRecord } from '../types/models';

interface CatsGridProps {
  cats: CatRecord[];
  onPressCat: (catId: string) => void;
  emptyLabel: string;
}

function CatTile({ cat, onPress }: { cat: CatRecord; onPress: () => void }) {
  const { onPressIn, onPressOut, animatedStyle } = usePressScale({ pressedScale: 0.94, haptic: false });

  return (
    <Pressable style={styles.gridCell} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.unlockedTile, animatedStyle]}>
        <CatThumb uri={cat.primaryPhotoUrl} shape="rounded" />
      </Animated.View>
      <Text style={styles.tileLabelUnlocked} numberOfLines={1}>
        {cat.name}
      </Text>
    </Pressable>
  );
}

/** Extracted from CollectionScreen's "cats" tab so it can be reused read-only for a friend's collection. */
export function CatsGrid({ cats, onPressCat, emptyLabel }: CatsGridProps) {
  return (
    <FlatList
      data={cats}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => <CatTile cat={item} onPress={() => onPressCat(item.id)} />}
      ListEmptyComponent={<Text style={styles.emptyText}>{emptyLabel}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 10 },
  gridCell: { flex: 1 / 3, alignItems: 'center', gap: 6 },
  unlockedTile: { width: '100%', aspectRatio: 1, borderRadius: 18, ...shadows.level1 },
  tileLabelUnlocked: { fontFamily: fonts.bodySemi, fontSize: 11, textAlign: 'center', color: colors.textDark },
  emptyText: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
