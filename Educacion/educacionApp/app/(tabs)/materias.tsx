import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MateriaData } from "@/src/data/MateriaData";
import type { Materia } from "@/src/entidades/Materia";

export default function MateriasScreen() {
  const [nombre, setNombre] = useState("");
  const [dificultad, setDificultad] = useState("");
  const [notas, setNotas] = useState("");

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animar = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const limpiar = () => {
    setNombre("");
    setDificultad("");
    setNotas("");
    setEditandoId(null);
  };

  const cargarMaterias = async () => {
    try {
      setLoading(true);
      const data = await MateriaData.getAll();
      setMaterias(data);
      animar();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudieron cargar materias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  const agregarOEditarMateria = async () => {
    if (!nombre.trim()) {
      Alert.alert("Falta info", "Escribe el nombre de la materia.");
      return;
    }

    // si tu backend espera número, puedes validar aquí
    // const difNum = Number(dificultad);
    // if (!Number.isFinite(difNum) || difNum < 1 || difNum > 5) ...

    const payload: Partial<Materia> = {
      Nombre: nombre.trim(),
      Dificultad: dificultad.trim(), // o String(difNum)
      Notas: notas.trim() ? notas.trim() : null,
    };

    try {
      setLoading(true);

      if (editandoId !== null) {
        await MateriaData.update(editandoId, payload);
        Alert.alert("Listo", "Materia actualizada.");
      } else {
        await MateriaData.create(payload);
        Alert.alert("Listo", "Materia creada.");
      }

      limpiar();
      await cargarMaterias();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo guardar la materia");
    } finally {
      setLoading(false);
    }
  };

  const editarMateria = (m: Materia) => {
    setNombre(m.Nombre ?? "");
    setDificultad(m.Dificultad ?? "");
    setNotas(m.Notas ?? "");
    setEditandoId(m.id);
  };

  const eliminarMateria = (id: number) => {
    Alert.alert("Eliminar materia", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await MateriaData.delete(id);
            await cargarMaterias();
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "No se pudo eliminar");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const colorPorDificultad = (d?: string) => {
    const n = Number(d);
    if (!Number.isFinite(n)) return "#999";
    if (n <= 2) return "#4CAF50";
    if (n === 3) return "#FFC107";
    if (n >= 4) return "#F44336";
    return "#999";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Ionicons name="book" size={28} color="#1e90ff" />
          <Text style={styles.headerTitle}>Gestión de Materias</Text>
        </View>

        <TextInput
          placeholder="Nombre de la materia"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />
        <TextInput
          placeholder="Dificultad (1 - 5)"
          value={dificultad}
          onChangeText={setDificultad}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Notas (opcional)"
          value={notas}
          onChangeText={setNotas}
          multiline
          style={[styles.input, styles.inputMultiline]}
        />

        <TouchableOpacity
          onPress={agregarOEditarMateria}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <Ionicons
            name={editandoId !== null ? "save-outline" : "add-circle-outline"}
            size={22}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {editandoId !== null ? "GUARDAR CAMBIOS" : "AGREGAR MATERIA"}
          </Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={materias}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            refreshing={loading}
            onRefresh={cargarMaterias}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>📘 {item.Nombre}</Text>

                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => editarMateria(item)}>
                      <Ionicons name="create-outline" size={20} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => eliminarMateria(item.id)}
                      style={{ marginLeft: 12 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>

                {item.Dificultad ? (
                  <View style={styles.dificultadRow}>
                    <Ionicons
                      name="star"
                      size={16}
                      color={colorPorDificultad(item.Dificultad)}
                    />
                    <Text style={{ marginLeft: 6 }}>
                      Dificultad: {item.Dificultad}
                    </Text>
                  </View>
                ) : null}

                {item.Notas ? (
                  <Text style={styles.notasText}>📝 {item.Notas}</Text>
                ) : null}
              </View>
            )}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  scroll: { padding: 20, backgroundColor: "#F4F6F8" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginLeft: 10 },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputMultiline: { minHeight: 60, textAlignVertical: "top" },

  button: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between" },
  cardActions: { flexDirection: "row" },
  cardTitle: { fontSize: 16, fontWeight: "bold" },

  dificultadRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  notasText: { marginTop: 4, color: "#555" },
});
