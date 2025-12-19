import TimelineDay from "@/src/componentes/calendario/TimelineDay";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalendarHeader from "@/src/componentes/calendario/CalendarHeader";
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
  // "10:55:56.207629" -> "10:55"
  return String(h).slice(0, 5);
}

export default function CalendarioScreen() {
  const params = useLocalSearchParams(); // ✅ refresh param
  const [selectedISO, setSelectedISO] = useState(toISODate(new Date()));
  const [sesiones, setSesiones] = useState<SesionEstudio[]>([]);
  const [loading, setLoading] = useState(false);

  const MATERIA_COLORS: Record<number, string> = {
    1: "#6C63FF",
    2: "#4CAF50",
    3: "#FF9800",
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SesionEstudioData.getAll();
      setSesiones(data);
    } catch (e) {
      console.log("Error sesiones:", e);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ se ejecuta SIEMPRE al entrar o cuando cambie refresh
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, params?.refresh])
  );

  const sesionesDelDia = useMemo(() => {
    return sesiones
      .filter((s) => s.fecha === selectedISO)
      .map((s) => ({
        ...s,
        _hora: normalizeHora(s.hora_inicio),
      }))
      .sort((a, b) => String((a as any)._hora).localeCompare(String((b as any)._hora)));
  }, [sesiones, selectedISO]);

  const onToggleDone = async (session: any) => {
    const id = session.id as number;

    // estado actual → nuevo estado
    const actual = !!session.estado;
    const nuevo = !actual;

    // ✅ optimista: cambia UI al instante
    setSesiones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: nuevo } : s))
    );

    try {
      await SesionEstudioData.toggleEstado(id, nuevo);
      // opcional: refrescar para asegurar consistencia
      await load();
    } catch (e: any) {
      // rollback si falló
      setSesiones((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: actual } : s))
      );
      Alert.alert("Error", e?.message ?? "No se pudo actualizar el estado.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <ScrollView stickyHeaderIndices={[0, 1]}>
        <View style={{ backgroundColor: "#F6F6FB" }}>
          <CalendarHeader
            title={monthTitle(selectedISO)}
            onToday={() => setSelectedISO(toISODate(new Date()))}
          />
        </View>

        <View style={{ backgroundColor: "#F6F6FB" }}>
          <DayStrip selectedISO={selectedISO} onSelect={setSelectedISO} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 120 }}>
          <Text style={{ fontSize: 16, fontWeight: "900", marginBottom: 10 }}>
            Sesiones del día
          </Text>

          {loading ? (
            <Text style={{ color: "#666" }}>Cargando sesiones...</Text>
          ) : sesionesDelDia.length === 0 ? (
            <EmptyCalendar />
          ) : (
            <TimelineDay
              sessions={sesionesDelDia.map((s: any) => {
                const materiaId = (s.Materias_id ?? Number(s.materia)) as number;

                return {
                  id: s.id,
                  title: s.Nombre,
                  subtitle: s.descripcion,
                  start: s._hora,
                  duration: s.duracion,
                  done: !!s.estado,
                  color: MATERIA_COLORS[materiaId] ?? "#999",
                };
              })}
              onToggleDone={onToggleDone}
              onSessionPress={(ses) =>
                router.push({
                  pathname: "/detalle-sesion",
                  params: {
                    id: String(ses.id),
                    title: ses.title,
                    desc: ses.subtitle,
                    time: ses.start,
                    minutes: String(ses.duration),
                    color: ses.color ?? "#6c63ff",
                  },
                })
              }
            />
          )}
        </View>
      </ScrollView>

      {/* IA */}
      <TouchableOpacity
        onPress={() => router.push("/generar-calendario")}
        style={{
          position: "absolute",
          right: 18,
          bottom: 24 + 58 + 12,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#111",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Crear sesión manual */}
      <TouchableOpacity
        onPress={() => router.push("/crear-sesion")}
        style={{
          position: "absolute",
          right: 18,
          bottom: 24,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#6c63ff",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
