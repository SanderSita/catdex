import type { Persistence } from '@firebase/auth';

// `getReactNativePersistence` lives in @firebase/auth's RN-specific entry
// point (index.rn.d.ts), which Metro resolves at bundle time via the
// package's "react-native" export condition — but tsc's default resolution
// doesn't see it, so it's re-declared here for the main 'firebase/auth' types.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
