import React from "react";
import { View, Text } from "react-native";
import { useSensoryStore } from "@/store/sensoryStore";

const MAX_VISIBLE = 5;

export function SensoryDebugOverlay() {
  const lastCues = useSensoryStore((s) => s.lastCues);

  if (lastCues.length === 0) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "rgba(15,23,42,0.85)",
        maxWidth: 200,
      }}
      pointerEvents="none"
    >
      <Text style={{ color: "#E5E7EB", fontSize: 10, fontWeight: "700" }}>
        Sensory Debug
      </Text>
      {lastCues.slice(0, MAX_VISIBLE).map((cue, i) => (
        <View key={`${cue.id}-${cue.timeMs}`} style={{ marginTop: 4 }}>
          <Text style={{ color: "#A5B4FC", fontSize: 10 }}>
            {cue.type} · {Math.round(cue.timeMs)}ms
          </Text>
          <Text
            style={{ color: "#E5E7EB", fontSize: 9 }}
            numberOfLines={2}
          >
            {cue.patternOrText}
          </Text>
        </View>
      ))}
    </View>
  );
}

