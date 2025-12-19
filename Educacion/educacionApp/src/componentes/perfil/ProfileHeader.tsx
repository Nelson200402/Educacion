import type { Usuario } from "@/src/entidades/Usuario";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  user: Usuario;
  onEdit: () => void;
};

export default function ProfileHeader({ user, onEdit }: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      {/* Botón editar (icono lápiz) */}
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity
          onPress={onEdit}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#6C63FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Avatar + Nombre */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#F2F2F7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons name="person" size={48} color="#666" />
        </View>

        <Text style={{ fontSize: 22, fontWeight: "800" }}>{user.Nombre}</Text>
        <Text style={{ color: "#888", marginTop: 2 }}>{user.Correo}</Text>
      </View>
    </View>
  );
}
