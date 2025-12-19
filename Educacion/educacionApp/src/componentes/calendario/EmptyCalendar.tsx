import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export default function EmptyCalendar() {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: "#ececf3",
      }}
    >
      <Ionicons name="calendar-outline" size={22} color="#6c63ff" />
      <Text style={{ marginTop: 10, fontWeight: "900", fontSize: 16 }}>
        No hay sesiones registradas
      </Text>
      <Text style={{ marginTop: 6, color: "#666" }}>
        Selecciona otro día o crea una nueva sesión.
      </Text>
    </View>
  );
}
