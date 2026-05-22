import { Dimensions, StyleSheet, Platform } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// Responsive helpers
export const rw = (pct) => (SW * pct) / 100;
export const rh = (pct) => (SH * pct) / 100;
export const SCREEN = { width: SW, height: SH };

// ── Colour Palette ──────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds – near-black, layered surfaces
  bg:           '#080808',
  surface:      '#141414',
  surfaceMid:   '#1E1E1E',
  surfaceHigh:  '#2A2A2A',
  surfaceTop:   '#343434',

  // Red family (derived from the Radeon-style logos)
  primaryDark:   '#5C0000',
  primary:       '#8B0000',
  primaryMid:    '#A30000',
  primaryBright: '#CC0000',
  primaryGlow:   '#FF1A1A',

  // Text
  text:       '#FFFFFF',
  textSec:    '#A8A8A8',
  textMuted:  '#555555',

  // Semantic
  success:    '#22C55E',
  warning:    '#F59E0B',
  danger:     '#EF4444',
  info:       '#60A5FA',

  // Borders & dividers
  border:       '#252525',
  borderAccent: '#8B0000',
  divider:      '#1A1A1A',

  // Priority colours
  low:      '#22C55E',
  medium:   '#F59E0B',
  high:     '#F97316',
  critical: '#EF4444',

  // Status colours
  open:       '#F59E0B',
  inProgress: '#60A5FA',
  resolved:   '#22C55E',
  closed:     '#555555',
  pending:    '#A855F7',
};

// ── Spacing Scale ─────────────────────────────────────────────────────────
export const S = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl: 64,
};

// ── Typography ────────────────────────────────────────────────────────────
export const F = {
  xs:   10,
  sm:   12,
  md:   14,
  lg:   16,
  xl:   20,
  xxl:  26,
  xxxl: 34,
};

// ── Border Radius ─────────────────────────────────────────────────────────
export const R = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   20,
  xl:   30,
  pill: 999,
};

// ── Shadows ───────────────────────────────────────────────────────────────
export const SHADOW = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 16,
  },
  red: {
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
  },
  redSm: {
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
};

// ── Common Reusable Styles ────────────────────────────────────────────────
export const T = StyleSheet.create({
  // Layout
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: S.md,
    paddingBottom: S.xxl,
    flexGrow: 1,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  row:    { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.md,
    marginVertical: S.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  cardAccent: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.md,
    marginVertical: S.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryBright,
    ...SHADOW.sm,
  },
  // Logo pill banner (matches logo aesthetic)
  pillBanner: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.pill,
    paddingVertical: S.sm,
    paddingHorizontal: S.xl,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: R.pill,
    paddingVertical: S.md - 2,
    paddingHorizontal: S.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.red,
  },
  btnPrimaryText: {
    color: COLORS.text,
    fontSize: F.lg,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  btnGhost: {
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: COLORS.primaryMid,
    paddingVertical: S.sm + 2,
    paddingHorizontal: S.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: {
    color: COLORS.primaryBright,
    fontSize: F.md,
    fontWeight: '600',
    letterSpacing: 1,
  },
  btnDanger: {
    backgroundColor: '#5C0000',
    borderRadius: R.pill,
    paddingVertical: S.sm + 2,
    paddingHorizontal: S.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  btnDangerText: {
    color: COLORS.danger,
    fontSize: F.md,
    fontWeight: '600',
    letterSpacing: 0.8,
  },

  // Inputs
  input: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: F.md,
    paddingHorizontal: S.md,
    paddingVertical: Platform.OS === 'ios' ? S.md - 2 : S.sm + 2,
    marginVertical: S.xs,
  },
  inputFocused: {
    borderColor: COLORS.primaryBright,
  },
  inputMultiline: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: F.md,
    paddingHorizontal: S.md,
    paddingTop: S.md - 2,
    paddingBottom: S.md - 2,
    marginVertical: S.xs,
    textAlignVertical: 'top',
    minHeight: 100,
  },

  // Typography
  h1: { color: COLORS.text, fontSize: F.xxxl, fontWeight: '800', letterSpacing: -0.5 },
  h2: { color: COLORS.text, fontSize: F.xxl,  fontWeight: '700' },
  h3: { color: COLORS.text, fontSize: F.xl,   fontWeight: '600' },
  h4: { color: COLORS.text, fontSize: F.lg,   fontWeight: '600' },
  body:    { color: COLORS.textSec, fontSize: F.md, lineHeight: 22 },
  caption: { color: COLORS.textMuted, fontSize: F.sm },
  label: {
    color: COLORS.textMuted,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: S.xs,
  },
  redText: {
    color: COLORS.primaryBright,
    fontWeight: '700',
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: S.md,
  },

  // Badges / Pills
  badge: {
    borderRadius: R.pill,
    paddingVertical: 3,
    paddingHorizontal: S.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: F.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Section header
  sectionTitle: {
    color: COLORS.text,
    fontSize: F.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: S.lg,
    marginBottom: S.sm,
  },

  // Header bar (used across screens)
  headerBar: {
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: S.md,
    paddingHorizontal: S.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOW.md,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: F.xl,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: F.sm,
    letterSpacing: 0.5,
  },

  // Stat cards (for dashboard)
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: R.md,
    padding: S.md,
    flex: 1,
    marginHorizontal: S.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  statValue: {
    color: COLORS.primaryBright,
    fontSize: F.xxxl,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: F.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },

  // Tab selector (custom, in-screen tabs)
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.pill,
    padding: 4,
    marginVertical: S.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: S.sm,
    alignItems: 'center',
    borderRadius: R.pill,
  },
  tabBtnActive: {
    flex: 1,
    paddingVertical: S.sm,
    alignItems: 'center',
    borderRadius: R.pill,
    backgroundColor: COLORS.primary,
    ...SHADOW.redSm,
  },
  tabBtnText: {
    color: COLORS.textMuted,
    fontSize: F.sm,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabBtnTextActive: {
    color: COLORS.text,
    fontSize: F.sm,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Picker wrapper
  pickerWrap: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: S.xs,
    overflow: 'hidden',
  },

  // Empty state
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: S.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: F.md,
    marginTop: S.sm,
    letterSpacing: 0.5,
  },
});

// ── Utility helpers ───────────────────────────────────────────────────────
export const getStatusColor = (status = '') => {
  const s = status.toLowerCase();
  if (s === 'open')        return COLORS.open;
  if (s === 'pending')     return COLORS.pending;
  if (s === 'in_progress') return COLORS.inProgress;
  if (s === 'resolved')    return COLORS.resolved;
  if (s === 'closed')      return COLORS.closed;
  return COLORS.textMuted;
};

export const getPriorityColor = (priority = '') => {
  const p = priority.toLowerCase();
  if (p === 'low')      return COLORS.low;
  if (p === 'medium')   return COLORS.medium;
  if (p === 'high')     return COLORS.high;
  if (p === 'critical') return COLORS.critical;
  return COLORS.textMuted;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
