import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCognitiveTheme } from "@/hooks/use-cognitive-theme";

export default function TabLayout() {
  const { theme: cognitiveTheme } = useCognitiveTheme();

  const badgeColor = cognitiveTheme.brand.tabBadge;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cognitiveTheme.semantic.tabIconSelected,
        tabBarInactiveTintColor: cognitiveTheme.semantic.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: cognitiveTheme.semantic.background,
          borderTopColor: cognitiveTheme.semantic.border,
          borderTopWidth: 1,
          height: 64,
          shadowColor: cognitiveTheme.brand.primary,
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveBackgroundColor: `${cognitiveTheme.brand.primary}10`,
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
                  {
                    backgroundColor: badgeColor,
                    borderColor: cognitiveTheme.semantic.background,
                  },
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

