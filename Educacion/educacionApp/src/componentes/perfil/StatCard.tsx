import { Text, View } from "react-native";

export default function StatCard({
  value,
  label,
  active = false,
}: {
  value: number;
  label: string;
  active?: boolean;
}) {
  return (
  <View style={{
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: active ? "#D9D3FF" : "#F2F2F7",
  }}>
    <Text style={{ fontSize: 22, fontWeight: "900" }}>{value}</Text>
    <Text style={{ color: "#777", marginTop: 4 }}>{label}</Text>
  </View>
  );
}
