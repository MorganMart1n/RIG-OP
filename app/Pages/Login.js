import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { COLORS, S, F, R, SHADOW, T } from "./styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
//for auth to allow backend communication

import { BASE_URL, saveToken } from "./api";
function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const navigation = useNavigation();

  const log = (msg) => {
    console.log(msg);
    setDebugLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${msg}`,
    ]);
  };

  useEffect(() => {
    log(`Target: ${BASE_URL}`);
    fetch(`${BASE_URL}/`)
      .then((r) => log(`Server reachable ✓ (${r.status})`))
      .catch((e) => log(`Server UNREACHABLE ✗ — ${e.message}`));
  }, []);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter both username and password.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!data.token || typeof data.token !== "string") {
        throw new Error("Invalid token received");
      }

      await saveToken(data.token);
      navigation.navigate("MainTabs");
    } catch (error) {
      Alert.alert(
        "Connection Error",
        `Unable to reach server: ${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top dark header band */}
        <View style={styles.topBand} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoPill}>
            <Image
              source={require("../../assets/Bar-Logo.png")}
              style={styles.logo}
            />
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>SIGN IN</Text>
          </View>

          <Text style={T.label}>Username</Text>
          <TextInput
            style={[T.input, focusedField === "user" && styles.inputFocused]}
            placeholder="Enter your username"
            placeholderTextColor={COLORS.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onFocus={() => setFocusedField("user")}
            onBlur={() => setFocusedField(null)}
          />

          <Text style={[T.label, { marginTop: S.md }]}>Password</Text>
          <TextInput
            style={[T.input, focusedField === "pass" && styles.inputFocused]}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedField("pass")}
            onBlur={() => setFocusedField(null)}
          />

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={T.btnPrimaryText}>AUTHENTICATE</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer link */}
        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => navigation.navigate("Create")}
        >
          <Text style={styles.linkText}>REQUEST AN ACCOUNT</Text>
        </TouchableOpacity>

        {/* Bottom decorative bar */}
        <View style={styles.bottomBar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: COLORS.bg,
    paddingBottom: S.xxl,
  },
  topBand: {
    width: "100%",
    height: 120,
    backgroundColor: "#0D0D0D",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: -100,
    borderBottomWidth: 1,
    ...SHADOW.md,
  },
  logoWrap: {
    alignItems: "center",
    zIndex: 10,
    marginBottom: S.lg,
  },
  logo: {
    width: 320,
    height: 180,
    resizeMode: "contain",
  },
  // ── Debug panel ──────────────────────────────────────────────────────────
  debugBox: {
    width: "92%",
    backgroundColor: "#0f0f0f",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: R.md,
    padding: S.sm,
    marginBottom: S.md,
  },
  debugTitle: {
    color: "#f90",
    fontWeight: "bold",
    fontSize: F.xs,
    marginBottom: 4,
    letterSpacing: 1,
  },
  debugLine: {
    color: "#00ff88",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    marginBottom: 2,
  },
  // ── Rest of original styles ───────────────────────────────────────────────
  card: {
    width: "92%",
    backgroundColor: COLORS.surface,
    borderRadius: R.lg,
    padding: S.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: S.lg,
    ...SHADOW.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: S.lg,
  },
  accentBar: {
    width: 4,
    height: 22,
    backgroundColor: COLORS.primaryBright,
    borderRadius: R.xs,
    marginRight: S.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: F.xl,
    fontWeight: "800",
    letterSpacing: 3,
  },
  inputFocused: {
    borderColor: COLORS.primaryBright,
    backgroundColor: COLORS.surfaceHigh,
  },
  btn: {
    ...SHADOW.red,
    backgroundColor: COLORS.primary,
    borderRadius: R.pill,
    paddingVertical: S.md,
    alignItems: "center",
    marginTop: S.lg,
  },
  btnDisabled: {
    opacity: 0.6,
  },
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
    fontWeight: "700",
    letterSpacing: 2,
  },
  bottomBar: {
    marginTop: S.xxl,
    width: 60,
    height: 4,
    borderRadius: R.pill,
    backgroundColor: COLORS.primaryDark,
    alignSelf: "center",
  },
});

export default LoginScreen;
