import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/contexts/AuthContext";

import { MateriaData } from "@/src/data/MateriaData";
import { SesionEstudioData } from "@/src/data/SesionEstudioData";
import { UsuarioData } from "@/src/data/UsuarioData";
import { PlanData } from "@/src/data/PlanData";

import type { Materia } from "@/src/entidades/Materia";
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";
import type { Usuario } from "@/src/entidades/Usuario";

import ProfileHeader from "@/src/componentes/perfil/ProfileHeader";
import ProfileOption from "@/src/componentes/perfil/ProfileOption";
import StatCard from "@/src/componentes/perfil/StatCard";

export default function PerfilScreen() {
  const { logout } = useAuth();

  const [user, setUser] = useState<Usuario | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sesiones, setSesiones] = useState<SesionEstudio[]>([]);
  const [planesCount, setPlanesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);

      // 🔐 1. Leer usuario logueado
      const userJson = await AsyncStorage.getItem("user");
      if (!userJson) return;

      const storedUser = JSON.parse(userJson);
      setAuthUser(storedUser);

      // 🔐 2. Determinar UN SOLO userId válido
      const userId =
        storedUser?.usuario?.id ??
        storedUser?.id ??
        null;

      if (!userId) {
        console.warn("No se pudo determinar userId");
        return;
      }

      // 🔐 3. Cargar TODO usando ESE userId
      const [usuarioDB, sesionesUsuario, planes] = await Promise.all([
        UsuarioData.show(userId).catch(() => null),
        SesionEstudioData.byUsuario(userId).catch(() => []),
        PlanData.getAll().catch(() => []),
      ]);

      setUser(usuarioDB);
      setSesiones(sesionesUsuario || []);

      // ⚠️ Materias: solo las que aparecen en sesiones
      const materiasIds = new Set<number>();
      sesionesUsuario?.forEach((s: any) => {
        const mid = s.Materias_id ?? Number(s.materia);
        if (mid) materiasIds.add(Number(mid));
      });

      const todasMaterias = await MateriaData.getAll().catch(() => []);
      setMaterias(
        Array.isArray(todasMaterias)
          ? todasMaterias.filter((m: any) => materiasIds.has(Number(m.id)))
          : []
      );

      // 🔐 Planes SOLO del usuario
      const count = Array.isArray(planes)
        ? planes.filter(
            (p: any) =>
              Number(p?.Usuarios_id ?? p?.usuario_id ?? p?.usuario) === userId
          ).length
        : 0;

      setPlanesCount(count);
    } catch (e) {
      console.error("Error cargando perfil:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadAll();
  }, [loadAll]));

  const sesionesHechas = useMemo(
    () => sesiones.filter((s) => !!s.estado).length,
    [sesiones]
  );

  const materiasEstudiadasCount = useMemo(
    () => materias.length,
    [materias]
  );

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar" },
      {
        text: "Cerrar sesión",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6c63ff" />
        </View>
      </SafeAreaView>
    );
  }

  // 👇⬇️⬇️ A PARTIR DE AQUÍ NO SE TOCA UI ⬇️⬇️⬇️

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {user && (
          <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 18 }}>
            <ProfileHeader user={user} onEdit={() => router.push("/editar-perfil")} />

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <StatCard value={planesCount} label="Planes" active />
              <StatCard value={materiasEstudiadasCount} label="Materias" />
              <StatCard value={sesiones.length} label="Sesiones" />
            </View>

            <ProfileOption icon="school-outline" title="Nivel de estudios" subtitle={user.nivel_estudios} />
            <ProfileOption icon="calendar-outline" title="Días libres" subtitle={user.Dias_Libres} />
            <ProfileOption icon="time-outline" title="Periodo preferencia" subtitle={user.periodo_prefencia} />
            <ProfileOption icon="checkmark-circle-outline" title="Disponibilidad" subtitle={user.disponibilidad ? "Disponible" : "No disponible"} />
            <ProfileOption icon="checkmark-done-outline" title="Sesiones completadas" subtitle={`${sesionesHechas} de ${sesiones.length}`} />
          </View>
        )}

        <TouchableOpacity onPress={handleLogout} style={{ marginTop: 16 }}>
          <Text style={{ color: "#d32f2f", textAlign: "center" }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
