// app/signup.tsx
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { AuthData } from "@/src/data/AuthData";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canRegister = useMemo(() => {
    return (
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      password === confirmPassword
    );
  }, [username, email, password, confirmPassword]);

  const onRegister = async () => {
    if (!canRegister) {
      Alert.alert("Error", "Verifica todos los campos");
      return;
    }

    try {
      setLoading(true);
      const response = await AuthData.register(
        username.trim(),
        email.trim(),
        password
      );

      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

      Alert.alert("¡Bienvenido!", "Tu cuenta ha sido creada exitosamente", [
        { text: "OK", onPress: () => router.replace("/(tabs)/calendario") },
      ]);
    } catch (e: any) {
      console.log("Error:", e);
      Alert.alert("Error al registrarse", e?.message ?? "Intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  const passMismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <View style={styles.root}>
      {/* HEADER DEGRADADO */}
      <LinearGradient
        colors={["#3B2AE6", "#6C63FF", "#8B7BFF"]}
        start={{ x: 0.05, y: 0.1 }}
        end={{ x: 0.95, y: 0.9 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.topRightRow}>
              <Text style={styles.topHint}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={styles.pillBtn}
              >
                <Text style={styles.pillText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.brand}>Registrate</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* CUERPO */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Regístrate para empezar</Text>

              {/* Usuario */}
              <View style={styles.inputBox}>
                <Text style={styles.label}>Usuario</Text>
                <TextInput
                  placeholder="ejemplo_usuario"
                  placeholderTextColor="#B5B8C8"
                  value={username}
                  onChangeText={setUsername}
                  editable={!loading}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* Email */}
              <View style={styles.inputBox}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  placeholder="tu@email.com"
                  placeholderTextColor="#B5B8C8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!loading}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputBox}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passRow}>
                  <TextInput
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#B5B8C8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    editable={!loading}
                    style={[styles.input, { flex: 1, paddingRight: 44 }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPass ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9AA0B5"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar */}
              <View style={styles.inputBox}>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <View style={styles.passRow}>
                  <TextInput
                    placeholder="Repite la contraseña"
                    placeholderTextColor="#B5B8C8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    editable={!loading}
                    style={[
                      styles.input,
                      { flex: 1, paddingRight: 44 },
                      passMismatch && styles.inputError,
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9AA0B5"
                    />
                  </TouchableOpacity>
                </View>

                {passMismatch && (
                  <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                )}
              </View>

              {/* BOTÓN DEGRADADO */}
              <TouchableOpacity
                onPress={onRegister}
                disabled={loading || !canRegister}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading || !canRegister ? ["#BFC3D7", "#BFC3D7"] : ["#3B2AE6", "#FF8FD7"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.signBtn}
                >
                  {loading ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.signText}>Creando…</Text>
                    </View>
                  ) : (
                    <Text style={styles.signText}>Crear cuenta</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* LINK ABAJO */}
              <View style={styles.bottomRow}>
                <Text style={styles.bottomHint}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.bottomLink}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EEF0FF" },

  header: {
    height: 260,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
  },
  headerSafe: { flex: 1, paddingHorizontal: 18 },
  topBar: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  topRightRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  topHint: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  pillText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  brand: {
    marginTop: 38,
    textAlign: "center",
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  scroll: { flexGrow: 1, paddingBottom: 26 },
  cardWrap: {
    flex: 1,
    marginTop: -80,
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E1F2B",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 13,
    color: "#7B7F95",
    textAlign: "center",
  },

  inputBox: { marginBottom: 14 },
  label: {
    fontSize: 12,
    color: "#A1A6BC",
    marginBottom: 8,
    marginLeft: 6,
    fontWeight: "700",
  },
  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E1F2B",
  },

  passRow: { position: "relative", justifyContent: "center" },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 54,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  inputError: { borderColor: "#FF6B6B" },
  errorText: { marginTop: 8, marginLeft: 6, fontSize: 12, color: "#D32F2F", fontWeight: "700" },

  signBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  signText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  bottomRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  bottomHint: { color: "#7B7F95", fontSize: 13 },
  bottomLink: { color: "#6C63FF", fontSize: 13, fontWeight: "900" },
});
