import React from "react";
import { Pressable, Text, View } from "react-native";
import type { SesionEstudio } from "../entidades/SesionEstudio";

export default function SesionCard({
  sesion,
  onPress,
}: {
  sesion: SesionEstudio;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 12,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "black", fontWeight: "700" }}>{sesion.Nombre}</Text>
        <Text style={{ color: "#666" }}>{sesion.duracion} min</Text>
      </View>

      <Text style={{ color: "#444", marginTop: 6 }} numberOfLines={2}>
        {sesion.descripcion}
      </Text>
    </Pressable>
  );
}
