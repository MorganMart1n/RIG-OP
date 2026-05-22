import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { COLORS, S, F, R, SHADOW, T, formatDate } from "./styles/theme";
import { apiGet, apiPost, clearToken } from "./api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = SCREEN_WIDTH / 375;
const normalize = (size) => {
  const n = size * scale;
  return Platform.OS === "ios" ? Math.round(n) : Math.round(n) - 1;
};

// ── Sub-components ────────────────────────────────────────────────────────

function Avatar({ name }) {
  const initials = name
    ? name.split(".").map((n) => n[0]?.toUpperCase()).join("")
    : "??";
  return (
    <View style={styles.avatarOuter}>
      <View style={styles.avatarInner}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>
      <View style={styles.activeDot} />
    </View>
  );
}

function InfoRow({
  label, value, editable, onChangeText,
  secureText, field, focusedField, setFocused,
}) {
  return (
    <View style={styles.infoBlock}>
      <Text style={T.label}>{label}</Text>
      {editable ? (
        <TextInput
          style={[T.input, focusedField === field && styles.inputFocused]}
          value={value ?? ""}
          onChangeText={onChangeText}
          secureTextEntry={secureText}
          autoCapitalize="none"
          onFocus={() => setFocused(field)}
          onBlur={() => setFocused(null)}
          placeholderTextColor={COLORS.textMuted}
        />
      ) : (
        <Text style={styles.infoValue}>
          {secureText ? "••••••••" : value || "—"}
        </Text>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

function ProfileScreen() {
  const navigation = useNavigation();

  const [userData,     setUserData]  = useState(null);
  const [isEditing,    setIsEditing] = useState(false);
  const [isLoading,    setIsLoading] = useState(true);
  const [isSaving,     setIsSaving]  = useState(false);
  const [focusedField, setFocused]   = useState(null);

  // Editable field state
  const [username,    setUsername] = useState("");
  const [password,    setPassword] = useState("");
  const [email,       setEmail]    = useState("");
  const [phonenumber, setPhone]    = useState("");
  const [dob,         setDob]      = useState("");

  // ── Fetch profile ───────────────────────────────────────────────────────
 useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);

      try {
        const data = await apiGet("/profile");

        console.log("PROFILE RESPONSE:", data);

        if (!isActive) return;

        if (data?.success && data?.user) {
          setUserData(data.user);
          setUsername(data.user.username || "");
          setEmail(data.user.email || "");
          setPhone(String(data.user.phonenumber || ""));
          setDob(data.user.dob || "");
        } else {
          Alert.alert("Error", "Invalid profile response from server.");
        }
      } catch (err) {
        console.log("PROFILE ERROR:", err);

        if (!isActive) return;

        if (err?.status === 401) {
          await clearToken();
          navigation.replace("Login");
        } else {
          Alert.alert("Error", err?.message || "Unable to load profile.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [navigation])
);

  // ── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await apiPost('/logout');
    } catch (_) {
      // ignore — we clear the token regardless
    } finally {
      await clearToken();
      navigation.replace('Login');
    }
  };

  // ── Save edits ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);

    const updates = {};
    if (username    !== userData?.username)                 updates.username    = username;
    if (password    && password.length > 0)                updates.password    = password;
    if (email       !== userData?.email)                    updates.email       = email;
    if (phonenumber !== String(userData?.phonenumber || "")) updates.phonenumber = phonenumber;
    if (dob         !== (userData?.dob || ""))              updates.dob         = dob;

    if (!Object.keys(updates).length) {
      Alert.alert("No Changes", "Nothing was modified.");
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    try {
      const data = await apiPost("/updateUser", updates);
      if (data.success) {
        setUserData(data.user);
        Alert.alert("Saved", "Profile updated successfully.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Update failed.");
    } finally {
      setIsEditing(false);
      setIsSaving(false);
      setPassword("");
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[T.screen, T.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryBright} />
        <Text style={[T.caption, { marginTop: S.md }]}>LOADING PROFILE</Text>
      </View>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={T.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContainerCustom}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          overScrollMode="always"
        >
          {/* Header band with avatar */}
          <View style={styles.headerBand}>
            <Avatar name={userData?.username} />
          </View>

          {/* Padded body */}
          <View style={styles.paddedContent}>

            {/* Name + role chip */}
            <View style={styles.nameSection}>
              <Text style={styles.displayName}>
                {userData?.username?.toUpperCase() || "UNKNOWN"}
              </Text>
              <View style={styles.roleChip}>
                <Text style={styles.roleChipText}>{userData?.role || "—"}</Text>
              </View>
            </View>

            {/* User details card */}
            <View style={[T.card, { marginTop: normalize(20) }]}>
              <View style={styles.sectionHead}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeadText}>
                  {isEditing ? "EDITING DETAILS" : "USER DETAILS"}
                </Text>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.colLeft}>
                  <InfoRow
                    label="Username" value={username} editable={isEditing}
                    onChangeText={setUsername} field="username"
                    focusedField={focusedField} setFocused={setFocused}
                  />
                </View>
                <View style={styles.colRight}>
                  <InfoRow
                    label="Password" value={isEditing ? password : "••••••••"}
                    editable={isEditing} onChangeText={setPassword}
                    secureText={!isEditing} field="password"
                    focusedField={focusedField} setFocused={setFocused}
                  />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.colLeft}>
                  <InfoRow label="Role"       value={userData?.role}       editable={false} />
                </View>
                <View style={styles.colRight}>
                  <InfoRow label="Department" value={userData?.department} editable={false} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={styles.colLeft}>
                  <InfoRow
                    label="Phone Number" value={phonenumber} editable={isEditing}
                    onChangeText={setPhone} field="phone"
                    focusedField={focusedField} setFocused={setFocused}
                  />
                </View>
                <View style={styles.colRight}>
                  <InfoRow
                    label="Email" value={email} editable={isEditing}
                    onChangeText={setEmail} field="email"
                    focusedField={focusedField} setFocused={setFocused}
                  />
                </View>
              </View>

              <InfoRow
                label="Date of Birth"
                value={isEditing ? dob : formatDate(dob)}
                editable={isEditing} onChangeText={setDob}
                field="dob" focusedField={focusedField} setFocused={setFocused}
              />
            </View>

            {/* Performance card */}
            <View style={[T.card, { marginTop: normalize(12) }]}>
              <View style={styles.sectionHead}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionHeadText}>PERFORMANCE</Text>
              </View>
              <View style={T.row}>
                <Text style={{ fontSize: normalize(28), marginRight: S.md }}>🏆</Text>
                <View>
                  <Text style={styles.perfValue}>
                    {userData?.ticketsCompleted ?? 0}
                  </Text>
                  <Text style={T.label}>TICKETS COMPLETED</Text>
                </View>
              </View>
            </View>

            {/* Edit / Save button */}
            <TouchableOpacity
              style={[T.btnPrimary, { marginTop: normalize(24) }]}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={T.btnPrimaryText}>
                  {isEditing ? "SAVE CHANGES" : "EDIT PROFILE"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel edit */}
            {isEditing && (
              <TouchableOpacity
                style={[T.btnGhost, { marginTop: normalize(8) }]}
                onPress={() => { setIsEditing(false); }}
              >
                <Text style={T.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {/* Sign out */}
            <TouchableOpacity
              style={[T.btnDanger, { marginTop: normalize(12) }]}
              onPress={() =>
                Alert.alert("Sign Out", "Are you sure you want to log out?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout", style: "destructive", onPress: handleLogout },
                ])
              }
              activeOpacity={0.8}
            >
              <Text style={T.btnDangerText}>SIGN OUT</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContainerCustom: { paddingBottom: normalize(120) },
  headerBand: {
    backgroundColor: COLORS.surface,
    height: normalize(100),
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: normalize(28),
    borderBottomRightRadius: normalize(28),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOW.md,
    marginBottom: normalize(44),
  },
  paddedContent: { paddingHorizontal: normalize(16), width: "100%" },
  avatarOuter: { position: "absolute", bottom: normalize(-44), alignSelf: "center" },
  avatarInner: {
    width: normalize(88), height: normalize(88),
    borderRadius: normalize(44), backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: COLORS.surface, ...SHADOW.red,
  },
  avatarInitials: {
    color: COLORS.text, fontSize: normalize(24),
    fontWeight: "800", letterSpacing: 2,
  },
  activeDot: {
    position: "absolute", bottom: normalize(2), right: normalize(2),
    width: normalize(16), height: normalize(16),
    borderRadius: normalize(8), backgroundColor: COLORS.success,
    borderWidth: 2, borderColor: COLORS.bg,
  },
  nameSection:   { alignItems: "center", marginTop: normalize(10) },
  displayName:   { color: COLORS.text, fontSize: normalize(22), fontWeight: "800", letterSpacing: 2, textAlign: "center" },
  roleChip:      { backgroundColor: COLORS.primaryDark, borderRadius: R.pill, paddingVertical: normalize(4), paddingHorizontal: normalize(12), marginTop: normalize(8), borderWidth: 1, borderColor: COLORS.borderAccent, ...SHADOW.redSm },
  roleChipText:  { color: COLORS.primaryBright, fontSize: normalize(11), fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  sectionHead:   { flexDirection: "row", alignItems: "center", marginBottom: normalize(12) },
  accentBar:     { width: 3, height: normalize(18), backgroundColor: COLORS.primaryBright, borderRadius: 2, marginRight: normalize(8) },
  sectionHeadText: { color: COLORS.text, fontSize: normalize(14), fontWeight: "700", letterSpacing: 2 },
  twoCol:        { flexDirection: "row", justifyContent: "space-between" },
  colLeft:       { flex: 1, marginRight: normalize(10) },
  colRight:      { flex: 1 },
  infoBlock:     { marginBottom: normalize(12) },
  infoValue:     { color: COLORS.text, fontSize: normalize(14), fontWeight: "600", paddingVertical: normalize(4) },
  inputFocused:  { borderColor: COLORS.primaryBright, backgroundColor: COLORS.surfaceHigh },
  perfValue:     { color: COLORS.primaryBright, fontSize: normalize(32), fontWeight: "800" },
});

export default ProfileScreen;