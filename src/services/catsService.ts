import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, ensureSignedIn } from './firebase';
import { encodeGeohash, geohashQueryBounds, filterWithinRadius } from './geo';
import type { CatRecord, Sighting } from '../types/models';

function catsCollection(uid: string) {
  return collection(db, 'users', uid, 'cats');
}

function sightingsCollection(uid: string, catId: string) {
  return collection(db, 'users', uid, 'cats', catId, 'sightings');
}

function toMillis(v: Timestamp | number | undefined): number {
  if (!v) return Date.now();
  return typeof v === 'number' ? v : v.toMillis();
}

export async function uploadCatPhoto(uid: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `users/${uid}/cats/${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
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
  const now = serverTimestamp();

  if (input.existingCatId) {
    const catRef = doc(db, 'users', user.uid, 'cats', input.existingCatId);
    await addDoc(sightingsCollection(user.uid, input.existingCatId), {
      photoUrl: input.photoUrl,
      geohash,
      lat: input.lat,
      lng: input.lng,
      locationLabel: input.locationLabel,
      capturedAt: now,
      breedGuess: input.breedName,
      breedConfidence: input.breedConfidence,
    });
    await updateDoc(catRef, { lastSeenAt: now });
    return input.existingCatId;
  }

  const catDoc = await addDoc(catsCollection(user.uid), {
    name: input.name,
    breedId: input.breedId,
    breedName: input.breedName,
    primaryPhotoUrl: input.photoUrl,
    geohash,
    lat: input.lat,
    lng: input.lng,
    locationLabel: input.locationLabel,
    firstSeenAt: now,
    lastSeenAt: now,
    sightingCount: 1,
  });
  await addDoc(sightingsCollection(user.uid, catDoc.id), {
    photoUrl: input.photoUrl,
    geohash,
    lat: input.lat,
    lng: input.lng,
    locationLabel: input.locationLabel,
    capturedAt: now,
    breedGuess: input.breedName,
    breedConfidence: input.breedConfidence,
  });
  return catDoc.id;
}

function mapCatDoc(d: { id: string; data: () => Record<string, unknown> }): CatRecord {
  const data = d.data() as Record<string, unknown>;
  return {
    id: d.id,
    name: (data.name as string) ?? 'Unnamed',
    breedId: (data.breedId as string | null) ?? null,
    breedName: (data.breedName as string) ?? 'Unknown',
    primaryPhotoUrl: (data.primaryPhotoUrl as string) ?? '',
    geohash: (data.geohash as string) ?? '',
    lat: (data.lat as number) ?? 0,
    lng: (data.lng as number) ?? 0,
    locationLabel: (data.locationLabel as string) ?? '',
    firstSeenAt: toMillis(data.firstSeenAt as Timestamp | undefined),
    lastSeenAt: toMillis(data.lastSeenAt as Timestamp | undefined),
    sightingCount: (data.sightingCount as number) ?? 1,
  };
}

/** All of the signed-in user's cats, live. Radius filtering happens client-side. */
export function subscribeToUserCats(uid: string, onChange: (cats: CatRecord[]) => void) {
  return onSnapshot(catsCollection(uid), (snap) => {
    onChange(snap.docs.map(mapCatDoc));
  });
}

export async function fetchNearbyCats(uid: string, lat: number, lng: number, radiusKm: number): Promise<CatRecord[]> {
  const bounds = geohashQueryBounds(lat, lng, radiusKm);
  const results = new Map<string, CatRecord>();
  for (const [start, end] of bounds) {
    const q = query(catsCollection(uid), where('geohash', '>=', start), where('geohash', '<', end));
    const snap = await getDocs(q);
    snap.docs.forEach((d) => results.set(d.id, mapCatDoc(d)));
  }
  return filterWithinRadius(Array.from(results.values()), lat, lng, radiusKm);
}

export async function fetchCat(uid: string, catId: string): Promise<CatRecord | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'cats', catId));
  return snap.exists() ? mapCatDoc(snap) : null;
}

export async function fetchSightings(uid: string, catId: string): Promise<Sighting[]> {
  const q = query(sightingsCollection(uid, catId), orderBy('capturedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      photoUrl: (data.photoUrl as string) ?? '',
      geohash: (data.geohash as string) ?? '',
      lat: (data.lat as number) ?? 0,
      lng: (data.lng as number) ?? 0,
      locationLabel: (data.locationLabel as string) ?? '',
      capturedAt: toMillis(data.capturedAt as Timestamp | undefined),
      breedGuess: (data.breedGuess as string | null) ?? null,
      breedConfidence: (data.breedConfidence as number | null) ?? null,
    };
  });
}
