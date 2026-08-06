import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
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
import { useAuthStore } from './src/store/useAuthStore';
import { colors } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });
  const authReady = useAuthStore((s) => s.ready);
  const authError = useAuthStore((s) => s.error);
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (authError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Could not connect: {authError}</Text>
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
        <NavigationContainer>
          <RootNavigator />
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
