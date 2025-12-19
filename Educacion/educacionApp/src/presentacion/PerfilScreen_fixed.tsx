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
  const [planesCount, setPlanesCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);

      const userJson = await AsyncStorage.getItem("user");
      if (!userJson) {
        setAuthUser(null);
        setUser(null);
        setSesiones([]);
        setPlanesCount(0);
        setMaterias([]);
        return;
      }

      const storedUser = JSON.parse(userJson);
      setAuthUser(storedUser);

      // ✅ SOLO el ID de tu tabla Usuarios
      const usuarioId: number | null = storedUser?.usuario?.id ?? null;

      // Si NO hay perfil (no existe en administrador.Usuarios)
      if (!usuarioId) {
        // no hacemos llamadas privadas
        setUser(null);
        setSesiones([]);
        setPlanesCount(0);

        // materias (si son globales, puedes dejarlas o quitarlas)
        // Si no quieres cargar nada aquí, comenta estas 2 líneas
        const m = await MateriaData.getAll().catch(() => []);
        setMaterias(m || []);
        return;
      }

      // ✅ Aquí sí: cargar perfil + sesiones + planes (todo por usuarioId)
      const [u, s, planes, m] = await Promise.all([
        UsuarioData.show(usuarioId).catch(() => null),
        SesionEstudioData.byUsuario(usuarioId).catch(() => []),
        PlanData.getAll().catch(() => []),
        MateriaData.getAll().catch(() => []),
      ]);

      setUser(u);
      setSesiones(s || []);
      setMaterias(m || []);

      const count = Array.isArray(planes)
        ? planes.filter((p: any) => Number(p?.Usuarios_id ?? p?.usuario ?? p?.usuario_id) === usuarioId).length
        : 0;
      setPlanesCount(count);
    } catch (e) {
      console.log("Error cargando perfil:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const sesionesHechas = useMemo(
    () => sesiones.filter((s) => !!s.estado).length,
    [sesiones]
  );

  const materiasEstudiadasCount = useMemo(() => {
    const setIds = new Set<number>();
    for (const s of sesiones) {
      const mid = s.Materias_id ?? Number((s as any).materia);
      if (mid) setIds.add(Number(mid));
    }
    return setIds.size;
  }, [sesiones]);

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro?", [
      { text: "Cancelar", onPress: () => {} },
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6c63ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {user ? (
          <View>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 18,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
                marginBottom: 16,
              }}
            >
              <ProfileHeader user={user} onEdit={() => router.push("/editar-perfil")} />

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                <StatCard value={planesCount} label="Planes" active />
                <StatCard value={materiasEstudiadasCount} label="Materias" />
                <StatCard value={sesiones.length} label="Sesiones" />
              </View>

              <ProfileOption icon="school-outline" title="Nivel de estudios" subtitle={user.nivel_estudios} />
              <ProfileOption icon="calendar-outline" title="Días libres" subtitle={user.Dias_Libres} />
              <ProfileOption icon="time-outline" title="Periodo preferencia" subtitle={user.periodo_prefencia} />
              <ProfileOption
                icon="checkmark-circle-outline"
                title="Disponibilidad"
                subtitle={user.disponibilidad ? "Disponible" : "No disponible"}
              />
              <ProfileOption
                icon="checkmark-done-outline"
                title="Sesiones completadas"
                subtitle={`${sesionesHechas} de ${sesiones.length}`}
              />
            </View>
          </View>
        ) : authUser ? (
          <View>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 18,
                elevation: 3,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#6c63ff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "900" }}>{authUser.username}</Text>
                  <Text style={{ fontSize: 14, color: "#666" }}>{authUser.email}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <StatCard value={0} label="Planes" />
                <StatCard value={0} label="Materias" />
                <StatCard value={0} label="Sesiones" />
              </View>

              <Text style={{ fontSize: 14, color: "#999", fontStyle: "italic" }}>
                Este usuario aún no tiene perfil completo en el sistema. Completa tu perfil para ver más información.
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/editar-perfil")}
                style={{
                  marginTop: 14,
                  backgroundColor: "#111",
                  paddingVertical: 12,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Completar perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            elevation: 3,
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#d32f2f" }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
