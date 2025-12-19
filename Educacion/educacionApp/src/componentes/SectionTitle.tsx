import React from "react";
import { Text } from "react-native";

export default function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 20, fontWeight: "700", color: "black", marginBottom: 10 }}>
      {title}
    </Text>
  );
}
