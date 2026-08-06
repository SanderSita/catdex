export interface Breed {
  id: string;
  name: string;
  /** Label(s) the Roboflow model returns that map to this breed. */
  modelLabels: string[];
}

export interface Achievement {
  id: string;
  label: string;
  color: string;
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  catsFound: number;
  breedsUnlocked: number;
  dayStreak: number;
}

export interface CatRecord {
  id: string;
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
