import { supabase } from './supabase';
import { BREEDS, breedIdFromModelLabel, breedNameById } from '../data/breeds';
import i18n, { tKey } from '../i18n';
import type { Breed } from '../types/models';

interface ClassifyBreedResponse {
  label: string | null;
  confidence: number;
}

export interface BreedGuess {
  breedId: string | null;
  breedName: string;
  confidencePercent: number;
}

/**
 * Calls the classify-breed Edge Function, which proxies to the Roboflow
 * "cat-breeds-2n7zk/2" hosted model server-side (keeps the API key out of
 * the client). photoUrl must already be a reachable Storage download URL.
 */
export async function classifyBreed(photoUrl: string): Promise<BreedGuess> {
  const { data, error } = await supabase.functions.invoke<ClassifyBreedResponse>('classify-breed', {
    body: { photoUrl },
  });
  if (error) throw error;
  if (!data) throw new Error(i18n.t('errors.classifierNoData'));
  const breedId = data.label ? breedIdFromModelLabel(data.label) : null;
  return {
    breedId,
    breedName: breedId ? breedNameById(breedId, i18n.t) : data.label ?? i18n.t('common.unknown'),
    confidencePercent: Math.round(data.confidence * 100),
  };
}

export function searchBreeds(query: string): Breed[] {
  const q = query.trim().toLowerCase();
  if (!q) return BREEDS;
  return BREEDS.filter((b) => tKey(i18n.t, `breeds.${b.id}`).toLowerCase().includes(q));
}
