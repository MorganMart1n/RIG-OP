import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, S, F, R, SHADOW, T } from './styles/theme';

import { BASE_URL } from './api';

function CreateScreen() {
  const navigation = useNavigation();

  const [fname,           setFname]           = useState('');
  const [sname,           setSname]           = useState('');
  const [email,           setEmail]           = useState('');
  const [phonenumber,     setPhoneNumber]     = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState('');
  const [subRole,         setSubRole]         = useState('');
  const [dob,             setDob]             = useState(null);
  const [showDatePicker,  setShowDatePicker]  = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [focusedField,    setFocusedField]    = useState(null);

  const inputStyle = (field) => [
    T.input,
    focusedField === field && T.inputFocused,
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
      const response = await fetch(`${BASE_URL}/createAccount`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fname, sname, email, phonenumber,
          password, role, subRole,
          isActive: false, dob,
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
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top band + logo */}
        <View style={styles.topBand}>
          <Image
            source={require('../../assets/Bar-Logo.png')}
            style={styles.logo}
          />
        </View>

        {/* Card */}
        <View style={[T.card, styles.cardWide]}>
          <View style={styles.cardHeader}>
            <View style={styles.accentBar} />
            <Text style={T.h3}>NEW ACCOUNT</Text>
          </View>

          {/* First name / Surname row */}
          <View style={T.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>First Name</Text>
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
            <View style={{ flex: 1, marginLeft: S.sm }}>
              <Text style={styles.fieldLabel}>Surname</Text>
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

          <Text style={styles.fieldLabel}>Email</Text>
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

          <Text style={styles.fieldLabel}>Phone Number</Text>
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

          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.datePicker, focusedField === 'dob' && T.inputFocused]}
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

          <Text style={styles.fieldLabel}>Password</Text>
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

          <Text style={styles.fieldLabel}>Confirm Password</Text>
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

          <Text style={styles.fieldLabel}>Team / Department</Text>
          <View style={T.pickerWrap}>
            <Picker
              selectedValue={role}
              onValueChange={(val) => { setRole(val); setSubRole(''); }}
              style={styles.picker}
              dropdownIconColor={COLORS.textMuted}
              mode="dropdown"
            >
              <Picker.Item label="Select your team..."  value=""            color={COLORS.textMuted} />
              <Picker.Item label="Cleaning Team"        value="Cleaning"    color="#000000" />
              <Picker.Item label="IT Team"              value="IT"          color="#000000" />
              <Picker.Item label="Maintenance Team"     value="Maintenance" color="#000000" />
              <Picker.Item label="Medical Team"         value="Medic"       color="#000000" />
            </Picker>
          </View>

          {role === 'Maintenance' && (
            <>
              <Text style={styles.fieldLabel}>Trade Specialization</Text>
              <View style={T.pickerWrap}>
                <Picker
                  selectedValue={subRole}
                  onValueChange={setSubRole}
                  style={styles.picker}
                  dropdownIconColor={COLORS.textMuted}
                  mode="dropdown"
                >
                  <Picker.Item label="Select your trade..." value=""           color={COLORS.textMuted} />
                  <Picker.Item label="Mechanic"             value="Mechanic"   color="#000000" />
                  <Picker.Item label="Electrician"          value="Electrician" color="#000000" />
                  <Picker.Item label="Control"              value="Control"    color="#000000" />
                  <Picker.Item label="Welder"               value="Welder"     color="#000000" />
                </Picker>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[T.btnPrimary, { marginTop: S.lg }, isLoading && styles.btnDisabled]}
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
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingBottom: S.xxl,
  },
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
  cardWide: {
    width: '92%',
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
  // Labels inherit base T.label but are white in this dark card context
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: F.xs,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  dateTextSet:         { color: COLORS.text,     fontSize: F.md },
  dateTextPlaceholder: { color: COLORS.textMuted, fontSize: F.md },
  picker: {
    height: 50,
    width: '100%',
    color: '#FFFFFF',
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
