import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IAData } from "@/src/data/IAData";
import { MateriaData } from "@/src/data/MateriaData";
import type { Materia } from "@/src/entidades/Materia";

export default function GenerarCalendarioScreen() {
  const [temas, setTemas] = useState("");
  const [fechaPresentacion, setFechaPresentacion] = useState("2025-12-20");
  const [horasDia, setHorasDia] = useState("2");

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [materiasError, setMateriasError] = useState<string | null>(null);

  const [materiaSel, setMateriaSel] = useState<Materia | null>(null);
  const [showMaterias, setShowMaterias] = useState(false);

  const [preferencia, setPreferencia] = useState<string | null>(null);
  const [showPreferencia, setShowPreferencia] = useState(false);

  // ✅ usuarioId de tu tabla Usuarios (perfil), NO auth user
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [userReady, setUserReady] = useState(false);

  const PREFERENCIAS = useMemo(
    () => ["Mañana", "Tarde", "Noche", "Indiferente"],
    []
  );

  // ✅ Cargar usuarioId una vez
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const stored = userJson ? JSON.parse(userJson) : null;

        // 🔐 SOLO stored.usuario.id
        const id = stored?.usuario?.id ?? null;

        if (!alive) return;
        setUsuarioId(id);
      } catch (e) {
        console.log("Error leyendo user del storage:", e);
        if (!alive) return;
        setUsuarioId(null);
      } finally {
        if (alive) setUserReady(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingMaterias(true);
        setMateriasError(null);

        const data = await MateriaData.getAll();

        const sorted = [...data].sort((a, b) => {
          const an = (a as any).Nombre ?? "";
          const bn = (b as any).Nombre ?? "";
          return String(an).localeCompare(String(bn));
        });

        if (alive) {
          setMaterias(sorted);
          if (sorted.length === 1) setMateriaSel(sorted[0]);
        }
      } catch (e: any) {
        if (alive) {
          setMateriasError(e?.message ?? "No se pudieron cargar las materias");
        }
      } finally {
        if (alive) setLoadingMaterias(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const onGenerar = async () => {
    if (!userReady) {
      Alert.alert("Espera", "Cargando usuario…");
      return;
    }

    // ✅ Si no hay perfil, no dejamos usar IA
    if (!usuarioId) {
      Alert.alert(
        "Perfil incompleto",
        "Debes completar tu perfil para generar recomendaciones con IA.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Completar perfil", onPress: () => router.push("/editar-perfil") },
        ]
      );
      return;
    }

    if (!materiaSel) return Alert.alert("Falta info", "Selecciona una materia.");
    if (!temas.trim()) return Alert.alert("Falta info", "Escribe los temas.");

    const nombreMateria = (materiaSel as any).Nombre ?? "Sin nombre";
    const dificultad = (materiaSel as any).Dificultad ?? "N/A";

    const pregunta = [
      `Materia: ${nombreMateria} (id=${materiaSel.id}, dificultad=${dificultad})`,
      `Temas: ${temas}`,
      `Fecha objetivo: ${fechaPresentacion}`,
      `Horas por día: ${horasDia}`,
      `Preferencia: ${preferencia ?? "Indiferente"}`,
      "",
      "Devuélveme una recomendación clara.",
    ].join("\n");

    try {
      const res = await IAData.recomendarMateria(usuarioId, pregunta);
      Alert.alert("Recomendación IA", res.recomendacion);
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (e) {
      console.log("Error IA:", e);
      Alert.alert(
        "Error",
        "No se pudo generar con IA (revisa backend /api/inteligencia/... y que esté encendido)."
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "900" }}>Generar con IA</Text>
            <View style={{ width: 24 }} />
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 18,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#111",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "900" }}>Datos para tu calendario</Text>
                <Text style={{ color: "#666", marginTop: 2 }}>
                  La IA te recomendará y organizará tu estudio.
                </Text>
              </View>
            </View>

            <Label text="Materia *" />
            {loadingMaterias ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ActivityIndicator />
                <Text style={{ color: "#666" }}>Cargando materias...</Text>
              </View>
            ) : materiasError ? (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: "#d00", fontWeight: "700" }}>{materiasError}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setLoadingMaterias(true);
                    setMateriasError(null);
                    MateriaData.getAll()
                      .then((d) => setMaterias(d))
                      .catch((e: any) => setMateriasError(e?.message ?? "Error"))
                      .finally(() => setLoadingMaterias(false));
                  }}
                  style={{ marginTop: 8, alignSelf: "flex-start" }}
                >
                  <Text style={{ color: "#6c63ff", fontWeight: "800" }}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Dropdown
                  value={materiaSel ? `${(materiaSel as any).Nombre ?? "Materia"}` : null}
                  placeholder={materias.length ? "Selecciona una materia" : "No hay materias"}
                  open={showMaterias}
                  onToggle={() => setShowMaterias((v) => !v)}
                  disabled={!materias.length}
                />

                {showMaterias &&
                  materias.map((m) => (
                    <DropdownItem
                      key={m.id}
                      text={`${(m as any).Nombre ?? "Sin nombre"}  ·  Dif: ${(m as any).Dificultad ?? "N/A"}`}
                      onPress={() => {
                        setMateriaSel(m);
                        setShowMaterias(false);
                      }}
                    />
                  ))}
              </>
            )}

            <Label text="Temas *" />
            <TextInput
              value={temas}
              onChangeText={setTemas}
              placeholder="Ej: Integrales, Derivadas, Límites..."
              multiline
              style={[input, { minHeight: 90, textAlignVertical: "top" }]}
            />

            <Label text="Fecha objetivo (YYYY-MM-DD)" />
            <TextInput
              value={fechaPresentacion}
              onChangeText={setFechaPresentacion}
              placeholder="2025-12-20"
              style={input}
            />

            <Label text="Horas de estudio por día" />
            <TextInput
              value={horasDia}
              onChangeText={setHorasDia}
              keyboardType="numeric"
              placeholder="2"
              style={input}
            />

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

            <TouchableOpacity
              onPress={onGenerar}
              style={{
                marginTop: 20,
                backgroundColor: "#111",
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                opacity: loadingMaterias ? 0.7 : 1,
              }}
              disabled={loadingMaterias}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "900" }}>Generar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* helpers UI */
function Label({ text }: { text: string }) {
  return <Text style={{ fontWeight: "800", marginBottom: 6 }}>{text}</Text>;
}

function Dropdown({
  value,
  placeholder,
  open,
  onToggle,
  disabled,
}: {
  value: string | null;
  placeholder: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      style={{
        backgroundColor: "#F6F6FB",
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ color: value ? "#000" : "#888" }}>{value ?? placeholder}</Text>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} />
    </TouchableOpacity>
  );
}

function DropdownItem({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#EDEDFC",
        padding: 10,
        borderRadius: 12,
        marginBottom: 6,
      }}
    >
      <Text style={{ fontWeight: "600" }}>{text}</Text>
    </TouchableOpacity>
  );
}

const input = {
  backgroundColor: "#F6F6FB",
  borderRadius: 14,
  padding: 12,
  marginBottom: 12,
};
