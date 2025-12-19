import type { Usuario } from "@/src/entidades/Usuario";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
      <Ionicons name={icon} size={18} color="#555" />
      <Text style={{ marginLeft: 8, color: "#555", width: 120 }}>{label}:</Text>
      <Text style={{ color: "#111", fontWeight: "600", flex: 1 }}>{value}</Text>
    </View>
  );
}

export default function ProfileCard({ user }: { user: Usuario }) {
  return (
    <View
      style={{
        backgroundColor: "#f6f6f6",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#eee",
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#111" }}>
        {user.Nombre}
      </Text>
      <Text style={{ color: "#666", marginTop: 4 }}>{user.Correo}</Text>

      <View style={{ marginTop: 12 }}>
        <Row icon="school-outline" label="Nivel" value={user.nivel_estudios} />
        <Row
          icon="time-outline"
          label="Periodo"
          value={user.periodo_prefencia}
        />
        <Row
          icon={user.disponibilidad ? "checkmark-circle-outline" : "close-circle-outline"}
          label="Disponible"
          value={user.disponibilidad ? "Sí" : "No"}
        />
        <Row icon="calendar-outline" label="Días libres" value={user.Dias_Libres} />
      </View>
    </View>
  );
}
