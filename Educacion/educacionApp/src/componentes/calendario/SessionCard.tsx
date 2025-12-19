import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SessionCard({
  title,
  subtitle,
  time,
  minutes,
  color = "#6c63ff",
  done = false,
  onPress,
  onToggleDone,
}: {
  title: string;
  subtitle: string;
  time: string;
  minutes: number;
  color?: string;
  done?: boolean;
  onPress?: () => void;
  onToggleDone?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,

        // ✅ barra izquierda por materia
        borderLeftWidth: 8,
        borderLeftColor: color,

        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* top row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "800" }}>
            {title}
          </Text>

          <Text style={{ color: "#666", marginTop: 2 }}>
            {subtitle}
          </Text>
        </View>

        {/* ✅ CHECK */}
        <TouchableOpacity
          onPress={onToggleDone}
          activeOpacity={0.8}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: done ? "#6c63ff" : "#F1F1FB",
            borderWidth: 1,
            borderColor: done ? "#6c63ff" : "#E5E5EF",
          }}
        >
          <Ionicons
            name={done ? "checkmark" : "ellipse-outline"}
            size={18}
            color={done ? "#fff" : "#6c63ff"}
          />
        </TouchableOpacity>
      </View>

      {/* time */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
        <Ionicons name="time-outline" size={14} color="#555" />
        <Text style={{ marginLeft: 6, fontWeight: "700", color: "#555" }}>
          {time} • {minutes} min
        </Text>

        {done ? (
          <View style={{ marginLeft: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="checkmark-circle" size={14} color="#6c63ff" />
            <Text style={{ color: "#6c63ff", fontWeight: "800", fontSize: 12 }}>
              Completada
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
