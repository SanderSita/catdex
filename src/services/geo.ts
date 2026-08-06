import * as ngeohash from 'ngeohash';

const EARTH_RADIUS_KM = 6371;
const GEOHASH_PRECISION = 9;

export function encodeGeohash(lat: number, lng: number): string {
  return ngeohash.encode(lat, lng, GEOHASH_PRECISION);
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Geohash range bounds covering a radius search. Firestore has no native
 * "within N km" query, so we bound by geohash prefix range server-side and
 * do the precise haversine cut client-side (see filterWithinRadius).
 */
export function geohashQueryBounds(lat: number, lng: number, radiusKm: number): Array<[string, string]> {
  const bounds = ngeohash.bboxes(
    lat - radiusKm / 110.574,
    lng - radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180)),
    lat + radiusKm / 110.574,
    lng + radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180)),
    GEOHASH_PRECISION
  ) as string[];

  // Collapse to a manageable number of prefix ranges for Firestore
  // range queries (one `where` range per bucket).
  const precision = Math.max(1, Math.min(6, Math.floor(GEOHASH_PRECISION / 2)));
  const prefixes = new Set(bounds.map((h) => h.slice(0, precision)));
  return Array.from(prefixes).map((p) => [p, p + '~']);
}

export function filterWithinRadius<T extends { lat: number; lng: number }>(
  items: T[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): T[] {
  return items.filter((item) => haversineKm(centerLat, centerLng, item.lat, item.lng) <= radiusKm);
}
