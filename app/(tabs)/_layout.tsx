import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useNeuroState } from "@/context/NeuroStateContext";

export default function TabLayout() {
  const { state } = useNeuroState();

  const badgeColor =
    state.currentState === "LOW_LOAD"
      ? "#3B82F6"
      : state.currentState === "OVERLOAD"
        ? "#F97316"
        : "#22C55E";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.deepBlue,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrapper}>
              <IconSymbol size={26} name="house.fill" color={color} />
              <View
                style={[
                  styles.neuroDot,
                  { backgroundColor: badgeColor },
                ]}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          // Learning Theatre – core Transmutation hub
          title: "Learning Theatre",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="sparkles" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          // Activities & Quizzes – validation loop
          title: "Activities & Quizzes",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="rectangle.and.pencil.and.ellipsis"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          // My Brain Insights – research dashboard
          title: "My Brain Insights",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={26}
              name="person.crop.circle.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  neuroDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});

