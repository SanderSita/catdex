import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { fetchCat, fetchSightings } from '../services/catsService';
import { CatThumb } from '../components/CatThumb';
import { StatTile } from '../components/StatTile';
import type { CatRecord, Sighting } from '../types/models';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CatDetail'>;

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CatDetailScreen({ route, navigation }: Props) {
  const { catId } = route.params;
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);
  const [cat, setCat] = useState<CatRecord | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      const [catRecord, sightingList] = await Promise.all([
        fetchCat(uid, catId),
        fetchSightings(uid, catId),
      ]);
      if (cancelled) return;
      setCat(catRecord);
      setSightings(sightingList);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, catId]);

  if (loading || !cat) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.coral} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View>
          <View style={styles.photoWrap}>
            <CatThumb uri={cat.primaryPhotoUrl} shape="rect" />
            <Pressable style={[styles.roundButton, { top: insets.top + 12, left: 16 }]} onPress={() => navigation.goBack()}>
              <ChevronLeft size={20} color={colors.textDark} />
            </Pressable>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{cat.name}</Text>
              <View style={styles.breedBadge}>
                <Text style={styles.breedBadgeText}>{cat.breedName}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatTile value={cat.sightingCount} label="Sightings" />
              <StatTile value={formatDate(cat.firstSeenAt)} label="First seen" />
              <StatTile value={formatDate(cat.lastSeenAt)} label="Last seen" />
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Sighting history</Text>
          </View>
        </View>
      }
      data={sightings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      renderItem={({ item }) => (
        <View style={styles.historyRow}>
          <View style={styles.historyDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.historyLocation}>{item.locationLabel}</Text>
            <Text style={styles.historyDate}>{formatDate(item.capturedAt)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  photoWrap: { width: '100%', aspectRatio: 1 },
  roundButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlayLight85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: { paddingHorizontal: 20, paddingTop: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontFamily: fonts.headingSemi, fontSize: 24, color: colors.textDark },
  breedBadge: { backgroundColor: colors.coralBgSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  breedBadgeText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.coralTextSoft },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  historySection: { paddingHorizontal: 20, paddingTop: 20 },
  historyTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textDark, marginBottom: 10 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.creamMuted2,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tealDot },
  historyLocation: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textDark },
  historyDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
