declare module 'ngeohash' {
  export function encode(latitude: number, longitude: number, precision?: number): string;
  export function decode(hashString: string): { latitude: number; longitude: number };
  export function bboxes(minLat: number, minLon: number, maxLat: number, maxLon: number, precision?: number): string[];
  export function neighbor(hashString: string, direction: [number, number]): string;
}
