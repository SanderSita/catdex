import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { CatThumb } from './CatThumb';
import { colors, fonts } from '../theme';
import type { CatRecord } from '../types/models';

interface CatsGridProps {
  cats: CatRecord[];
  onPressCat: (catId: string) => void;
  emptyLabel: string;
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
      renderItem={({ item }) => (
        <Pressable style={styles.gridCell} onPress={() => onPressCat(item.id)}>
          <CatThumb uri={item.primaryPhotoUrl} shape="rounded" />
          <Text style={styles.tileLabelUnlocked} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>{emptyLabel}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 10 },
  gridCell: { flex: 1 / 3, alignItems: 'center', gap: 6 },
  tileLabelUnlocked: { fontFamily: fonts.bodySemi, fontSize: 11, textAlign: 'center', color: colors.textDark },
  emptyText: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
