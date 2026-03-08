import React from "react";
import { View, Text, Switch } from "react-native";
import { useSensoryStore } from "@/store/sensoryStore";

export function SensoryToggle() {
  const {
    hapticsEnabled,
    audioEnabled,
    setHapticsEnabled,
    setAudioEnabled,
  } = useSensoryStore();

  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: 12 }}>Haptics</Text>
        <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: 12 }}>Audio</Text>
        <Switch value={audioEnabled} onValueChange={setAudioEnabled} />
      </View>
    </View>
  );
}

