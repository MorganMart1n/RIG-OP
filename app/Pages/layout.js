import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen    from './home';
import ProfileScreen from './profile';
import SupportScreen from './support';
import ReportScreen  from './report';
import LoginScreen   from './Login';
import CreateScreen  from './createAccount';

import { COLORS, F, S, R, SHADOW } from './styles/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Icon map using emoji (swap for @expo/vector-icons Ionicons if available) ──
const TAB_ICONS = {
  Home:    { active: '⚡', inactive: '⚡' },
  Support: { active: '🎫', inactive: '🎫' },
  Report:  { active: '📋', inactive: '📋' },
  Profile: { active: '👤', inactive: '👤' },
};

function TabIcon({ routeName, focused }) {
  const icon = TAB_ICONS[routeName];
  return (
    <View style={focused ? styles.iconWrapActive : styles.iconWrapInactive}>
      <Text style={[styles.iconEmoji, focused && styles.iconEmojiActive]}>
        {focused ? icon?.active : icon?.inactive}
      </Text>
    </View>
  );
}

function TabLabel({ routeName, focused }) {
  return (
    <Text style={focused ? styles.tabLabelActive : styles.tabLabelInactive}>
      {routeName.toUpperCase()}
    </Text>
  );
}

function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarLabel: ({ focused }) => (
          <TabLabel routeName={route.name} focused={focused} />
        ),
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
      <Tab.Screen name="Report"  component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Layout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={TabLayout} />
      <Stack.Screen name="Create"   component={CreateScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: 70,
    paddingBottom: 8,
    paddingTop: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOW.lg,
  },
  tabItem: {
    paddingTop: S.xs,
  },
  iconWrapActive: {
    backgroundColor: COLORS.primary,
    borderRadius: R.md,
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.redSm,
  },
  iconWrapInactive: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 16,
    opacity: 0.4,
  },
  iconEmojiActive: {
    opacity: 1,
  },
  tabLabelActive: {
    color: COLORS.primaryBright,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  tabLabelInactive: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
