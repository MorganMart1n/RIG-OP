import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS, S, F, R, T, SHADOW,
  getStatusColor,
} from './styles/theme';
import { BASE_URL, saveToken } from './api';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function safeString(value) {
  if (value == null || value === '') return '—';
  return value.toString();
}

// ── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ icon, label }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={13} color={COLORS.primaryBright} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

// ── Info row ───────────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight, last }) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          highlight && { color: COLORS.primaryBright, fontWeight: '700' },
        ]}
        numberOfLines={2}
      >
        {value ?? '—'}
      </Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────

function AssetDetail() {
  const navigation      = useNavigation();
  const route           = useRoute();
  const { assetId }     = route.params ?? {};

  const [asset,   setAsset]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!assetId) { setError(true); setLoading(false); return; }

    const fetchAsset = async () => {
      setLoading(true);
      setError(false);
      try {
        const token = await import('./api').then(m => m.getToken?.() ?? '');
        const res = await fetch(`${BASE_URL}/assets/${assetId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401) {
          await saveToken(null);
          navigation.replace('Login');
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data?.success && data?.asset) {
          setAsset(data.asset);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('AssetDetail fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId]);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[T.screen, T.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryBright} />
        <Text style={[T.caption, { marginTop: S.md }]}>LOADING ASSET</Text>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error || !asset) {
    return (
      <View style={T.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ASSET DETAIL</Text>
        </View>
        <View style={[T.empty, { flex: 1 }]}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
          <Text style={T.emptyText}>Could not load asset.{'\n'}Go back and try again.</Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(asset.status);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={T.screen}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.accentBar} />
        <Text style={styles.headerTitle} numberOfLines={1}>ASSET DETAIL</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={T.between}>
            <Text style={styles.heroAssetId}>{asset.assetId || '—'}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '22', borderColor: statusColor + '55' },
            ]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{asset.status || '—'}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{asset.description || '—'}</Text>
          <Text style={styles.heroType}>{asset.type || '—'}</Text>
        </View>

        {/* ── Identification ────────────────────────────────────────────── */}
        <SectionHeader icon="finger-print-outline" label="IDENTIFICATION" />
        <View style={styles.card}>
          <InfoRow label="Asset ID"      value={safeString(asset.assetId)}      highlight />
          <InfoRow label="Description"   value={safeString(asset.description)} />
          <InfoRow label="Type"          value={safeString(asset.type)} />
          <InfoRow label="Serial Number" value={safeString(asset.serialNumber)} last />
        </View>

        {/* ── Location & Assignment ─────────────────────────────────────── */}
        <SectionHeader icon="location-outline" label="LOCATION & ASSIGNMENT" />
        <View style={styles.card}>
          <InfoRow label="Location ID"   value={safeString(asset.locationId)} />
          <InfoRow label="Technician ID" value={safeString(asset.technicianId)} last />
        </View>

        {/* ── Lifecycle ─────────────────────────────────────────────────── */}
        <SectionHeader icon="calendar-outline" label="LIFECYCLE" />
        <View style={styles.card}>
          <InfoRow label="Manufacture Date" value={formatDate(asset.manufactureDate)} />
          <InfoRow label="Purchase Date"    value={formatDate(asset.purchaseDate)} />
          <InfoRow label="Expiry Date"      value={formatDate(asset.expiryDate)}      last />
        </View>

        {/* ── Financials ────────────────────────────────────────────────── */}
        <SectionHeader icon="cash-outline" label="FINANCIALS" />
        <View style={styles.card}>
          <InfoRow label="Cost" value={formatCurrency(asset.cost)} last />
        </View>

        {/* ── Audit ─────────────────────────────────────────────────────── */}
        <SectionHeader icon="time-outline" label="AUDIT" />
        <View style={[styles.card, { marginBottom: 0 }]}>
          <InfoRow label="Created By" value={safeString(asset.createdBy)} />
          <InfoRow label="Created At" value={formatDate(asset.createdAt)} />
          <InfoRow label="Updated By" value={safeString(asset.updatedBy)} />
          <InfoRow label="Updated At" value={formatDate(asset.updatedAt)} last />
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
  backBtn: {
    marginRight: 2,
    padding: 2,
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
    flex: 1,
  },
  scroll: {
    padding: S.md,
    paddingBottom: 110,
    gap: S.sm,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryBright,
    marginBottom: S.sm,
    ...SHADOW.md,
  },
  heroAssetId: {
    color: COLORS.primaryBright,
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: F.lg,
    fontWeight: '700',
    marginTop: S.xs,
    marginBottom: 2,
  },
  heroType: {
    color: COLORS.textMuted,
    fontSize: F.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Section headers ───────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
    marginTop: S.md,
    marginBottom: S.xs,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // ── Info card ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: F.sm,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: F.sm,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
});

export default AssetDetail;