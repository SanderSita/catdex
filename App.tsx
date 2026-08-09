import './src/i18n';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useTranslation } from 'react-i18next';
import {
  Comfortaa_600SemiBold,
  Comfortaa_700Bold,
} from '@expo-google-fonts/comfortaa';
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import type { RootStackParamList } from './src/navigation/types';
import { useAuthStore } from './src/store/useAuthStore';
import { useAchievementsStore } from './src/store/useAchievementsStore';
import { useFriendsStore } from './src/store/useFriendsStore';
import { useFriendActivityStore } from './src/store/useFriendActivityStore';
import { otherUid } from './src/services/friendsService';
import { registerForPushNotificationsAsync, subscribeToPushTokenRefresh, subscribeToNotificationTaps } from './src/services/pushService';
import { FriendCatchToast } from './src/components/FriendCatchToast';
import { useAppLocaleSync } from './src/hooks/useAppLocaleSync';
import { colors } from './src/theme';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['catdex://'],
  config: {
    screens: {
      AddFriend: 'friend/:prefillCode',
    },
  },
};

export default function App() {
  const { t } = useTranslation();
  useAppLocaleSync();
  const [fontsLoaded] = useFonts({
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });
  const uid = useAuthStore((s) => s.uid);
  const authReady = useAuthStore((s) => s.ready);
  const authError = useAuthStore((s) => s.error);
  const init = useAuthStore((s) => s.init);
  const subscribeAchievements = useAchievementsStore((s) => s.subscribe);
  const subscribeFriends = useFriendsStore((s) => s.subscribe);
  const friendships = useFriendsStore((s) => s.friendships);
  const subscribeFriendActivity = useFriendActivityStore((s) => s.subscribe);

  const acceptedFriendUids = useMemo(
    () => (uid ? friendships.filter((f) => f.status === 'accepted').map((f) => otherUid(f, uid)) : []),
    [friendships, uid]
  );
  const acceptedFriendUidsKey = acceptedFriendUids.slice().sort().join(',');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!uid) return;
    return subscribeAchievements(uid);
  }, [uid, subscribeAchievements]);

  useEffect(() => {
    if (!uid) return;
    return subscribeFriends(uid);
  }, [uid, subscribeFriends]);

  useEffect(() => {
    return subscribeFriendActivity(acceptedFriendUids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFriendUidsKey, subscribeFriendActivity]);

  useEffect(() => {
    if (!uid) return;
    registerForPushNotificationsAsync(uid).catch((err) => console.warn('[push] registration failed:', err));
    return subscribeToPushTokenRefresh(uid);
  }, [uid]);

  useEffect(() => {
    return subscribeToNotificationTaps((data) => {
      if (data.kind === 'friend-catch' && typeof data.friendUid === 'string' && navigationRef.isReady()) {
        navigationRef.navigate('FriendDetail', { friendUid: data.friendUid });
      }
    });
  }, []);

  if (authError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{t('errors.connectionFailed', { error: authError })}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !authReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.coral} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <RootNavigator />
          <FriendCatchToast />
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
  },
});
