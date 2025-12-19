// app/login.tsx
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { AuthData } from "@/src/data/AuthData";
import { useAuth } from "@/src/contexts/AuthContext";

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // (si lo usas en tu app; lo dejo para que no rompa imports)
  const { isSignedIn } = useAuth();

  const onLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert("Falta información", "Escribe correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthData.login(correo.trim(), password);

      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      router.replace("/(tabs)/calendario");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.topHint}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push("/signup")} style={styles.pillBtn}>
                <Text style={styles.pillText}>Empezar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.brand}>Smart Flow</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* TARJETA BLANCA (como la imagen) */}
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.subtitle}>Ingresa tus datos abajo</Text>

          {/* Email */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              value={correo}
              onChangeText={setCorreo}
              placeholder="Nombre de Usuario"
              placeholderTextColor="#B5B8C8"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••"
                placeholderTextColor="#B5B8C8"
                secureTextEntry={!showPass}
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

          {/* BOTÓN DEGRADADO */}
          <TouchableOpacity onPress={onLogin} disabled={loading} activeOpacity={0.9}>
            <LinearGradient
              colors={["#3B2AE6", "#FF8FD7"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.signBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.signText}>Entrando…</Text>
                </View>
              ) : (
                <Text style={styles.signText}>Iniciar sesión</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* LINK ABAJO */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomHint}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.bottomLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

  cardWrap: {
    flex: 1,
    marginTop: -80, // sube la tarjeta como en la imagen
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
