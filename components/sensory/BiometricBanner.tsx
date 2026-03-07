import React from "react";
import { View, Text } from "react-native";
import { useSensoryStore } from "@/store/sensoryStore";

export function BiometricBanner() {
  const cognitiveState = useSensoryStore((s) => s.cognitiveState);

  const label =
    cognitiveState === "OVERLOAD"
      ? "Overloaded"
      : cognitiveState === "LOW_LOAD"
        ? "Focused / Underloaded"
        : cognitiveState === "OPTIMAL"
          ? "Optimal"
          : cognitiveState || "Neutral";

  const color =
    cognitiveState === "OVERLOAD"
      ? "#DC2626"
      : cognitiveState === "LOW_LOAD"
        ? "#2563EB"
        : cognitiveState === "OPTIMAL"
          ? "#16A34A"
          : "#6B7280";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 6,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

