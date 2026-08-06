import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { searchBreeds } from '../services/breedService';
import { useBreedPickStore } from '../store/useBreedPickStore';
import { colors, fonts } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BreedSearch'>;

export function BreedSearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const results = searchBreeds(query);

  const pick = (breedId: string) => {
    useBreedPickStore.getState().pick(breedId);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Search breeds</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search…"
        placeholderTextColor={colors.textLight}
        style={styles.input}
        autoFocus
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => pick(item.id)}>
            <Text style={styles.rowText}>{item.name}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, paddingHorizontal: 20 },
  title: { fontFamily: fonts.headingSemi, fontSize: 20, color: colors.textDark, marginBottom: 14 },
  input: {
    backgroundColor: colors.creamMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: 12,
  },
  row: { paddingVertical: 14 },
  rowText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.textDark },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.creamMuted2 },
});
