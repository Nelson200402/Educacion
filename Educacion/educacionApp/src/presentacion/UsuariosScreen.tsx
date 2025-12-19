import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { UsuarioData } from "../data/UsuarioData";
import type { Usuario } from "../entidades/Usuario";

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    UsuarioData.getAll()
      .then((data) => {
        console.log("USUARIOS:", data);
        setUsuarios(data);
      })
      .catch((e) => {
        console.log("ERROR API:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔵 LOADING
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10, color: "#000" }}>
          Cargando usuarios...
        </Text>
      </View>
    );
  }

  // 🔴 ERROR
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 16,
        }}
      >
        <Text style={{ color: "red", textAlign: "center" }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  // 🟢 OK
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 20, marginBottom: 10, color: "#000" }}>
        Lista de Usuarios
      </Text>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: "#000" }}>{item.Nombre}</Text>
            <Text style={{ color: "#555" }}>{item.Correo}</Text>
          </View>
        )}
      />
    </View>
  );
}
