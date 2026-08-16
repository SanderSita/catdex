import { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MapPin, LayoutGrid, Users, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { TabParamList } from './types';
import { MapScreen } from '../screens/MapScreen';
import { CollectionScreen } from '../screens/CollectionScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fonts, shadows, SPRING_BOUNCY, SPRING_SNAPPY } from '../theme';
import * as haptics from '../utils/haptics';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, typeof MapPin> = {
  Map: MapPin,
  Collection: LayoutGrid,
  Friends: Users,
  Profile: User,
};

function TabIcon({ focused, color, size, Icon }: { focused: boolean; color: string; size: number; Icon: typeof MapPin }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, focused ? SPRING_BOUNCY : SPRING_SNAPPY);
  }, [focused, scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.iconWrap}>
      {focused ? <View style={styles.iconPill} /> : null}
      <Animated.View style={iconStyle}>
        <Icon color={color} size={size} />
      </Animated.View>
    </View>
  );
}

export function TabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenListeners={{ tabPress: () => haptics.tapLight() }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ focused, color, size }) => {
          const Icon = ICONS[route.name];
          return <TabIcon focused={focused} color={color} size={size} Icon={Icon} />;
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
  bar: { backgroundColor: colors.card, borderTopColor: colors.creamMuted2, ...shadows.level2 },
  label: { fontFamily: fonts.bodySemi, fontSize: 11 },
  iconWrap: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconPill: {
    position: 'absolute',
    width: 44,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coralBgSoft,
  },
});
