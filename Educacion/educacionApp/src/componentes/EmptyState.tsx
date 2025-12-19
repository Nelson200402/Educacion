import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export default function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Ionicons name="calendar-outline" size={64} color="#999" />
      <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 12, color: "#111" }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ marginTop: 6, color: "#666", textAlign: "center" }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
