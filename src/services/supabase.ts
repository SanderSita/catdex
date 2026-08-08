import 'react-native-url-polyfill/auto';
import { createClient, type User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

let anonAuthPromise: Promise<User> | null = null;

/** Ensures a signed-in user, defaulting to anonymous auth for v1. */
export function ensureSignedIn(): Promise<User> {
  if (!anonAuthPromise) {
    anonAuthPromise = (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) return session.user;

      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (!data.user) throw new Error(i18n.t('errors.signInFailed'));
      return data.user;
    })().catch((err) => {
      anonAuthPromise = null;
      throw err;
    });
  }
  return anonAuthPromise;
}
