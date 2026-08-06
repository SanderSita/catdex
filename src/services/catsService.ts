import { supabase, ensureSignedIn } from './supabase';
import { encodeGeohash, geohashQueryBounds, filterWithinRadius } from './geo';
import type { CatRecord, Sighting } from '../types/models';

interface CatRow {
  id: string;
  name: string;
  breed_id: string | null;
  breed_name: string;
  primary_photo_url: string;
  geohash: string;
  lat: number;
  lng: number;
  location_label: string;
  first_seen_at: string;
  last_seen_at: string;
  sighting_count: number;
}

interface SightingRow {
  id: string;
  photo_url: string;
  geohash: string;
  lat: number;
  lng: number;
  location_label: string;
  captured_at: string;
  breed_guess: string | null;
  breed_confidence: number | null;
}

function mapCatRow(row: CatRow): CatRecord {
  return {
    id: row.id,
    name: row.name,
    breedId: row.breed_id,
    breedName: row.breed_name,
    primaryPhotoUrl: row.primary_photo_url,
    geohash: row.geohash,
    lat: row.lat,
    lng: row.lng,
    locationLabel: row.location_label,
    firstSeenAt: new Date(row.first_seen_at).getTime(),
    lastSeenAt: new Date(row.last_seen_at).getTime(),
    sightingCount: row.sighting_count,
  };
}

function mapSightingRow(row: SightingRow): Sighting {
  return {
    id: row.id,
    photoUrl: row.photo_url,
    geohash: row.geohash,
    lat: row.lat,
    lng: row.lng,
    locationLabel: row.location_label,
    capturedAt: new Date(row.captured_at).getTime(),
    breedGuess: row.breed_guess,
    breedConfidence: row.breed_confidence,
  };
}

export async function uploadCatPhoto(uid: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `${uid}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('cat-photos')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg' });
  if (error) throw error;
  return supabase.storage.from('cat-photos').getPublicUrl(path).data.publicUrl;
}

export interface NewSightingInput {
  photoUrl: string;
  lat: number;
  lng: number;
  locationLabel: string;
  breedId: string | null;
  breedName: string;
  breedConfidence: number | null;
  name: string;
  /** When set, adds a sighting to this existing cat instead of creating a new one. */
  existingCatId?: string;
}

export async function saveSighting(input: NewSightingInput): Promise<string> {
  const user = await ensureSignedIn();
  const geohash = encodeGeohash(input.lat, input.lng);

  let catId: string;
  if (input.existingCatId) {
    catId = input.existingCatId;
  } else {
    const { data: cat, error: catError } = await supabase
      .from('cats')
      .insert({
        user_id: user.id,
        name: input.name,
        breed_id: input.breedId,
        breed_name: input.breedName,
        primary_photo_url: input.photoUrl,
        geohash,
        lat: input.lat,
        lng: input.lng,
        location_label: input.locationLabel,
      })
      .select('id')
      .single();
    if (catError) throw catError;
    catId = cat.id;
  }

  const { error: sightingError } = await supabase.from('sightings').insert({
    cat_id: catId,
    user_id: user.id,
    photo_url: input.photoUrl,
    geohash,
    lat: input.lat,
    lng: input.lng,
    location_label: input.locationLabel,
    breed_guess: input.breedName,
    breed_confidence: input.breedConfidence,
  });
  if (sightingError) throw sightingError;

  return catId;
}

/** All of the signed-in user's cats, live. Radius filtering happens client-side. */
export function subscribeToUserCats(uid: string, onChange: (cats: CatRecord[]) => void) {
  const load = async () => {
    const { data, error } = await supabase.from('cats').select('*').eq('user_id', uid);
    if (error) return;
    onChange((data as CatRow[]).map(mapCatRow));
  };
  load();

  const channel = supabase
    .channel(`cats:${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cats', filter: `user_id=eq.${uid}` }, load)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function fetchNearbyCats(uid: string, lat: number, lng: number, radiusKm: number): Promise<CatRecord[]> {
  const bounds = geohashQueryBounds(lat, lng, radiusKm);
  const results = new Map<string, CatRecord>();
  for (const [start, end] of bounds) {
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .eq('user_id', uid)
      .gte('geohash', start)
      .lt('geohash', end);
    if (error) throw error;
    (data as CatRow[]).forEach((row) => results.set(row.id, mapCatRow(row)));
  }
  return filterWithinRadius(Array.from(results.values()), lat, lng, radiusKm);
}

export async function fetchCat(uid: string, catId: string): Promise<CatRecord | null> {
  const { data, error } = await supabase
    .from('cats')
    .select('*')
    .eq('id', catId)
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCatRow(data as CatRow) : null;
}

export async function fetchSightings(uid: string, catId: string): Promise<Sighting[]> {
  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .eq('user_id', uid)
    .eq('cat_id', catId)
    .order('captured_at', { ascending: false });
  if (error) throw error;
  return (data as SightingRow[]).map(mapSightingRow);
}
