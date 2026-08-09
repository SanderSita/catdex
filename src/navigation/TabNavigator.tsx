import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { MapPin, LayoutGrid, Users, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { TabParamList } from './types';
import { MapScreen } from '../screens/MapScreen';
import { CollectionScreen } from '../screens/CollectionScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, typeof MapPin> = {
  Map: MapPin,
  Collection: LayoutGrid,
  Friends: Users,
  Profile: User,
};

export function TabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ color, size }) => {
          const Icon = ICONS[route.name];
          return <Icon color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: t('tabs.map') }} />
      <Tab.Screen name="Collection" component={CollectionScreen} options={{ title: t('tabs.collection') }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: t('tabs.friends') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.card, borderTopColor: colors.creamMuted2 },
  label: { fontFamily: fonts.bodySemi, fontSize: 11 },
});
