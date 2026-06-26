import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import HomeScreen          from './Pages/home';
import ProfileScreen       from './Pages/profile';
import AssetSubmissionPage from './Pages/assetCreate';
import MaintenanceScreen   from './Pages/maintenance';
import AssetsScreen        from './Pages/assets';
import AssetDetail         from './Pages/AssetDetail'
import LogHubScreen        from './Pages/logHub';
import LoginScreen         from './Pages/Login';
import CreateScreen        from './Pages/createAccount';

import { COLORS, S, F, R, T, SHADOW } from './Pages/styles/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;
const TAB_BAR_HEIGHT    = Platform.OS === 'ios' ? 84 : 68;

const TAB_ICONS = {
  Home:        ['home-outline',      'home'],
  Assets:      ['cube-outline',      'cube'],
  Log:         ['add-circle-outline','add-circle'],
  Maintenance: ['construct-outline', 'construct'],
  Profile:     ['person-outline',    'person'],
};

const TAB_LABELS = {
  Home:        'HOME',
  Assets:      'ASSETS',
  Log:         'LOG',
  Maintenance: 'MAINTAIN',
  Profile:     'PROFILE',
};

// ── Tab layout ────────────────────────────────────────────────────────────

function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const [inactiveIcon, activeIcon] = TAB_ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
        const label = TAB_LABELS[route.name] ?? route.name.toUpperCase();

        return {
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <View style={styles.tabBarBg} />,

          tabBarIcon: ({ focused }) => (
          <View style={focused ? styles.iconPillActive : styles.iconPillInactive}>
            <Ionicons
              name={focused ? activeIcon : inactiveIcon}
              size={20}
              color={focused ? COLORS.text : COLORS.textMuted}
            />
          </View>
        ),

          tabBarLabel: ({ focused }) => (
            <Text style={focused ? styles.tabLabelActive : styles.tabLabelInactive}>
              {label}
            </Text>
          ),

          tabBarItemStyle: styles.tabItem,
        };
      }}
    >
      <Tab.Screen name="Home"        component={HomeScreen}        options={{ title: '', headerShown: false }} />
      <Tab.Screen name="Assets"      component={AssetsScreen}      options={{ title: '', headerShown: false }} />
      <Tab.Screen name="Log"         component={LogHubScreen}      options={{ title: '', headerShown: false }} />
      <Tab.Screen name="Profile"     component={ProfileScreen}     options={{ title: '', headerShown: false }} />
    </Tab.Navigator>
  );
}

// ── Root stack ────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"          component={LoginScreen}          />
      <Stack.Screen name="create"         component={CreateScreen}         />
      <Stack.Screen name="MainTabs"       component={TabLayout}            />
      <Stack.Screen name="AssetCreate"    component={AssetSubmissionPage}  />
      <Stack.Screen name="LogMaintenance" component={LogMaintenanceScreen} />
      <Stack.Screen name="LogFailure"     component={LogFailureScreen}     />
      <Stack.Screen name="LogInspection"  component={LogInspectionScreen}  />
      <Stack.Screen name="AssetDetail"    component={AssetDetail}/>
    </Stack.Navigator>
  );
}

// ── Placeholder form screens ──────────────────────────────────────────────

function PlaceholderForm({ title, emoji }) {
  const navigation = useNavigation();
  return (
    <View style={T.screen}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.formHeaderTitle}>{title}</Text>
      </View>
      <View style={[T.center, { flex: 1 }]}>
        <Text style={{ fontSize: 48 }}>{emoji}</Text>
        <Text style={[T.caption, { marginTop: S.md, textAlign: 'center', paddingHorizontal: S.xl }]}>
          Form coming soon.{'\n'}Wire up your form component here.
        </Text>
      </View>
    </View>
  );
}

function LogMaintenanceScreen() { return <PlaceholderForm title="LOG MAINTENANCE"  emoji="🛠"  />; }
function LogFailureScreen()     { return <PlaceholderForm title="REPORT FAILURE"    emoji="⚠️" />; }
function LogInspectionScreen()  { return <PlaceholderForm title="SUBMIT INSPECTION" emoji="📋" />; }

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconPillActive: {
    backgroundColor: COLORS.primary,
    borderRadius: R.md,
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.redSm,
  },
  iconPillInactive: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabelActive:   { color: COLORS.primaryBright, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  tabLabelInactive: { color: COLORS.textMuted,     fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingTop: Platform.OS === 'ios' ? 54 : STATUS_BAR_HEIGHT + S.md,
    paddingBottom: S.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: S.md,
    ...SHADOW.md,
  },
  backBtn:         { padding: S.xs },
  formHeaderTitle: { color: COLORS.text, fontSize: F.xl, fontWeight: '800', letterSpacing: 2 },
});