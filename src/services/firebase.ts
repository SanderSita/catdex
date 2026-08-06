import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);

let anonAuthPromise: Promise<User> | null = null;

/** Ensures a signed-in user, defaulting to anonymous auth for v1. */
export function ensureSignedIn(): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  if (!anonAuthPromise) {
    anonAuthPromise = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsub();
            resolve(user);
          }
        },
        reject
      );
      signInAnonymously(auth).catch((err) => {
        unsub();
        reject(err);
      });
    });
  }
  return anonAuthPromise;
}
