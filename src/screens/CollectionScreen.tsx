import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useUserCats } from '../hooks/useUserCats';
import { BREEDS } from '../data/breeds';
import { CatThumb } from '../components/CatThumb';
import { ProgressBar } from '../components/ProgressBar';
import { colors, fonts } from '../theme';

type Props = TabScreenProps<'Collection'>;

type Tab = 'breeds' | 'cats';

export function CollectionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const cats = useUserCats(uid);
  const [tab, setTab] = useState<Tab>('breeds');

  const breedTiles = useMemo(() => {
    return BREEDS.map((breed) => {
      const owned = cats.find((c) => c.breedId === breed.id);
      return { breed, unlocked: Boolean(owned), photoUrl: owned?.primaryPhotoUrl ?? null };
    });
  }, [cats]);

  const unlockedCount = breedTiles.filter((t) => t.unlocked).length;
  const percent = BREEDS.length ? Math.round((unlockedCount / BREEDS.length) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My CatDex</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {unlockedCount} of {BREEDS.length} breeds discovered
          </Text>
          <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
        <ProgressBar percent={percent} />
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, tab === 'breeds' ? styles.tabButtonActive : styles.tabButtonInactive]}
          onPress={() => setTab('breeds')}
        >
          <Text style={[styles.tabLabel, tab === 'breeds' ? styles.tabLabelActive : styles.tabLabelInactive]}>
            Breeds
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === 'cats' ? styles.tabButtonActive : styles.tabButtonInactive]}
          onPress={() => setTab('cats')}
        >
          <Text style={[styles.tabLabel, tab === 'cats' ? styles.tabLabelActive : styles.tabLabelInactive]}>
            My Cats
          </Text>
        </Pressable>
      </View>

      {tab === 'breeds' ? (
        <FlatList
          data={breedTiles}
          keyExtractor={(item) => item.breed.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.gridCell}>
              {item.unlocked ? (
                <CatThumb uri={item.photoUrl} shape="rounded" />
              ) : (
                <View style={styles.lockedTile}>
                  <View style={styles.lockedDot} />
                </View>
              )}
              <Text style={[styles.tileLabel, item.unlocked ? styles.tileLabelUnlocked : null]} numberOfLines={1}>
                {item.breed.name}
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={cats}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable style={styles.gridCell} onPress={() => navigation.navigate('CatDetail', { catId: item.id })}>
              <CatThumb uri={item.primaryPhotoUrl} shape="rounded" />
              <Text style={styles.tileLabelUnlocked} numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No cats caught yet — go find one!</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  header: { paddingHorizontal: 20 },
  title: { fontFamily: fonts.headingSemi, fontSize: 24, color: colors.textDark },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 8 },
  progressLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textMuted },
  progressPercent: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.teal },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 16 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  tabButtonActive: { backgroundColor: colors.coral },
  tabButtonInactive: { backgroundColor: colors.creamMuted },
  tabLabel: { fontFamily: fonts.bodyBold, fontSize: 14 },
  tabLabelActive: { color: colors.white },
  tabLabelInactive: { color: colors.textMid },
  grid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 10 },
  gridCell: { flex: 1 / 3, alignItems: 'center', gap: 6 },
  lockedTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: colors.creamMuted2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.creamMuted3 },
  tileLabel: { fontFamily: fonts.bodySemi, fontSize: 11, textAlign: 'center', color: colors.textLight },
  tileLabelUnlocked: { fontFamily: fonts.bodySemi, fontSize: 11, textAlign: 'center', color: colors.textDark },
  emptyText: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
