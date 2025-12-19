import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;          // ej: "Diciembre 2025"
  onToday: () => void;    // volver a hoy
};

export default function CalendarHeader({ title, onToday }: Props) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 28, fontWeight: "900" }}>{title}</Text>

        <TouchableOpacity
          onPress={onToday}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "#f1f1f7",
          }}
        >
          <Ionicons name="today-outline" size={18} color="#333" />
          <Text style={{ fontWeight: "700" }}>Hoy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
