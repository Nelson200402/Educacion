import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ProfileOption({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 16,
      backgroundColor: "#fff",
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    }}>
    <Ionicons name={icon} size={22} color="#777" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontWeight: "600" }}>{title}</Text>
        {subtitle && (
          <Text style={{ color: "#888", fontSize: 13 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
    </View>
  );
}
