import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, S, F, R, T, SHADOW,
  getStatusColor,
} from './styles/theme';
import { apiGet, clearToken } from './api';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// ── Asset card ────────────────────────────────────────────────────────────

function AssetCard({ asset }) {
  const statusColor = getStatusColor(asset.status);
  return (
    <View style={styles.card}>
      <View style={T.between}>
        <Text style={styles.assetId}>{asset.assetId || '—'}</Text>
        <View style={[T.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[T.badgeText, { color: statusColor }]}>{asset.status}</Text>
        </View>
      </View>
      <Text style={styles.assetTitle} numberOfLines={1}>{asset.title}</Text>
      <View style={[T.row, { marginTop: S.xs, gap: S.md }]}>
        <View style={T.row}>
          <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
          <Text style={[T.caption, { marginLeft: 3 }]}>{asset.locationId || '—'}</Text>
        </View>
        {asset.serialNumber ? (
          <View style={T.row}>
            <Ionicons name="barcode-outline" size={12} color={COLORS.textMuted} />
            <Text style={[T.caption, { marginLeft: 3 }]}>{asset.serialNumber}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

function AssetsScreen() {
  const navigation                    = useNavigation();
  const [assets,     setAssets]       = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [search,     setSearch]       = useState('');
  const [fetchError, setFetchError]   = useState(false);

  const fetchAssets = async (silent = false) => {
    if (!silent) setLoading(true);
    setFetchError(false);
    try {
      const data = await apiGet('/assets');
      if (data?.success) setAssets(data.assets ?? []);
    } catch (err) {
      if (err?.status === 401) {
        await clearToken();
        navigation.replace('Login');
      } else {
        // Silently show empty state instead of blocking alert for unbuilt endpoints
        setFetchError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAssets(false); }, []));
  const onRefresh = () => { setRefreshing(true); fetchAssets(true); };

  const filtered = assets.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.assetId?.toLowerCase().includes(q) ||
      a.locationId?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <View style={[T.screen, T.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryBright} />
        <Text style={[T.caption, { marginTop: S.md }]}>LOADING ASSETS</Text>
      </View>
    );
  }

  return (
    <View style={T.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle}>ASSETS</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: S.sm }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID or location…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryBright} />
        }
      >
        {fetchError ? (
          <View style={T.empty}>
            <Text style={{ fontSize: 40 }}>⚠️</Text>
            <Text style={T.emptyText}>Could not load assets.{'\n'}Pull down to retry.</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((asset) => (
            <AssetCard key={asset._id ?? asset.assetId} asset={asset} />
          ))
        ) : (
          <View style={T.empty}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={T.emptyText}>
              {search ? 'No assets match your search.' : 'No assets found.'}
            </Text>
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.pill,
    marginHorizontal: S.md,
    marginTop: S.md,
    marginBottom: S.xs,
    paddingHorizontal: S.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: F.md,
  },
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
    borderLeftColor: COLORS.primaryBright,
    ...SHADOW.sm,
  },
  assetId: {
    color: COLORS.primaryBright,
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  assetTitle: {
    color: COLORS.text,
    fontSize: F.md,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
});

export default AssetsScreen;