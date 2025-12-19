import React from "react";
import { Text, View } from "react-native";
import SessionCard from "./SessionCard";

type Session = {
  id: number;
  title: string;
  subtitle: string;
  start: string;     // "HH:mm"
  duration: number;
  color?: string;
  done?: boolean;    // ✅ estado
};

const HOURS = Array.from({ length: 15 }).map((_, i) => i + 8); // 08 → 22

export default function TimelineDay({
  sessions,
  onSessionPress,
  onToggleDone,
}: {
  sessions: Session[];
  onSessionPress?: (s: Session) => void;
  onToggleDone?: (s: Session) => void;
}) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {HOURS.map((hour) => {
        const hourLabel = `${hour.toString().padStart(2, "0")}:00`;

        const sessionAtHour = sessions.filter(
          (s) => s.start.startsWith(hourLabel.slice(0, 2))
        );

        return (
          <View
            key={hour}
            style={{ flexDirection: "row", minHeight: 70, marginBottom: 6 }}
          >
            <View style={{ width: 60 }}>
              <Text style={{ fontWeight: "700", color: "#666" }}>
                {hourLabel}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                borderLeftWidth: 1,
                borderLeftColor: "#e5e5ef",
                paddingLeft: 12,
              }}
            >
              {sessionAtHour.map((s) => (
                <SessionCard
                  key={s.id}
                  title={s.title}
                  subtitle={s.subtitle}
                  time={s.start}
                  minutes={s.duration}
                  color={s.color}
                  done={!!s.done}
                  onPress={() => onSessionPress?.(s)}
                  onToggleDone={() => onToggleDone?.(s)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}
