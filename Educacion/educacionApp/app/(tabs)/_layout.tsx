import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        // ✅ Colores como tu ejemplo
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)",

        // ✅ Esto evita que se sobreponga con Atrás/Home/Recientes
        tabBarStyle: {
          backgroundColor: "#6c63ff",
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 56 + Math.max(insets.bottom, 8),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size ?? 28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="materias"
        options={{
          title: "Materias",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size ?? 28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
