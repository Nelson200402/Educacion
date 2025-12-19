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
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Leer usuario desde AsyncStorage
      const userJson = await AsyncStorage.getItem("user");
      if (!userJson) {
        setError("No hay usuario cargado");
        setLoading(false);
        return;
      }

      const storedUser = JSON.parse(userJson);
      setAuthUser(storedUser);

      // Si existe usuario en administrador.Usuarios, usar ese ID
      let userId: number | null = null;
      if (storedUser.usuario?.id) {
        userId = storedUser.usuario.id;
      } else if (storedUser.id) {
        // Intenta con el ID del usuario autenticado
        userId = storedUser.id;
      }

      if (!userId) {
        setError("No se pudo determinar el ID del usuario");
        setLoading(false);
        return;
      }

      // Cargar datos del usuario
      const [u, m, s] = await Promise.all([
        UsuarioData.show(userId).catch(() => null),
        MateriaData.getAll().catch(() => []),
        SesionEstudioData.byUsuario(userId).catch(() => []),
      ]);

      setUser(u);
      setMaterias(m || []);
      setSesiones(s || []);

      // Cargar planes
      try {
        const planes = await PlanData.getAll();
        const count = Array.isArray(planes)
          ? planes.filter((p: any) => Number(p?.Usuarios_id ?? p?.usuario ?? p?.usuario_id) === userId).length
          : 0;
        setPlanesCount(count);
      } catch {
        setPlanesCount(0);
      }
    } catch (e) {
      console.log("Error cargando perfil:", e);
      setError("Error cargando los datos del perfil");
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
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Cerrar sesión",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
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
        {error ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 18,
              alignItems: "center",
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#d32f2f", marginBottom: 16 }}>
              {error}
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginBottom: 16, textAlign: "center" }}>
              Intenta hacer login nuevamente
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: "#d32f2f",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Volver al login</Text>
            </TouchableOpacity>
          </View>
        ) : user ? (
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

              <ProfileOption
                icon="school-outline"
                title="Nivel de estudios"
                subtitle={user.nivel_estudios}
              />
              <ProfileOption
                icon="calendar-outline"
                title="Días libres"
                subtitle={user.Dias_Libres}
              />
              <ProfileOption
                icon="time-outline"
                title="Periodo preferencia"
                subtitle={user.periodo_prefencia}
              />
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
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#d32f2f" }}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 18,
              alignItems: "center",
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#666" }}>
              No se encontraron datos del usuario
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                marginTop: 16,
                backgroundColor: "#d32f2f",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Volver al login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
