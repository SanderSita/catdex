import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// The in-app FriendCatchToast already covers the foreground case, so the OS
// banner is suppressed while the app is active to avoid double-notifying.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function upsertPushToken(uid: string, expoPushToken: string): Promise<void> {
  const { error } = await supabase.from('push_tokens').upsert(
    { user_id: uid, expo_push_token: expoPushToken, platform: Platform.OS, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,expo_push_token' }
  );
  if (error) throw error;
}

export async function registerForPushNotificationsAsync(uid: string): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) {
    console.warn('[pushService] No EAS projectId configured — run `eas init` to enable push notifications.');
    return;
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await upsertPushToken(uid, expoPushToken);
}

/** Rare: the OS can rotate a device's push token after initial registration. */
export function subscribeToPushTokenRefresh(uid: string): () => void {
  const sub = Notifications.addPushTokenListener((token) => {
    upsertPushToken(uid, token.data).catch(() => {});
  });
  return () => sub.remove();
}

export function subscribeToNotificationTaps(onTap: (data: Record<string, unknown>) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    onTap(response.notification.request.content.data as Record<string, unknown>);
  });
  return () => sub.remove();
}
