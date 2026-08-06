import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { useBreedPickStore } from '../store/useBreedPickStore';
import { uploadCatPhoto, saveSighting, subscribeToUserCats } from '../services/catsService';
import { classifyBreed, type BreedGuess } from '../services/breedService';
import { breedNameById } from '../data/breeds';
import { CatThumb } from '../components/CatThumb';
import { PrimaryButton } from '../components/PrimaryButton';
import type { CatRecord } from '../types/models';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NewSighting'>;

export function NewSightingScreen({ route, navigation }: Props) {
  const { photoUri, lat, lng } = route.params;
  const insets = useSafeAreaInsets();
  const uid = useAuthStore((s) => s.uid);

  const [locationLabel, setLocationLabel] = useState('Locating…');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [guess, setGuess] = useState<BreedGuess | null>(null);
  const [breedOverrideId, setBreedOverrideId] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(true);
  const [name, setName] = useState('');
  const [userCats, setUserCats] = useState<CatRecord[]>([]);
  const [existingCatId, setExistingCatId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
      .then(([place]) => {
        if (place) {
          setLocationLabel([place.street, place.city].filter(Boolean).join(', ') || 'Unknown location');
        } else {
          setLocationLabel('Unknown location');
        }
      })
      .catch(() => setLocationLabel('Unknown location'));
  }, [lat, lng]);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserCats(uid, setUserCats);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const url = await uploadCatPhoto(uid, photoUri);
        if (cancelled) return;
        setUploadedUrl(url);
        const result = await classifyBreed(url);
        if (cancelled) return;
        setGuess(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not identify this cat.');
      } finally {
        if (!cancelled) setClassifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, photoUri]);

  useFocusEffect(
    useCallback(() => {
      const picked = useBreedPickStore.getState().consume();
      if (picked) setBreedOverrideId(picked);
    }, [])
  );

  const activeBreedId = breedOverrideId ?? guess?.breedId ?? null;
  const activeBreedName = breedOverrideId ? breedNameById(breedOverrideId) : guess?.breedName ?? null;

  const canSave = Boolean(uploadedUrl && name.trim() && !saving);

  const onSave = async () => {
    if (!uploadedUrl) return;
    setSaving(true);
    setError(null);
    try {
      const catId = await saveSighting({
        photoUrl: uploadedUrl,
        lat,
        lng,
        locationLabel,
        breedId: activeBreedId,
        breedName: activeBreedName ?? 'Unknown',
        breedConfidence: breedOverrideId ? null : guess?.confidencePercent ?? null,
        name: name.trim(),
        existingCatId: existingCatId ?? undefined,
      });
      navigation.replace('CatDetail', { catId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this sighting.');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.newSightingBadge}>
          <Text style={styles.newSightingText}>New Sighting!</Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.photoWrap}>
        <CatThumb uri={photoUri} shape="rect" />
      </View>

      <View style={styles.section}>
        <View style={styles.breedCard}>
          <View>
            <Text style={styles.breedLabel}>Suggested breed</Text>
            <Text style={styles.breedName}>
              {classifying ? 'Identifying…' : activeBreedName ?? 'Unknown'}
            </Text>
          </View>
          {classifying ? (
            <ActivityIndicator color={colors.tealPercent} />
          ) : !breedOverrideId && guess ? (
            <Text style={styles.matchPercent}>{guess.confidencePercent}% match</Text>
          ) : null}
        </View>
        <Pressable style={styles.searchLink} onPress={() => navigation.navigate('BreedSearch')}>
          <Text style={styles.searchLinkText}>Not right? Search breeds</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Give this cat a name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Marmalade"
          placeholderTextColor={colors.textLight}
          style={styles.nameInput}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <TextInput value={locationLabel} onChangeText={setLocationLabel} style={styles.locationInput} />
        </View>
      </View>

      {userCats.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Seen this cat before? Add to an existing entry</Text>
          <FlatList
            horizontal
            data={userCats}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const selected = existingCatId === item.id;
              return (
                <Pressable
                  onPress={() => setExistingCatId(selected ? null : item.id)}
                  style={[styles.existingCatTile, selected ? styles.existingCatTileSelected : null]}
                >
                  <CatThumb uri={item.primaryPhotoUrl} shape="circle" size={48} />
                  <Text style={styles.existingCatName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.section}>
        <PrimaryButton label={existingCatId ? 'Add sighting' : 'Add to CatDex'} onPress={onSave} disabled={!canSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.creamMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textMid, fontSize: 14 },
  newSightingBadge: { backgroundColor: colors.coralBgSoft, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  newSightingText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.coralTextSoft },
  photoWrap: { paddingHorizontal: 20, paddingTop: 14, aspectRatio: 1, borderRadius: 24, overflow: 'hidden' },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  breedCard: {
    backgroundColor: colors.tealBgSoft,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breedLabel: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.tealTextMuted },
  breedName: { fontFamily: fonts.headingSemi, fontSize: 17, color: colors.tealHeading, marginTop: 2 },
  matchPercent: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.tealPercent },
  searchLink: { alignSelf: 'flex-end', marginTop: 6 },
  searchLinkText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.teal },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textMid, marginBottom: 6 },
  nameInput: {
    backgroundColor: colors.creamMuted,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textDark,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.coral },
  locationInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textMid },
  existingCatTile: { alignItems: 'center', width: 64, gap: 4, padding: 4, borderRadius: 12 },
  existingCatTileSelected: { backgroundColor: colors.coralBgSoft },
  existingCatName: { fontFamily: fonts.body, fontSize: 11, color: colors.textMid },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13, paddingHorizontal: 20, paddingTop: 12 },
});
