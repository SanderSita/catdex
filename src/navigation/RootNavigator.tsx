import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { CameraScreen } from '../screens/CameraScreen';
import { NewSightingScreen } from '../screens/NewSightingScreen';
import { BreedSearchScreen } from '../screens/BreedSearchScreen';
import { CatDetailScreen } from '../screens/CatDetailScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="NewSighting" component={NewSightingScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="BreedSearch" component={BreedSearchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="CatDetail" component={CatDetailScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: true, title: t('privacy.title') }} />
    </Stack.Navigator>
  );
}
