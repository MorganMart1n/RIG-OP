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
  COLORS,
  S,
  F,
  R,
  SHADOW,
  T,
  getStatusColor,
  getPriorityColor,
  formatDate,
} from './styles/theme';

import { apiGet, clearToken } from './api';

function RecentItem({ item, type }) {
  const statusColor = getStatusColor(item.status);
  const priorityColor = getPriorityColor(item.priority);

  return (
    <View style={T.cardAccent}>
      <View style={T.between}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <View
          style={[
            T.badge,
            { backgroundColor: statusColor + '22' },
          ]}
        >
          <Text
            style={[
              T.badgeText,
              { color: statusColor },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={[T.row, { marginTop: S.xs }]}>
        <Text style={T.caption}>
          {type === 'report' ? item.type : item.category}
        </Text>

        <Text
          style={[
            T.caption,
            { marginHorizontal: S.xs },
          ]}
        >
          ·
        </Text>

        <Text
          style={[
            T.caption,
            { color: priorityColor },
          ]}
        >
          {item.priority}
        </Text>

        <Text
          style={[
            T.caption,
            { marginHorizontal: S.xs },
          ]}
        >
          ·
        </Text>

        <Text style={T.caption}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

function HomeScreen() {
  const navigation = useNavigation();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (silent) => {
    if (!silent) setLoading(true);

    try {
      // Uses the shared api.js wrapper — correct BASE_URL and clean token every time
      const data = await apiGet('/home');

      if (data.success) {
        setDashData(data);
      } else {
        console.log('Server Error Data:', data);
      }
    } catch (err) {
      console.error('Fetch Error:', err);

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

  useFocusEffect(
    useCallback(() => {
      fetchDashboard(false);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard(true);
  };

  if (loading) {
    return (
      <View style={[T.screen, T.center]}>
        <ActivityIndicator
          size="large"
          color={COLORS.primaryBright}
        />

        <Text
          style={[
            T.caption,
            { marginTop: S.md },
          ]}
        >
          LOADING DASHBOARD
        </Text>
      </View>
    );
  }

  const user   = dashData?.user   ?? {};
  const recent = dashData?.recent ?? {};

  return (
    <View style={T.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>
            WELCOME BACK
          </Text>

          <Text style={styles.welcomeName}>
            {user.username || 'OPERATIVE'}
          </Text>
        </View>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user.role || '—'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={T.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryBright}
          />
        }
      >
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            SYSTEM OPERATIONAL
          </Text>
        </View>

        {recent.reports && recent.reports.length > 0 && (
          <>
            <Text style={T.sectionTitle}>RECENT REPORTS</Text>
            {recent.reports.slice(0, 3).map((r) => (
              <RecentItem key={r._id} item={r} type="report" />
            ))}
          </>
        )}

        {recent.tickets && recent.tickets.length > 0 && (
          <>
            <Text style={T.sectionTitle}>RECENT TICKETS</Text>
            {recent.tickets.slice(0, 3).map((t) => (
              <RecentItem key={t._id} item={t} type="ticket" />
            ))}
          </>
        )}

        {(!recent.reports || recent.reports.length === 0) &&
          (!recent.tickets || recent.tickets.length === 0) && (
            <View style={T.empty}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={T.emptyText}>No recent activity found.</Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 54,
    paddingBottom: S.md,
    paddingHorizontal: S.md,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

    ...SHADOW.md,
  },

  welcomeLabel: {
    color: COLORS.textMuted,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },

  welcomeName: {
    color: COLORS.text,
    fontSize: F.xxl,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  roleBadge: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: R.pill,

    paddingVertical: S.xs,
    paddingHorizontal: S.md,

    borderWidth: 1,
    borderColor: COLORS.primaryMid,

    ...SHADOW.redSm,
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

    marginTop: S.md,

    backgroundColor: COLORS.surface,

    alignSelf: 'flex-start',

    borderRadius: R.pill,

    paddingVertical: S.xs,
    paddingHorizontal: S.md,

    borderWidth: 1,
    borderColor: COLORS.border,
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

  itemTitle: {
    color: COLORS.text,
    fontSize: F.md,
    fontWeight: '600',
    flex: 1,
    marginRight: S.sm,
  },
});

export default HomeScreen;