import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { UsuarioData } from "@/src/data/UsuarioData";
import type { Usuario } from "@/src/entidades/Usuario";

export default function EditarPerfilScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<Usuario | null>(null);

  // Campos editables
  const [Nombre, setNombre] = useState("");
  const [Correo, setCorreo] = useState("");
  const [nivel_estudios, setNivel] = useState("");
  const [disponibilidad, setDisponibilidad] = useState(true);
  const [Dias_Libres, setDiasLibres] = useState("");
  const [periodo_prefencia, setPeriodo] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Leer SOLO el id de tu tabla Usuarios (storedUser.usuario.id)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : null;

        const id = storedUser?.usuario?.id ?? null;

        if (!alive) return;
        setUserId(id);
      } catch (e) {
        console.log("Error leyendo user del storage:", e);
        if (!alive) return;
        setUserId(null);
      } finally {
        if (alive) setInitialized(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Cargar datos del usuario (solo si existe el perfil)
  useEffect(() => {
    if (!initialized) return;

    // Si no hay userId, el usuario no tiene perfil en tabla Usuarios
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    UsuarioData.show(userId)
      .then((u) => {
        setUser(u);
        setNombre(u.Nombre ?? "");
        setCorreo(u.Correo ?? "");
        setNivel(u.nivel_estudios ?? "");
        setDisponibilidad(!!u.disponibilidad);
        setDiasLibres(u.Dias_Libres ?? "");
        setPeriodo(u.periodo_prefencia ?? "");
      })
      .catch((e) => {
        console.log("No se pudo cargar usuario:", e);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [userId, initialized]);

  const canSave = useMemo(() => {
    return Nombre.trim().length > 0 && Correo.trim().length > 0;
  }, [Nombre, Correo]);

  const canChangePassword = useMemo(() => {
    return oldPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword;
  }, [oldPassword, newPassword, confirmPassword]);

  async function onSave() {
    if (!userId) {
      Alert.alert("Perfil incompleto", "No existe tu perfil aún. Debes crearlo primero.");
      return;
    }

    if (!canSave) {
      Alert.alert("Faltan datos", "Nombre y Correo son obligatorios.");
      return;
    }

    try {
      setSaving(true);

      const payload: Partial<Usuario> = {
        Nombre: Nombre.trim(),
        Correo: Correo.trim(),
        nivel_estudios: nivel_estudios.trim(),
        disponibilidad,
        Dias_Libres: Dias_Libres.trim(),
        periodo_prefencia: periodo_prefencia.trim(),
      };

      await UsuarioData.patch(userId, payload);

      Alert.alert("Listo", "Perfil actualizado ✅", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    if (!canChangePassword) {
      Alert.alert("Error", "Verifica los campos de contraseña.");
      return;
    }

    try {
      setSaving(true);
      await UsuarioData.changePassword(oldPassword, newPassword);
      Alert.alert("Éxito", "Contraseña actualizada ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Loading inicial
  if (!initialized || loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6c63ff" />
          <Text style={{ marginTop: 10 }}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Si NO hay perfil en tabla Usuarios
  if (!userId || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "900", marginBottom: 8 }}>
            Perfil incompleto
          </Text>
          <Text style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
            Esta cuenta todavía no tiene perfil en el sistema.
            Completa tu perfil para poder usar sesiones y calendario.
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              backgroundColor: "#6c63ff",
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView>
        <View style={{ padding: 20, gap: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>Editar Perfil</Text>

          <Field label="Nombre" value={Nombre} onChangeText={setNombre} />
          <Field label="Correo" value={Correo} onChangeText={setCorreo} keyboardType="email-address" />
          <Field label="Nivel de estudios" value={nivel_estudios} onChangeText={setNivel} />
          <Field label="Días libres" value={Dias_Libres} onChangeText={setDiasLibres} multiline />
          <Field label="Periodo preferencia" value={periodo_prefencia} onChangeText={setPeriodo} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Disponibilidad</Text>
            <Switch value={disponibilidad} onValueChange={setDisponibilidad} />
          </View>

          <TouchableOpacity
            onPress={onSave}
            disabled={saving || !canSave}
            style={{
              marginTop: 10,
              backgroundColor: saving || !canSave ? "#bbb" : "#6c63ff",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontWeight: "700" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: any;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: "#eee",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          minHeight: multiline ? 90 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}
