import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }
      setStatus('granted');
      const initial = await Location.getCurrentPositionAsync({});
      setCoords({ lat: initial.coords.latitude, lng: initial.coords.longitude });
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 25 },
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    })();
    return () => sub?.remove();
  }, []);

  return { coords, status };
}
