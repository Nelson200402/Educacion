import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalleSesionScreen() {
  const { title, desc, time, minutes, color } = useLocalSearchParams();
  const c = typeof color === "string" ? color : "#6c63ff";


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6FB" }} edges={["top"]}>
      <View style={{ padding: 20 }}>
        {/* Botón volver */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>

        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => {
            // por ahora solo UI:
            console.log("Editar sesión (pendiente backend)");
            // o Alert.alert("Pendiente", "Editar sesión aún no está conectado.");
            }}
            style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: "#6c63ff",
            alignItems: "center", justifyContent: "center",
            }}
        >
            <Ionicons name="pencil" size={18} color="#fff" />
        </TouchableOpacity>
            </View>

        {/* Card principal */}
        <View
        style={{
            height: 6,
            borderRadius: 999,
            backgroundColor: c,
            marginBottom: 12,
        }}
        />
        <View
          style={{
            
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "900" }}>
            {title}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={{ marginLeft: 6, fontWeight: "700" }}>
              {time} • {minutes} min
            </Text>
          </View>

          <Text style={{ marginTop: 16, color: "#444", lineHeight: 20 }}>
            {desc}
          </Text>

          {/* 👇 ESTO ES EL “PASO 4” */}
          <View
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#f3f3ff",
            }}
          >
            <Text style={{ fontWeight: "800" }}>Materia</Text>
            <Text style={{ marginTop: 4 }}>Pendiente backend</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: "800" }}>Estado</Text>
            <Text style={{ color: "#4CAF50", marginTop: 4 }}>
              Activa
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
