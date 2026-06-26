import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, S, F, R, SHADOW, T } from './styles/theme';
import { BASE_URL, saveToken } from './api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function LoginScreen() {
  const navigation     = useNavigation();
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/`)
      .then((r) => console.log(`Server reachable ✓ (${r.status})`))
      .catch((e) => console.log(`Server UNREACHABLE ✗ — ${e.message}`));
  }, []);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!data.token || typeof data.token !== 'string') {
        throw new Error('Invalid token received');
      }
      await saveToken(data.token);
      navigation.navigate('MainTabs');
    } catch (error) {
      Alert.alert('Connection Error', `Unable to reach server: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = (field) => [
    T.input,
    focusedField === field && T.inputFocused,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo section — takes upper third of screen */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/Bar-Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Form section */}
        <View style={styles.formSection}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.accentBar} />
            <Text style={T.h3}>SIGN IN</Text>
          </View>

          <Text style={T.label}>Username</Text>
          <TextInput
            style={inputStyle('user')}
            placeholder="Enter your username"
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onFocus={() => setFocusedField('user')}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={[T.label, { marginTop: S.md }]}>Password</Text>
          <TextInput
            style={inputStyle('pass')}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField('pass')}
            onBlur={() => setFocusedField(null)}
          />

          <TouchableOpacity
            style={[T.btnPrimary, { marginTop: S.xl }, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={COLORS.text} />
              : <Text style={T.btnPrimaryText}>AUTHENTICATE</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => navigation.navigate('create')}
          >
            <Text style={styles.linkText}>REQUEST AN ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT,
  },
  logoSection: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.01,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOW.md,
  },
  logo: {
    width: 250,
    height: 250,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: S.lg,
    paddingTop: S.xl,
    paddingBottom: S.xxl,
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
    borderRadius: R.xs,
    marginRight: S.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  linkWrap: {
    marginTop: S.lg,
    alignSelf: 'center',
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

export default LoginScreen;