// app/(tabs)/calendario.tsx  (o donde tengas tu CalendarioScreen)
// ✅ Mejoras visuales SIN romper tu lógica ni tus componentes:
// - Header con degradado (Jobsly style) + botón "Hoy"
// - "Sesiones del día" con chip de fecha seleccionada
// - Loading con skeleton simple
// - Contador de sesiones del día
// - FABs con etiqueta (IA / Nueva) y animación de escala al tocar
// - Mapea sesiones del backend filtrando por usuarioId (para que no te cargue las de todos)

import TimelineDay from "@/src/componentes/calendario/TimelineDay";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import DayStrip from "@/src/componentes/calendario/DayStrip";
import EmptyCalendar from "@/src/componentes/calendario/EmptyCalendar";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function monthTitle(iso: string) {
  const d = new Date(iso);
  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}
function normalizeHora(h: string | null | undefined) {
  if (!h) return "08:00";
  return String(h).slice(0, 5);
}
function prettyDate(iso: string) {
  // iso: YYYY-MM-DD
  const d = new Date(iso);
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  return `${days[d.getDay()]} ${d.getDate()}/${pad2(d.getMonth() + 1)}`;
}

export default function CalendarioScreen() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [selectedISO, setSelectedISO] = useState(toISODate(new Date()));
  const [sesiones, setSesiones] = useState<SesionEstudio[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Leer SOLO el id de tu tabla Usuarios (storedUser.usuario.id)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const storedUser = userJson ? JSON.parse(userJson) : null;
        const id = storedUser?.usuario?.id ?? null;

        if (!alive) return;
        setUsuarioId(id);
      } catch (e) {
        console.log("Error leyendo user del storage:", e);
        if (!alive) return;
        setUsuarioId(null);
      } finally {
        if (alive) setInitialized(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

const MATERIA_PALETTE = [
  "#6C63FF",
  "#4CAF50",
  "#FF9800",
  "#F44336",
  "#9C27B0",
  "#03A9F4",
  "#E91E63",
  "#795548",
  "#009688",
  "#3F51B5",
];

function colorFromMateria(id: number) {
  return MATERIA_PALETTE[id % MATERIA_PALETTE.length];
}

  const load = useCallback(async () => {
    if (!usuarioId) return;
    try {
      setLoading(true);
      const data = await SesionEstudioData.getAll();

      // ✅ Importante: filtra por tu usuario (si tu API trae todo)
      // Ajusta según tu modelo: a veces viene Usuarios_id, otras usuario_id
      const mine = (data ?? []).filter((s: any) => {
        const uid = s?.Usuarios_id ?? s?.usuario_id ?? s?.UsuariosId ?? null;
        return uid ? Number(uid) === Number(usuarioId) : true; // si no hay campo, no rompas
      });

      setSesiones(mine);
    } catch (e) {
      console.log("Error sesiones:", e);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      if (initialized && usuarioId) {
        load();
      }
    }, [load, initialized, usuarioId])
  );

  useEffect(() => {
    if (!usuarioId) return;
    const sub = DeviceEventEmitter.addListener("sesion:changed", () => {
      load();
    });
    return () => sub.remove();
  }, [load, usuarioId]);

  const sesionesDelDia = useMemo(() => {
    return sesiones
      .filter((s: any) => s.fecha === selectedISO)
      .map((s: any) => ({ ...s, _hora: normalizeHora(s.hora_inicio) }))
      .sort((a: any, b: any) => a._hora.localeCompare(b._hora));
  }, [sesiones, selectedISO]);

  const todayISO = useMemo(() => toISODate(new Date()), []);

  // ✅ Loading inicial
  if (!initialized) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6c63ff" />
          <Text style={{ marginTop: 10, color: "#666", fontWeight: "800" }}>
            Preparando calendario…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Usuario logueado pero SIN perfil (no existe en tabla Usuarios)
  if (!usuarioId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
        <View style={styles.centerPadded}>
          <Ionicons name="person-circle-outline" size={54} color="#6c63ff" />
          <Text style={styles.h1}>Perfil incompleto</Text>
          <Text style={styles.p}>
            Completa tu perfil para ver y crear sesiones en el calendario.
          </Text>

          <TouchableOpacity onPress={() => router.push("/editar-perfil")} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Completar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Info",
                "Esto pasa porque tu cuenta no tiene un registro en la tabla Usuarios. Ve a 'Editar perfil' y complétalo."
              )
            }
            style={{ marginTop: 10, padding: 10 }}
          >
            <Text style={{ color: "#6c63ff", fontWeight: "900" }}>¿Por qué pasa esto?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const onToggleDone = async (id: number, current: boolean) => {
    try {
      setSesiones((prev) => prev.map((s: any) => (s.id === id ? { ...s, estado: !current } : s)));
      await SesionEstudioData.toggleEstado(id, !current);
      DeviceEventEmitter.emit("sesion:changed");
    } catch (e) {
      console.log(e);
      setSesiones((prev) => prev.map((s: any) => (s.id === id ? { ...s, estado: current } : s)));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#EEF0FF" }}>
      {/* Header degradado (bonito y compacto) */}
      <LinearGradient
        colors={["#3B2AE6", "#6C63FF", "#8B7BFF"]}
        start={{ x: 0.05, y: 0.1 }}
        end={{ x: 0.95, y: 0.9 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>{monthTitle(selectedISO)}</Text>
              <Text style={styles.headerSubtitle}>Tus sesiones organizadas</Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedISO(todayISO)}
              activeOpacity={0.9}
              style={styles.todayBtn}
            >
              <Ionicons name="today-outline" size={16} color="#fff" />
              <Text style={styles.todayBtnText}>Hoy</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Spacer para que la card "flote" */}
        <View style={{ height: 12 }} />

        {/* Day strip (sticky) dentro de contenedor blanco */}
        <View style={styles.stripWrap}>
          <DayStrip selectedISO={selectedISO} onSelect={setSelectedISO} />
        </View>

        {/* Card principal */}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Sesiones del día</Text>
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Ionicons name="calendar-outline" size={14} color="#6C63FF" />
                    <Text style={styles.chipText}>{prettyDate(selectedISO)}</Text>
                  </View>

                  <View style={[styles.chip, { backgroundColor: "#F0F1FF" }]}>
                    <Ionicons name="list-outline" size={14} color="#6C63FF" />
                    <Text style={styles.chipText}>{sesionesDelDia.length} sesión(es)</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={load}
                style={styles.refreshBtn}
                activeOpacity={0.9}
              >
                <Ionicons name="refresh" size={18} color="#6C63FF" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ paddingVertical: 18 }}>
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#6C63FF" />
                  <Text style={{ color: "#666", fontWeight: "800" }}>Cargando sesiones…</Text>
                </View>
                {/* mini skeleton */}
                <View style={styles.skeleton} />
                <View style={styles.skeleton} />
                <View style={styles.skeleton} />
              </View>
            ) : sesionesDelDia.length === 0 ? (
              <EmptyCalendar />
            ) : (
              <TimelineDay
                sessions={sesionesDelDia.map((s: any) => ({
                  id: s.id,
                  title: s.Nombre,
                  subtitle: s.descripcion,
                  start: s._hora,
                  duration: s.duracion,
                  done: !!s.estado,
                  color: colorFromMateria(
                    Number(s.Materias_id ?? s.materia ?? 0)
                  ),
                }))}
                onSessionPress={(ses) =>
                  router.push({
                    pathname: "/detalle-sesion",
                    params: { id: String(ses.id) },
                  })
                }
                onToggleDone={(s) => onToggleDone(s.id, !!s.done)}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB: IA (con etiqueta) */}
      <Pressable
        onPress={() => router.push("/generar-calendario")}
        style={({ pressed }) => [
          styles.fab,
          { bottom: 24 + 58 + 12, backgroundColor: "#111" },
          pressed && { transform: [{ scale: 0.96 }] },
        ]}
      >
        <Ionicons name="sparkles" size={20} color="#fff" />
        <Text style={styles.fabLabel}>IA</Text>
      </Pressable>

      {/* FAB: Crear sesión (con etiqueta) */}
      <Pressable
        onPress={() => router.push("/crear-sesion")}
        style={({ pressed }) => [
          styles.fab,
          { bottom: 24, backgroundColor: "#6c63ff" },
          pressed && { transform: [{ scale: 0.96 }] },
        ]}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.fabLabel}>Nueva</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 150,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
  },
  headerSafe: { flex: 1, paddingHorizontal: 16, justifyContent: "center" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: "#fff", fontWeight: "900", fontSize: 20 },
  headerSubtitle: { marginTop: 2, color: "rgba(255,255,255,0.9)", fontWeight: "700", fontSize: 12 },

  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  todayBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  stripWrap: {
    backgroundColor: "#F6F6FB",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E8F5",
  },

  cardWrap: { paddingHorizontal: 16, marginTop: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  sectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#1E1F2B" },

  chipRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
  },
  chipText: { fontWeight: "800", color: "#2B2D3A", fontSize: 12 },

  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#F6F7FF",
    borderWidth: 1,
    borderColor: "#E6E8F5",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  skeleton: {
    height: 18,
    borderRadius: 10,
    backgroundColor: "#EEF0FF",
    marginBottom: 10,
  },

  fab: {
    position: "absolute",
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 7,
  },
  fabLabel: { marginTop: 2, color: "#fff", fontWeight: "900", fontSize: 10 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerPadded: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },

  h1: { fontSize: 18, fontWeight: "900", marginTop: 10, textAlign: "center" },
  p: { fontSize: 14, color: "#666", marginTop: 6, textAlign: "center" },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },
});
