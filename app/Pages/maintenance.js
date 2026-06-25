import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  COLORS, S, F, R, T, SHADOW,
  getStatusColor, getPriorityColor, formatDate,
} from './styles/theme';
import { apiGet, clearToken } from './api';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;
const FILTERS = ['ALL', 'OVERDUE', 'UPCOMING', 'COMPLETED'];

// ── Ticket card ───────────────────────────────────────────────────────────

function TicketCard({ item }) {
  const statusColor   = getStatusColor(item.status);
  const priorityColor = getPriorityColor(item.priority);
  return (
    <View style={styles.card}>
      <View style={T.between}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[T.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[T.badgeText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>
      <View style={[T.row, { marginTop: S.xs, gap: S.md, flexWrap: 'wrap' }]}>
        {item.assetId ? <Text style={T.caption}>Asset: {item.assetId}</Text> : null}
        <Text style={[T.caption, { color: priorityColor, fontWeight: '700' }]}>
          {item.priority?.toUpperCase()}
        </Text>
        <Text style={T.caption}>{formatDate(item.scheduledDate ?? item.createdAt)}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

function MaintenanceScreen() {
  const navigation                    = useNavigation();
  const [tickets,    setTickets]      = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [filter,     setFilter]       = useState('ALL');
  const [fetchError, setFetchError]   = useState(false);

  const fetchMaintenance = async (silent = false) => {
    if (!silent) setLoading(true);
    setFetchError(false);
    try {
      const data = await apiGet('/maintenance');
      if (data?.success) setTickets(data.tickets ?? data.items ?? []);
    } catch (err) {
      if (err?.status === 401) {
        await clearToken();
        navigation.replace('Login');
      } else {
        setFetchError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMaintenance(false); }, []));
  const onRefresh = () => { setRefreshing(true); fetchMaintenance(true); };

  const filtered = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.maintenanceStatus?.toUpperCase() === filter ||
           t.status?.toUpperCase() === filter;
  });

  if (loading) {
    return (
      <View style={[T.screen, T.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryBright} />
        <Text style={[T.caption, { marginTop: S.md }]}>LOADING MAINTENANCE</Text>
      </View>
    );
  }

  return (
    <View style={T.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>MAINTENANCE</Text>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={filter === f ? styles.filterPillActive : styles.filterPill}
            onPress={() => setFilter(f)}
          >
            <Text style={filter === f ? styles.filterTextActive : styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryBright} />
        }
      >
        {fetchError ? (
          <View style={T.empty}>
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text style={T.emptyText}>Could not load tickets.{'\n'}Pull down to retry.</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((item) => <TicketCard key={item._id} item={item} />)
        ) : (
          <View style={T.empty}>
            <Text style={{ fontSize: 40 }}>🛠</Text>
            <Text style={T.emptyText}>No maintenance tickets found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingTop: Platform.OS === 'ios' ? 54 : STATUS_BAR_HEIGHT + S.md,
    paddingBottom: S.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: S.sm,
    ...SHADOW.md,
  },
  accentBar: {
    width: 4,
    height: 22,
    backgroundColor: COLORS.primaryBright,
    borderRadius: 2,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: F.xl,
    fontWeight: '800',
    letterSpacing: 2,
  },
  filterRow: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    gap: S.sm,
  },
filterPill: {
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 14,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.border,
  opacity: 0.85,
},

filterPillActive: {
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 14,
  backgroundColor: COLORS.primary + '15', // soft tint
  borderWidth: 1,
  borderColor: COLORS.primary,
},
  filterText:       { color: COLORS.textMuted, fontSize: F.xs, fontWeight: '700', letterSpacing: 1.2 },
  filterTextActive: { color: COLORS.text,      fontSize: F.xs, fontWeight: '800', letterSpacing: 1.2 },
  scroll: {
    padding: S.md,
    paddingBottom: 110,
    gap: S.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryMid,
    ...SHADOW.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: F.md,
    fontWeight: '600',
    flex: 1,
    marginRight: S.sm,
  },
});

export default MaintenanceScreen;