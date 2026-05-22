import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '@env';
import { COLORS, S, F, R, SHADOW, T } from './styles/theme';

function CreateScreen() {
  const navigation = useNavigation();

  // --- State Hooks ---
  const [fname, setFname] = useState('');
  const [sname, setSname] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [subRole, setSubRole] = useState(''); 
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const inputStyle = (field) => [
    T.input,
    focusedField === field && styles.inputFocused,
  ];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDob(selectedDate);
  };

  async function handleCreateAccount() {
    if (!fname || !sname || !email || !phonenumber || !password || !role || !dob) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }

    if (role === 'Maintenance' && !subRole) {
      Alert.alert('Specialization Required', 'Please select your trade.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/createAccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fname,
          sname,
          email,
          phonenumber,
          password,
          role,    
          subRole, 
          isActive: false,
          dob,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Account creation failed.');

      Alert.alert('Request Submitted', 'Your account has been created. Awaiting activation.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Creation Failed', error.message || 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBand}>
          <View style={styles.logoPill}>
            <Image
              source={require('../../assets/Bar-Logo.png')}
              style={styles.logo}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>NEW ACCOUNT</Text>
          </View>

          <View style={T.row}>
            <View style={styles.halfField}>
              <Text style={styles.whiteLabel}>First Name</Text>
              <TextInput
                style={inputStyle('fname')}
                placeholder="John"
                placeholderTextColor={COLORS.textMuted}
                value={fname}
                onChangeText={setFname}
                onFocus={() => setFocusedField('fname')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={[styles.halfField, { marginLeft: S.sm }]}>
              <Text style={styles.whiteLabel}>Surname</Text>
              <TextInput
                style={inputStyle('sname')}
                placeholder="Doe"
                placeholderTextColor={COLORS.textMuted}
                value={sname}
                onChangeText={setSname}
                onFocus={() => setFocusedField('sname')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <Text style={styles.whiteLabel}>Email</Text>
          <TextInput
            style={inputStyle('email')}
            placeholder="john.doe@rigop.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={styles.whiteLabel}>Phone Number</Text>
          <TextInput
            style={inputStyle('phone')}
            placeholder="+44 7700 000000"
            placeholderTextColor={COLORS.textMuted}
            value={phonenumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={styles.whiteLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.datePicker, focusedField === 'dob' && styles.inputFocused]}
            onPress={() => { setShowDatePicker(true); setFocusedField('dob'); }}
          >
            <Text style={dob ? styles.dateTextSet : styles.dateTextPlaceholder}>
              {dob ? dob.toDateString() : 'Select date of birth'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.whiteLabel}>Password</Text>
          <TextInput
            style={inputStyle('pass')}
            placeholder="Create a password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField('pass')}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={styles.whiteLabel}>Confirm Password</Text>
          <TextInput
            style={inputStyle('cpass')}
            placeholder="Repeat password"
            placeholderTextColor={COLORS.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            onFocus={() => setFocusedField('cpass')}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={styles.whiteLabel}>Team / Department</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={role}
              onValueChange={(itemValue) => {
                setRole(itemValue);
                setSubRole(''); 
              }}
              style={styles.picker}
              dropdownIconColor={COLORS.textMuted}
              mode="dropdown"
            >
              <Picker.Item label="Select your team..." value="" color={COLORS.textMuted} />
              <Picker.Item label="Cleaning Team" value="Cleaning" color="#000000" />
              <Picker.Item label="IT Team" value="IT" color="#000000" />
              <Picker.Item label="Maintenance Team" value="Maintenance" color="#000000" />
              <Picker.Item label="Medical Team" value="Medic" color="#000000" />
            </Picker>
          </View>

          {role === 'Maintenance' && (
            <>
              <Text style={styles.whiteLabel}>Trade Specialization</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={subRole}
                  onValueChange={(itemValue) => setSubRole(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.textMuted}
                  mode="dropdown"
                >
                  <Picker.Item label="Select your trade..." value="" color={COLORS.textMuted} />
                  <Picker.Item label="Mechanic" value="Mechanic" color="#000000" />
                  <Picker.Item label="Electrician" value="Electrician" color="#000000" />
                  <Picker.Item label="Control" value="Control" color="#000000" />
                  <Picker.Item label="Welder" value="Welder" color="#000000" />
                </Picker>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleCreateAccount}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={T.btnPrimaryText}>SUBMIT REQUEST</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>BACK TO LOGIN</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, alignItems: 'center', backgroundColor: COLORS.bg, paddingBottom: S.xxl },
  topBand: {
    width: '100%',
    height: 120,
    backgroundColor: '#0D0D0D',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: S.lg,
    borderBottomWidth: 1,
    marginBottom: S.lg,
    ...SHADOW.md,
  },
  logo: {
    width: 450,
    marginBottom: -50,
    height: 130,
    resizeMode: 'contain',
  },
  card: {
    width: '92%',
    backgroundColor: COLORS.surface,
    borderRadius: R.lg,
    padding: S.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: S.lg,
  },
  accentBar: {
    width: 4,
    height: 22,
    backgroundColor: COLORS.primaryBright,
    borderRadius: 2,
    marginRight: S.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: F.xl,
    fontWeight: '800',
    letterSpacing: 3,
  },
  whiteLabel: {
    color: '#FFFFFF',
    fontSize: F.xs,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  halfField: { flex: 1 },
  inputFocused: {
    borderColor: COLORS.primaryBright,
    backgroundColor: COLORS.surfaceHigh,
  },
  datePicker: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: S.md,
    paddingVertical: S.md - 2,
    marginVertical: S.xs,
  },
  dateTextSet: { color: COLORS.text, fontSize: F.md },
  dateTextPlaceholder: { color: COLORS.textMuted, fontSize: F.md },
  picker: {
    height: 50,
    width: '100%',
    color: '#FFFFFF', // Selected item text is now white
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMid,
    marginTop: 4,
    overflow: 'hidden',
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: R.pill,
    paddingVertical: S.md,
    alignItems: 'center',
    marginTop: S.lg,
    ...SHADOW.red,
  },
  btnDisabled: { opacity: 0.6 },
  linkWrap: {
    marginTop: S.xl,
    paddingVertical: S.sm,
    paddingHorizontal: S.lg,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMid,
  },
  linkText: {
    color: COLORS.textSec,
    fontSize: F.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default CreateScreen;