export interface Breed {
  id: string;
  /** Label(s) the Roboflow model returns that map to this breed. */
  modelLabels: string[];
}

export interface Achievement {
  id: string;
  color: string;
  /** 0-1 fraction toward unlocking, for badges with a meaningful threshold. Omit for boolean-only badges. */
  progress?: (stats: UserStats) => number;
}

export interface UserStats {
  catsFound: number;
  breedsUnlocked: number;
  dayStreak: number;
}

export interface CatRecord {
  id: string;
  userId: string;
  name: string;
  breedId: string | null;
  breedName: string;
  primaryPhotoUrl: string;
  geohash: string;
  lat: number;
  lng: number;
  locationLabel: string;
  firstSeenAt: number;
  lastSeenAt: number;
  sightingCount: number;
}

export interface Sighting {
  id: string;
  photoUrl: string;
  geohash: string;
  lat: number;
  lng: number;
  locationLabel: string;
  capturedAt: number;
  breedGuess: string | null;
  breedConfidence: number | null;
}

export interface MapPin {
  id: string;
  cat: CatRecord;
}
