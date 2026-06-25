import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, S, F, R, T } from './styles/theme';
import { BASE_URL } from './api';

function AssetSubmissionPage({ navigation }) {
  const [assetId,      setAssetId]      = useState('ASSET-001');
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status,       setStatus]       = useState('Operational');
  const [locationId,   setLocationId]   = useState('North-Sea');
  const [cost,         setCost]         = useState('');

  useEffect(() => { fetchAssetCount(); }, []);

  const fetchAssetCount = async () => {
    try {
      const response = await fetch(`${BASE_URL}/count`);
      const data     = await response.json();
      setAssetId(`ASSET-${(parseInt(data.count) + 1).toString().padStart(4, '0')}`);
    } catch (error) {
      console.error('Error fetching asset count:', error);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !serialNumber || !status || !locationId) {
      alert('All fields are required.');
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ assetId, title, description, serialNumber, status, locationId, cost }),
      });
      const data = await response.json();
      console.log('Asset created:', data);
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset. Please try again later.');
    }
  };

  return (
    <ScrollView
      style={T.screen}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header Row with Circle Back Button */}
      <View style={styles.headerRow}>
        <Pressable 
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
        >
          {/* Simple unicode arrow or you can replace it with an Icon component */}
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={[T.h2, { marginBottom: 0 }]}>Submit New Asset</Text>
      </View>

      <View style={T.card}>

        <Text style={T.label}>Title</Text>
        <TextInput
          style={T.input}
          placeholder="Title"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={T.label}>Description</Text>
        <TextInput
          style={T.input}
          placeholder="Description"
          placeholderTextColor={COLORS.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={T.label}>Serial Number</Text>
        <TextInput
          style={T.input}
          placeholder="Serial Number"
          placeholderTextColor={COLORS.textMuted}
          value={serialNumber}
          onChangeText={setSerialNumber}
        />

        <Text style={T.label}>Status</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={status}
            onValueChange={setStatus}
            style={styles.picker}
            dropdownIconColor={COLORS.textMuted}
          >
            <Picker.Item label="Operational"        value="Operational"         />
            <Picker.Item label="Maintenance Needed" value="Maintenance Needed" />
            <Picker.Item label="Disposed"           value="Disposed"            />
          </Picker>
        </View>

        <Text style={T.label}>Location</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={locationId}
            onValueChange={setLocationId}
            style={styles.picker}
            dropdownIconColor={COLORS.textMuted}
          >
            <Picker.Item label="North-Sea" value="North-Sea" />
          </Picker>
        </View>

        <Text style={T.label}>Cost</Text>
        <TextInput
          style={T.input}
          placeholder="Cost"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          value={cost}
          onChangeText={setCost}
        />

      </View>

      <Pressable
        onPress={handleCreate}
        style={({ pressed }) => [T.btnPrimary, { marginTop: S.md }, pressed && { opacity: 0.85 }]}
      >
        <Text style={T.btnPrimaryText}>SUBMIT</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: S.md,
    paddingBottom: S.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: S.md,
    marginBottom: S.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // Perfect circle
    backgroundColor: COLORS.surfaceMid || '#e0e0e0', // Fallback color if missing
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: S.md,
  },
  backButtonText: {
    color: COLORS.textSec || '#000',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22, // Centers arrow vertically inside text node
  },
  // Picker wrapper — explicit spacing so it never bleeds into the label above
  pickerWrap: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: S.xs,
    marginBottom: S.sm,   // pushes the next label clear of the dropdown
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: COLORS.textSec,  // matches Serial Number / other field text colour
  },
});

export default AssetSubmissionPage;