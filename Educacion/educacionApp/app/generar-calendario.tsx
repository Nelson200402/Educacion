// app/generar-calendario.tsx
// Requiere:
//   npx expo install @react-native-community/datetimepicker expo-linear-gradient
//
// Muestra la recomendación de la IA en un modal bonito con scroll (no en Alert gigante).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Alert,
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

import { IAData } from "@/src/data/IAData";
import { MateriaData } from "@/src/data/MateriaData";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import type { Materia } from "@/src/entidades/Materia";

type Preferencia = "Mañana" | "Tarde" | "Noche" | "Indiferente";

/* ================== HELPERS ================== */

const pad2 = (n: number) => String(n).padStart(2, "0");

const toYYYYMMDD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const splitTemas = (t: string) =>
  t
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

const pickHoraInicio = (pref: Preferencia) => {
  switch (pref) {
    case "Mañana":
      return "08:00";
    case "Tarde":
      return "15:00";
    case "Noche":
      return "20:00";
    default:
      return "10:00";
  }
};

const addMinutes = (hhmm: string, mins: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${pad2(Math.floor(total / 60) % 24)}:${pad2(total % 60)}`;
};

/* ================== SCREEN ================== */

export default function GenerarCalendarioScreen() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaSel, setMateriaSel] = useState<Materia | null>(null);
  const [showMaterias, setShowMaterias] = useState(false);

  const [temas, setTemas] = useState("");

  // ✅ Fecha con picker (no escribir)
  const [fechaObj, setFechaObj] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // default: 7 días adelante
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const fechaObjetivo = useMemo(() => toYYYYMMDD(fechaObj), [fechaObj]);

  // ✅ Disponibilidad (horas por día)
  const [horasDia, setHorasDia] = useState("2");

  // ✅ Preferencia (parte del día)
  const [preferencia, setPreferencia] = useState<Preferencia>("Indiferente");
  const [showPreferencia, setShowPreferencia] = useState(false);

  // ✅ Estados de carga + error materias
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [materiasError, setMateriasError] = useState<string | null>(null);
  const [loadingGenerar, setLoadingGenerar] = useState(false);

  // ✅ Modal bonito IA
  const [showIA, setShowIA] = useState(false);
  const [iaText, setIaText] = useState("");
  const [sesionesCreadas, setSesionesCreadas] = useState(0);

  const PREFERENCIAS = useMemo<Preferencia[]>(
    () => ["Mañana", "Tarde", "Noche", "Indiferente"],
    []
  );

  /* ====== USUARIO REAL (tabla Usuarios) ====== */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;
        const id = parsed?.usuario?.id ?? null;
        setUsuarioId(id);
      } catch {
        setUsuarioId(null);
      }
    })();
  }, []);

  /* ====== CARGAR MATERIAS (ordenadas + error) ====== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingMaterias(true);
        setMateriasError(null);

        const data = await MateriaData.getAll();

        const sorted = [...data].sort((a: any, b: any) => {
          const an = String(a?.Nombre ?? a?.nombre ?? "");
          const bn = String(b?.Nombre ?? b?.nombre ?? "");
          return an.localeCompare(bn);
        });

        if (!alive) return;
        setMaterias(sorted);
        if (!materiaSel && sorted.length > 0) setMateriaSel(sorted[0]);
      } catch (e: any) {
        if (!alive) return;
        setMateriasError(e?.message ?? "No se pudieron cargar las materias");
      } finally {
        if (alive) setLoadingMaterias(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selected) return;
    // normaliza a solo fecha
    const d = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
    setFechaObj(d);
  };

  const closeIA = () => {
    setShowIA(false);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  /* ====== GENERAR ====== */
  const onGenerar = async () => {
    if (!usuarioId) {
      return Alert.alert("Perfil incompleto", "Completa tu perfil primero.");
    }

    if (!materiaSel) {
      return Alert.alert("Falta info", "Selecciona una materia.");
    }

    if (!temas.trim()) {
      return Alert.alert("Falta info", "Escribe los temas.");
    }

    const horas = Number(horasDia);
    if (!Number.isFinite(horas) || horas <= 0) {
      return Alert.alert("Horas inválidas", "Debe ser un número mayor a 0.");
    }

    const hoy = new Date();
    const start = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const end = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());

    if (end < start) {
      return Alert.alert(
        "Fecha objetivo inválida",
        "La fecha objetivo no puede ser menor a hoy."
      );
    }

    setLoadingGenerar(true);

    try {
      const materiaNombre =
        (materiaSel as any)?.Nombre ?? (materiaSel as any)?.nombre ?? "Materia";

      /* ====== 1) IA TEXTO ====== */
      const pregunta = [
        `Materia: ${materiaNombre}`,
        `Temas: ${temas}`,
        `Fecha objetivo: ${fechaObjetivo}`,
        `Disponibilidad de tiempo: ${horasDia} horas por día`,
        `Preferencia de horario: ${preferencia} (parte del día)`,
        "",
        "Quiero un plan breve y accionable. Reparte los temas de forma equilibrada hasta la fecha objetivo.",
      ].join("\n");

      const ia = await IAData.recomendarMateria(usuarioId, pregunta);

      /* ====== 2) CREAR SESIONES ====== */
      const temasList = splitTemas(temas);
      const days: string[] = [];

      {
        const d = new Date(start);
        while (d <= end) {
          days.push(toYYYYMMDD(d));
          d.setDate(d.getDate() + 1);
        }
      }

      // 1..3 sesiones por día
      const sesionesPorDia = Math.max(1, Math.min(3, Math.ceil(horas)));
      const minutosDia = Math.round(horas * 60);
      const duracion = Math.max(20, Math.round(minutosDia / sesionesPorDia));
      const pausa = 15;

      const baseHora = pickHoraInicio(preferencia);

      const sesionesPayloads = days.flatMap((fecha, dayIdx) => {
        return Array.from({ length: sesionesPorDia }).map((_, j) => {
          const temaPick =
            temasList[(dayIdx * sesionesPorDia + j) % temasList.length] ?? "Repaso";

          return {
            Usuarios_id: usuarioId,
            Materias_id: (materiaSel as any).id,
            Planes_id: null,
            Nombre: `Estudio: ${materiaNombre}`.trim(),
            descripcion: `Tema: ${temaPick}\nPreferencia: ${preferencia}\nObjetivo: ${fechaObjetivo}`,
            duracion,
            estado: false,
            fecha,
            hora_inicio: addMinutes(baseHora, j * (duracion + pausa)),
          };
        });
      });

      // Crear por tandas para que vaya más rápido
      for (let i = 0; i < sesionesPayloads.length; i += 10) {
        const chunk = sesionesPayloads.slice(i, i + 10);
        await Promise.all(chunk.map((p) => SesionEstudioData.create(p as any)));
      }

      // ✅ Mostrar en modal bonito (no Alert gigante)
      setSesionesCreadas(sesionesPayloads.length);
      setIaText(ia?.recomendacion ?? "Listo ✅");
      setShowIA(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo generar el calendario.");
    } finally {
      setLoadingGenerar(false);
    }
  };

  /* ====== UI ====== */
  return (
    <View style={styles.root}>
      {/* Header degradado (compacto) */}
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

            <Text style={styles.headerTitle}>Generar con IA</Text>

            <View style={{ width: 42 }} />
          </View>

          <Text style={styles.brand}>Calendario</Text>
          <Text style={styles.brandSub}>
            La IA recomienda y se crean sesiones reales automáticamente
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              {/* Materia */}
              <Label text="Materia *" />
              {loadingMaterias ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator />
                  <Text style={{ color: "#666" }}>Cargando materias…</Text>
                </View>
              ) : materiasError ? (
                <Text style={styles.errorText}>{materiasError}</Text>
              ) : (
                <>
                  <Dropdown
                    value={(materiaSel as any)?.Nombre ?? (materiaSel as any)?.nombre ?? null}
                    placeholder="Selecciona una materia"
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

              {/* Temas */}
              <Label text="Temas *" />
              <TextInput
                multiline
                value={temas}
                onChangeText={setTemas}
                placeholder="Ej: Integrales, Derivadas, Límites..."
                placeholderTextColor="#B5B8C8"
                style={[styles.input, { minHeight: 96, textAlignVertical: "top" }]}
              />

              {/* Fecha objetivo (picker) */}
              <Label text="Fecha objetivo" />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.9}
                style={styles.pickerBtn}
              >
                <Text style={styles.pickerText}>{fechaObjetivo}</Text>
                <Ionicons name="calendar-outline" size={18} color="#6C63FF" />
              </TouchableOpacity>

              {/* Horas por día (disponibilidad) */}
              <Label text="Disponibilidad (horas por día) *" />
              <TextInput
                value={horasDia}
                onChangeText={setHorasDia}
                keyboardType="numeric"
                placeholder="2"
                placeholderTextColor="#B5B8C8"
                style={styles.input}
              />
              <Text style={styles.hint}>
                Ej: 2 significa que puedes estudiar 2 horas cada día.
              </Text>

              {/* Preferencia */}
              <Label text="Preferencia de horario" />
              <Dropdown
                value={preferencia}
                placeholder="Indiferente"
                open={showPreferencia}
                onToggle={() => setShowPreferencia((v) => !v)}
              />
              {showPreferencia &&
                PREFERENCIAS.map((p) => (
                  <DropdownItem
                    key={p}
                    text={p}
                    onPress={() => {
                      setPreferencia(p);
                      setShowPreferencia(false);
                    }}
                  />
                ))}

              {/* Botón */}
              <TouchableOpacity
                onPress={onGenerar}
                disabled={loadingGenerar || loadingMaterias}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#3B2AE6", "#FF8FD7"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[
                    styles.mainBtn,
                    (loadingGenerar || loadingMaterias) && { opacity: 0.7 },
                  ]}
                >
                  {loadingGenerar ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.mainBtnText}>Generando…</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="sparkles" size={18} color="#fff" />
                      <Text style={styles.mainBtnText}>Generar calendario</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.footerNote}>
                Esto crea sesiones reales desde hoy hasta la fecha objetivo.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Picker fecha */}
        {showDatePicker && (
          <DateTimePicker
            value={fechaObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}
      </KeyboardAvoidingView>

      {/* ✅ MODAL BONITO PARA IA */}
      {showIA && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Calendario generado ✅</Text>
                <Text style={styles.modalSub}>Se crearon {sesionesCreadas} sesiones</Text>
              </View>
              <TouchableOpacity onPress={closeIA} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 14 }}>
              <Text style={styles.modalText}>{iaText}</Text>
            </ScrollView>

            <TouchableOpacity onPress={closeIA} activeOpacity={0.9}>
              <LinearGradient
                colors={["#3B2AE6", "#FF8FD7"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

/* ================== UI helpers ================== */

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
      <Text style={{ color: value ? "#1E1F2B" : "#8B90A8", fontWeight: "800" }}>
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

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EEF0FF" },

  header: {
    height: 190,
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
  headerTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },

  brand: {
    marginTop: 14,
    textAlign: "center",
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  brandSub: {
    marginTop: 6,
    textAlign: "center",
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "700",
  },

  scroll: { flexGrow: 1, paddingBottom: 26 },
  cardWrap: { flex: 1, marginTop: -24, paddingHorizontal: 18 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  label: { fontWeight: "900", marginBottom: 8, color: "#2B2D3A" },

  input: {
    borderRadius: 14,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    padding: 12,
    marginBottom: 12,
    fontWeight: "800",
    color: "#1E1F2B",
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
  pickerText: { fontSize: 15, fontWeight: "900", color: "#1E1F2B" },

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
  errorText: { color: "#D32F2F", marginBottom: 10, fontWeight: "800" },

  hint: { marginTop: -6, marginBottom: 10, color: "#7B7F95", fontSize: 12, fontWeight: "700" },

  mainBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  footerNote: { marginTop: 12, color: "#777", fontSize: 12, fontWeight: "700" },

  /* MODAL */
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#1E1F2B" },
  modalSub: { color: "#666", fontWeight: "700", marginTop: 2 },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F3FA",
  },
  modalText: { fontSize: 14, lineHeight: 22, color: "#222", fontWeight: "600" },
  modalBtn: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  modalBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
