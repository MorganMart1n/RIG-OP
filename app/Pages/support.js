import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// These should match your app's theme or be defined here
const COLORS = {
  text: '#FFFFFF',
  textSec: '#94A3B8',
  textMuted: '#64748B',
  surface: '#1E293B',
  surfaceHigh: '#334155',
  border: '#334155',
};

const EMERGENCY_TYPES = [
  { id: 'engineering', title: 'Engineering', subtitle: 'Mechanical, electrical failure', icon: '🛠️', color: '#F59E0B' },
  { id: 'medical', title: 'Medical', subtitle: 'Injury or illness support', icon: '🚑', color: '#EF4444' },
  { id: 'it', title: 'IT & Systems', subtitle: 'Software or network outage', icon: '💻', color: '#3B82F6' },
  { id: 'security', title: 'Security', subtitle: 'Security breach access', icon: '🛡️', color: '#8B5CF6' },
  { id: 'environmental', title: 'Environmental', subtitle: 'Spills or hazards', icon: '⚠️', color: '#10B981' },
];

const ACTIVE_RESPONDERS = {
  engineering: [
    { name: 'Alex Turner', role: 'Senior Mechanical Engineer', status: 'Available', eta: '5 mins' },
    { name: 'Jordan Smith', role: 'Electrical Technician', status: 'On Site', eta: 'Responding now' },
  ],
  medical: [
    { name: 'Sarah Ahmed', role: 'Medic', status: 'Available', eta: '2 mins' },
    { name: 'David Ross', role: 'Emergency Coordinator', status: 'Dispatching', eta: '4 mins' },
  ],
  it: [{ name: 'Ethan Clark', role: 'Systems Engineer', status: 'Online', eta: 'Immediate support' }],
  security: [{ name: 'Chris Walker', role: 'Security Supervisor', status: 'Responding', eta: '3 mins' }],
  environmental: [{ name: 'Olivia Brown', role: 'Environmental Officer', status: 'Available', eta: '6 mins' }],
};

function EmergencyTypeCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.emergencyTypeCard,
        selected && { borderColor: item.color, backgroundColor: item.color + '15' },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.emergencyTitle}>{item.title}</Text>
        <Text style={styles.emergencySubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ActiveResponderCard({ responder }) {
  const active = responder.status === 'Available' || responder.status === 'Online';
  return (
    <View style={styles.responderCard}>
      <div style={styles.responderTop}>
        <View>
          <Text style={styles.responderName}>{responder.name}</Text>
          <Text style={styles.responderRole}>{responder.role}</Text>
        </View>
        <View style={styles.statusWrap}>
          <View style={[styles.statusDot, { backgroundColor: active ? '#22C55E' : '#F59E0B' }]} />
          <Text style={styles.statusText}>{responder.status}</Text>
        </View>
      </div>
      <View style={styles.etaRow}>
        <Text style={styles.etaLabel}>ETA</Text>
        <Text style={styles.etaValue}>{responder.eta}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.8} style={styles.contactBtn}>
        <Text style={styles.contactBtnText}>Contact responder</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SupportScreen() {
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0F172A', padding: 20 }}>
      <View style={styles.emergencySection}>
        <Text style={styles.sectionHeading}>Select emergency type</Text>
        <Text style={styles.sectionSubheading}>Choose the category that best matches the situation.</Text>

        {EMERGENCY_TYPES.map(item => (
          <EmergencyTypeCard
            key={item.id}
            item={item}
            selected={selectedEmergency === item.id}
            onPress={() => setSelectedEmergency(item.id)}
          />
        ))}
      </View>

      {selectedEmergency && (
        <View style={{ marginTop: 28 }}>
          <View style={styles.activeHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Active responders</Text>
              <Text style={styles.sectionSubheading}>Personnel currently available to assist.</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {ACTIVE_RESPONDERS[selectedEmergency]?.map(responder => (
            <ActiveResponderCard key={responder.name} responder={responder} />
          ))}

          <TouchableOpacity activeOpacity={0.85} style={styles.emergencyButton}>
            <Text style={styles.emergencyButtonText}>Escalate emergency</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emergencySection: { marginTop: 8 },
  sectionHeading: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sectionSubheading: { color: COLORS.textSec, fontSize: 15, lineHeight: 22, marginBottom: 18 },
  emergencyTypeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: { width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconText: { fontSize: 24 },
  emergencyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  emergencySubtitle: { color: COLORS.textSec, fontSize: 14, lineHeight: 20 },
  activeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F2A1B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 6 },
  liveText: { color: '#22C55E', fontWeight: '700', fontSize: 12 },
  responderCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  responderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  responderName: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  responderRole: { color: COLORS.textSec, marginTop: 4, fontSize: 14 },
  statusWrap: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  etaRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  etaLabel: { color: COLORS.textMuted, fontSize: 13 },
  etaValue: { color: COLORS.text, fontWeight: '600' },
  contactBtn: { marginTop: 18, backgroundColor: COLORS.surfaceHigh, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  contactBtnText: { color: COLORS.text, fontWeight: '700' },
  emergencyButton: { backgroundColor: '#DC2626', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  emergencyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});