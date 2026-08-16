import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { tKey } from '../i18n';
import type { TabScreenProps } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useUserCats } from '../hooks/useUserCats';
import { BREEDS } from '../data/breeds';
import { CatThumb } from '../components/CatThumb';
import { CatsGrid } from '../components/CatsGrid';
import { ProgressBar } from '../components/ProgressBar';
import { usePressScale } from '../hooks/usePressScale';
import { colors, fonts, shadows, TIMING_MEDIUM } from '../theme';

type Props = TabScreenProps<'Collection'>;

type Tab = 'breeds' | 'cats';

const TABS: Tab[] = ['breeds', 'cats'];

/** Wraps a grid cell in a small staggered fade+rise-in on mount, for a game-menu-reveal feel. */
function AnimatedGridCell({ index, children }: { index: number; children: React.ReactNode }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(Math.min(index, 20) * 30, withTiming(1, TIMING_MEDIUM));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return <Animated.View style={[styles.gridCell, style]}>{children}</Animated.View>;
}

interface BreedTileProps {
  unlocked: boolean;
  photoUrl: string | null;
  label: string;
  onPress?: () => void;
}

function BreedTile({ unlocked, photoUrl, label, onPress }: BreedTileProps) {
  const { onPressIn, onPressOut, animatedStyle } = usePressScale({ pressedScale: 0.94, haptic: false });

  if (!unlocked) {
    return (
      <View style={styles.tileContent}>
        <View style={styles.lockedTile}>
          <LinearGradient
            colors={['rgba(58,52,46,0.05)', 'rgba(58,52,46,0.22)']}
            style={StyleSheet.absoluteFill}
          />
          <Lock size={20} color={colors.textLight} />
        </View>
        <Text style={styles.tileLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Pressable style={styles.tileContent} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.unlockedTile, animatedStyle]}>
        <CatThumb uri={photoUrl} shape="rounded" />
      </Animated.View>
      <Text style={styles.tileLabelUnlocked} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function CollectionScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const uid = useAuthStore((s) => s.uid);
  const cats = useUserCats(uid);
  const [tab, setTab] = useState<Tab>('breeds');
  const translateX = useSharedValue(0);

  const goToTab = (next: Tab) => {
    setTab(next);
    translateX.value = withTiming(-TABS.indexOf(next) * width, { duration: 250 });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const base = -TABS.indexOf(tab) * width;
      translateX.value = base + e.translationX;
    })
    .onEnd((e) => {
      const currentIndex = TABS.indexOf(tab);
      let nextIndex = currentIndex;
      if (e.translationX < -width * 0.25 || e.velocityX < -500) {
        nextIndex = Math.min(currentIndex + 1, TABS.length - 1);
      } else if (e.translationX > width * 0.25 || e.velocityX > 500) {
        nextIndex = Math.max(currentIndex - 1, 0);
      }
      translateX.value = withTiming(-nextIndex * width, { duration: 250 });
      runOnJS(setTab)(TABS[nextIndex]);
    });

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const breedTiles = useMemo(() => {
    return BREEDS.map((breed) => {
      const owned = cats.find((c) => c.breedId === breed.id);
      return { breed, unlocked: Boolean(owned), photoUrl: owned?.primaryPhotoUrl ?? null, catId: owned?.id ?? null };
    });
  }, [cats]);

  const unlockedCount = breedTiles.filter((t) => t.unlocked).length;
  const percent = BREEDS.length ? Math.round((unlockedCount / BREEDS.length) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('collection.title')}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {t('collection.progress', { unlocked: unlockedCount, total: BREEDS.length })}
          </Text>
          <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
        <ProgressBar percent={percent} />
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, tab === 'breeds' ? styles.tabButtonActive : styles.tabButtonInactive]}
          onPress={() => goToTab('breeds')}
        >
          <Text style={[styles.tabLabel, tab === 'breeds' ? styles.tabLabelActive : styles.tabLabelInactive]}>
            {t('collection.breedsTab')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === 'cats' ? styles.tabButtonActive : styles.tabButtonInactive]}
          onPress={() => goToTab('cats')}
        >
          <Text style={[styles.tabLabel, tab === 'cats' ? styles.tabLabelActive : styles.tabLabelInactive]}>
            {t('collection.catsTab')}
          </Text>
        </Pressable>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.pagerViewport}>
          <Animated.View style={[styles.pager, { width: width * TABS.length }, pagerStyle]}>
            <View style={{ width }}>
              <FlatList
                data={breedTiles}
                keyExtractor={(item) => item.breed.id}
                numColumns={3}
                columnWrapperStyle={{ gap: 10 }}
                contentContainerStyle={styles.grid}
                renderItem={({ item, index }) => (
                  <AnimatedGridCell index={index}>
                    <BreedTile
                      unlocked={item.unlocked}
                      photoUrl={item.photoUrl}
                      label={tKey(t, `breeds.${item.breed.id}`)}
                      onPress={item.catId ? () => navigation.navigate('CatDetail', { catId: item.catId! }) : undefined}
                    />
                  </AnimatedGridCell>
                )}
              />
            </View>
            <View style={{ width }}>
              <CatsGrid
                cats={cats}
                onPressCat={(catId) => navigation.navigate('CatDetail', { catId })}
                emptyLabel={t('collection.empty')}
              />
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
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
  pagerViewport: { flex: 1, overflow: 'hidden' },
  pager: { flex: 1, flexDirection: 'row' },
  grid: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 10 },
  gridCell: { flex: 1 / 3 },
  tileContent: { alignItems: 'center', gap: 6 },
  unlockedTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    ...shadows.level1,
  },
  lockedTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: colors.creamMuted2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileLabel: { fontFamily: fonts.bodySemi, fontSize: 11, textAlign: 'center', color: colors.textLight },
  tileLabelUnlocked: { fontFamily: fonts.bodySemi, fontSize: 11, textAlign: 'center', color: colors.textDark },
});
