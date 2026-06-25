import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  COLORS, S, F, R, T, SHADOW,
  getStatusColor, formatDate,
} from './styles/theme';
import { apiGet, clearToken } from './api';

// ── Sub-component: alert / activity row ───────────────────────────────────

function FeedItem({ item }) {
  const statusColor = getStatusColor(item.status);

  return (
    <View style={T.cardAccent}>
      <View style={T.between}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[T.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[T.badgeText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>
      <Text style={[T.caption, { marginTop: S.xs }]}>
        {formatDate(item.createdAt)}
      </Text>
    </View>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────

function StatPill({ value, label, valueColor }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>
        {value ?? 0}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

function HomeScreen() {
  const navigation = useNavigation();

  const [dashData,   setDashData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiGet('/home');
      if (data.success) setDashData(data);
    } catch (err) {
      if (err?.status === 401) {
        await clearToken();
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.replace('Login');
      } else {
        Alert.alert('Network Error', err?.message || 'Could not connect to server.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDashboard(false); }, []));

  const onRefresh = () => { setRefreshing(true); fetchDashboard(true); };

  if (loading) {
    return (
      <View style={[T.screen, T.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryBright} />
        <Text style={[T.caption, { marginTop: S.md }]}>LOADING DASHBOARD</Text>
      </View>
    );
  }

  const user    = dashData?.user    ?? {};
  const summary = dashData?.summary ?? {};
  const recent  = dashData?.recent  ?? {};

  return (
    <View style={T.screen}>
      <ScrollView
        contentContainerStyle={[T.scrollContent, { paddingTop: S.lg }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryBright}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <View>
            <Text style={styles.greetLabel}>WELCOME BACK</Text>
            <Text style={styles.greetName}>{user.username || 'OPERATIVE'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user.role || '—'}</Text>
          </View>
        </View>

        {/* System status */}
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>SYSTEM OPERATIONAL</Text>
        </View>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatPill
            value={summary.overdueMaintenance}
            label="OVERDUE"
            valueColor={summary.overdueMaintenance > 0 ? COLORS.danger : COLORS.success}
          />
          <StatPill
            value={summary.highRiskAssets}
            label="HIGH RISK"
            valueColor={summary.highRiskAssets > 0 ? COLORS.warning : COLORS.success}
          />
          <StatPill
            value={summary.recentFailures}
            label="FAILURES"
            valueColor={summary.recentFailures > 0 ? COLORS.danger : COLORS.success}
          />
        </View>

        {/* Recent failures */}
        {recent.failures?.length > 0 && (
          <>
            <Text style={T.sectionTitle}>RECENT FAILURES</Text>
            {recent.failures.slice(0, 3).map((r) => (
              <FeedItem key={r._id} item={r} />
            ))}
          </>
        )}

        {/* Recent reports (fallback if backend doesn't split yet) */}
        {!recent.failures?.length && recent.reports?.length > 0 && (
          <>
            <Text style={T.sectionTitle}>RECENT ACTIVITY</Text>
            {recent.reports.slice(0, 3).map((r) => (
              <FeedItem key={r._id} item={r} />
            ))}
          </>
        )}

        {!recent.failures?.length && !recent.reports?.length && (
          <View style={T.empty}>
            <Text style={{ fontSize: 40 }}>✅</Text>
            <Text style={T.emptyText}>All clear. No recent alerts.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.md,
  },
  greetLabel: {
    color: COLORS.textMuted,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  greetName: {
    color: COLORS.text,
    fontSize: F.xxl,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  roleBadge: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 999,
    paddingVertical: S.xs,
    paddingHorizontal: S.md,
    borderWidth: 1,
    borderColor: COLORS.primaryMid,
  },
  roleBadgeText: {
    color: COLORS.primaryBright,
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingVertical: S.xs,
    paddingHorizontal: S.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: S.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: S.sm,
  },
  statusText: {
    color: COLORS.success,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: S.sm,
    marginBottom: S.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  statValue: {
    color: COLORS.primaryBright,
    fontSize: F.xxl,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: F.xs - 1,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: F.md,
    fontWeight: '600',
    flex: 1,
    marginRight: S.sm,
  },
});

export default HomeScreen;
