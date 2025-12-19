import { MateriaData } from "@/src/data/MateriaData";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import type { Materia } from "@/src/entidades/Materia";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toHHMM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function CrearSesionScreen() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaSel, setMateriaSel] = useState<Materia | null>(null);
  const [showMaterias, setShowMaterias] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);

  const [nombre, setNombre] = useState("Estudio");
  const [tema, setTema] = useState("");

  // ✅ Fecha/hora reales para pickers
  const [fechaObj, setFechaObj] = useState<Date>(() => new Date());
  const [horaObj, setHoraObj] = useState<Date>(() => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    // opcional: redondear a 5 min
    const m = now.getMinutes();
    now.setMinutes(m - (m % 5));
    return now;
  });

  const [duracion, setDuracion] = useState("60");

  // ✅ mostrar pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const fechaStr = useMemo(() => toYMD(fechaObj), [fechaObj]);
  const horaStr = useMemo(() => toHHMM(horaObj), [horaObj]);

  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) usuario (id de tu tabla Usuarios)
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const stored = JSON.parse(userJson);
          const id = stored?.usuario?.id ?? null;
          if (!alive) return;
          setUsuarioId(id);
        }
      } catch (e) {
        console.log("Error reading user from storage", e);
      } finally {
        if (alive) setUserLoading(false);
      }

      // 2) materias
      try {
        setLoadingMaterias(true);
        const data = await MateriaData.getAll();
        const sorted = [...data].sort((a: any, b: any) =>
          String(a?.Nombre ?? a?.nombre ?? "").localeCompare(
            String(b?.Nombre ?? b?.nombre ?? "")
          )
        );
        if (!alive) return;
        setMaterias(sorted);
        if (sorted.length) setMateriaSel(sorted[0]);
      } catch (e) {
        console.log(e);
      } finally {
        if (alive) setLoadingMaterias(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    // en Android, al cancelar, selected viene undefined
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selected) return;

    // mantener hora seleccionada
    setFechaObj(selected);
  };

  const onChangeTime = (event: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (event.type === "dismissed" || !selected) return;

    // solo tomamos hora/minutos elegidos
    const newT = new Date(horaObj);
    newT.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setHoraObj(newT);
  };

  const onCrear = async () => {
    if (userLoading) return Alert.alert("Espera", "Cargando usuario…");

    if (!usuarioId) {
      return Alert.alert(
        "Perfil incompleto",
        "Debes completar tu perfil para poder crear sesiones.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Completar perfil", onPress: () => router.push("/editar-perfil") },
        ]
      );
    }

    if (!materiaSel) return Alert.alert("Falta", "Selecciona una materia.");

    const mins = Number(duracion);
    if (!Number.isFinite(mins) || mins <= 0)
      return Alert.alert("Duración inválida", "Pon minutos > 0.");

    const materiaNombre =
      (materiaSel as any).Nombre ??
      (materiaSel as any).nombre ??
      `Materia ${materiaSel.id}`;

    const payload = {
      Usuarios_id: usuarioId,
      Materias_id: (materiaSel as any).id,
      Planes_id: null,
      Nombre: `${nombre}: ${materiaNombre}`.trim(),
      descripcion: `Tema: ${tema || "Repaso"}`,
      duracion: mins,
      estado: false,
      fecha: fechaStr,        // ✅ hoy/seleccionada
      hora_inicio: horaStr,   // ✅ elegida desde reloj
    };

    try {
      await SesionEstudioData.create(payload as any);
      DeviceEventEmitter.emit("sesion:changed");

      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (e: any) {
      console.log(e?.message ?? e);
      const msg =
        typeof e?.message === "string" ? e.message : "No se pudo crear la sesión.";
      Alert.alert("Error", msg);
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
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
              style={styles.iconBtn}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Crear sesión</Text>

            <View style={{ width: 42 }} />
          </View>

          <Text style={styles.brand}>Plan de Estudio</Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              {/* Materia */}
              <Label text="Materia *" />
              {loadingMaterias ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator />
                  <Text style={{ color: "#666" }}>Cargando…</Text>
                </View>
              ) : (
                <>
                  <Dropdown
                    value={(materiaSel as any)?.Nombre ?? (materiaSel as any)?.nombre ?? null}
                    placeholder="Selecciona materia"
                    open={showMaterias}
                    onToggle={() => setShowMaterias((v) => !v)}
                  />
                  {showMaterias &&
                    materias.map((m: any) => (
                      <DropdownItem
                        key={m.id}
                        text={m.Nombre ?? m.nombre ?? `Materia ${m.id}`}
                        onPress={() => {
                          setMateriaSel(m);
                          setShowMaterias(false);
                        }}
                      />
                    ))}
                </>
              )}

              {/* Nombre */}
              <Label text="Nombre" />
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Estudio"
                placeholderTextColor="#B5B8C8"
                style={styles.input}
              />

              {/* Tema */}
              <Label text="Tema" />
              <TextInput
                value={tema}
                onChangeText={setTema}
                placeholder="Ej: Álgebra, Repaso parcial..."
                placeholderTextColor="#B5B8C8"
                style={styles.input}
              />

              {/* Fecha */}
              <Label text="Fecha *" />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.9}
                style={styles.pickerBtn}
              >
                <Text style={styles.pickerText}>{fechaStr}</Text>
                <Ionicons name="calendar-outline" size={18} color="#6C63FF" />
              </TouchableOpacity>

              {/* Hora */}
              <Label text="Hora inicio *" />
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.9}
                style={styles.pickerBtn}
              >
                <Text style={styles.pickerText}>{horaStr}</Text>
                <Ionicons name="time-outline" size={18} color="#6C63FF" />
              </TouchableOpacity>

              {/* Duración */}
              <Label text="Duración (min) *" />
              <TextInput
                value={duracion}
                onChangeText={setDuracion}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="#B5B8C8"
                style={styles.input}
              />

              {/* Botón */}
              <TouchableOpacity onPress={onCrear} activeOpacity={0.9}>
                <LinearGradient
                  colors={["#3B2AE6", "#FF8FD7"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.mainBtn}
                >
                  <Text style={styles.mainBtnText}>Crear sesión</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ✅ Date/Time pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={fechaObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={horaObj}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeTime}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Dropdown({
  value,
  placeholder,
  open,
  onToggle,
}: {
  value: string | null;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.dropdownBtn} activeOpacity={0.9}>
      <Text style={{ color: value ? "#1E1F2B" : "#8B90A8", fontWeight: "700" }}>
        {value ?? placeholder}
      </Text>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color="#6C63FF" />
    </TouchableOpacity>
  );
}

function DropdownItem({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.dropdownItem} activeOpacity={0.9}>
      <Text style={{ fontWeight: "800", color: "#1E1F2B" }}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EEF0FF" },

  header: {
    height: 200,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
      zIndex: 1,
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
  headerTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  brand: {
    marginTop: 28,
    textAlign: "center",
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  scroll: { flexGrow: 1, paddingBottom: 26 },
  cardWrap: { flex: 1, marginTop: -10, paddingHorizontal: 18 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
      zIndex: 10,
  },

  label: { fontWeight: "900", marginBottom: 8, color: "#2B2D3A" },

  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1E1F2B",
    marginBottom: 12,
    fontWeight: "700",
  },

  pickerBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: { fontSize: 15, fontWeight: "800", color: "#1E1F2B" },

  dropdownBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownItem: {
    backgroundColor: "#F0F1FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },

  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },

  mainBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
