import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** ✅ parsea "YYYY-MM-DD" SIN timezone */
function parseISODateLocal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const WEEK = ["D", "L", "M", "X", "J", "V", "S"];

type Props = {
  selectedISO: string; // "2025-12-14"
  onSelect: (iso: string) => void;
};

export default function DayStrip({ selectedISO, onSelect }: Props) {
  const days = useMemo(() => {
    const selected = parseISODateLocal(selectedISO);
    const start = new Date(selected);
    start.setDate(selected.getDate() - 7);

    return Array.from({ length: 15 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedISO]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 10 }}
    >
      {days.map((d) => {
        const iso = toISODate(d);
        const active = iso === selectedISO;
        const dayNum = d.getDate();
        const weekDay = WEEK[d.getDay()];

        return (
          <TouchableOpacity
            key={iso}
            onPress={() => onSelect(iso)}
            style={{
              width: 54,
              paddingVertical: 10,
              borderRadius: 16,
              alignItems: "center",
              backgroundColor: active ? "#6c63ff" : "#ffffff",
              borderWidth: 1,
              borderColor: active ? "#6c63ff" : "#ececf3",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "800", color: active ? "#fff" : "#666" }}>
              {weekDay}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: active ? "#fff" : "#111" }}>
              {dayNum}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
