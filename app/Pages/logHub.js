import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, S, F, R, SHADOW, T } from './styles/theme';

const ACTIONS = [
  {
    icon:        'add-circle',
    iconColor:   COLORS.primaryBright,
    title:       'Add New Asset',
    subtitle:    'Register a new asset into the system',
    route:       'AssetCreate',
    accent:      COLORS.primaryBright,
  },
  {
    icon:        'construct',
    iconColor:   '#60A5FA',
    title:       'Log Maintenance',
    subtitle:    'Record a completed or scheduled maintenance task',
    route:       'LogMaintenance',
    accent:      '#60A5FA',
  },
  {
    icon:        'warning',
    iconColor:   '#F97316',
    title:       'Report Failure / Incident',
    subtitle:    'Document an equipment failure or safety incident',
    route:       'LogFailure',
    accent:      '#F97316',
  },
  {
    icon:        'clipboard',
    iconColor:   '#22C55E',
    title:       'Submit Inspection',
    subtitle:    'Log an inspection result for an asset',
    route:       'LogInspection',
    accent:      '#22C55E',
  },
];

function ActionCard({ icon, iconColor, title, subtitle, accent, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accent }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

function LogHubScreen() {
  const navigation = useNavigation();

  return (
    <View style={T.screen}>
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.headerTitle}>LOG ENTRY</Text>
          <Text style={styles.headerSub}>Select an action below</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {ACTIONS.map((action) => (
          <ActionCard
            key={action.route}
            {...action}
            onPress={() => {
              // Navigate to the appropriate form screen.
              // These stack screens must be registered in layout.js.
              navigation.navigate(action.route);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingTop: Platform.OS === 'ios' ? 60 : S.lg,
    paddingBottom: S.md,



    ...SHADOW.md,
    gap: S.sm,
  },
  accentBar: {
    width: 4,
    height: 28,
    backgroundColor: COLORS.primaryBright,
    borderRadius: 2,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: F.xl,
    fontWeight: '800',
    marginTop:25,
    letterSpacing: 2,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: F.sm,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  scroll: {
    padding: S.md,
    paddingBottom: 100,
    gap: S.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    ...SHADOW.sm,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: F.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.textMuted,
    fontSize: F.sm,
    lineHeight: 18,
  },
});

export default LogHubScreen;
