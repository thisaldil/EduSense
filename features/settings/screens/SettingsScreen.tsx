import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsScreen() {
  const { logout } = useAuth();
  const [visualMode, setVisualMode] = useState(true);
  const [audioMode, setAudioMode] = useState(true);
  const [hapticMode, setHapticMode] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [textSize, setTextSize] = useState<"Small" | "Medium" | "Large">(
    "Medium"
  );

  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [hapticIntensity, setHapticIntensity] = useState<1 | 2 | 3>(2);
  const [colorBlind, setColorBlind] = useState(false);

  const [offline, setOffline] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const onSignOut = async () => {
    try {
      await logout();
      router.replace("/welcome");
    } catch {
      // Ignore logout errors for now
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Learning Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Learning preferences</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Visual mode</Text>
            <Switch
              value={visualMode}
              onValueChange={setVisualMode}
              thumbColor={visualMode ? Colors.deepBlue : "#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Audio mode</Text>
            <Switch
              value={audioMode}
              onValueChange={setAudioMode}
              thumbColor={audioMode ? Colors.teal : "#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Haptic mode</Text>
            <Switch
              value={hapticMode}
              onValueChange={setHapticMode}
              thumbColor={hapticMode ? Colors.brightOrange : "#FFFFFF"}
            />
          </View>

          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.rowLabel}>Playback speed</Text>
              <Text style={styles.valueText}>{playbackSpeed.toFixed(1)}x</Text>
            </View>
            <View style={styles.chipRow}>
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <Pressable
                  key={speed}
                  style={[
                    styles.chip,
                    playbackSpeed === speed && styles.chipActive,
                  ]}
                  onPress={() => setPlaybackSpeed(speed)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      playbackSpeed === speed && styles.chipTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.rowLabel}>Text size</Text>
              <Text style={styles.valueText}>{textSize}</Text>
            </View>
            <View style={styles.chipRow}>
              {(["Small", "Medium", "Large"] as const).map((size) => (
                <Pressable
                  key={size}
                  style={[styles.chip, textSize === size && styles.chipActive]}
                  onPress={() => setTextSize(size)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      textSize === size && styles.chipTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accessibility</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>High contrast mode</Text>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              thumbColor={highContrast ? Colors.deepBlue : "#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Screen reader support</Text>
            <Switch
              value={screenReader}
              onValueChange={setScreenReader}
              thumbColor={screenReader ? Colors.deepBlue : "#FFFFFF"}
            />
          </View>
          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.rowLabel}>Haptic intensity</Text>
              <Text style={styles.valueText}>{hapticIntensity}</Text>
            </View>
            <View style={styles.chipRow}>
              {[1, 2, 3].map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.chip,
                    hapticIntensity === level && styles.chipActive,
                  ]}
                  onPress={() => setHapticIntensity(level as 1 | 2 | 3)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      hapticIntensity === level && styles.chipTextActive,
                    ]}
                  >
                    {level === 1 ? "Soft" : level === 2 ? "Medium" : "Strong"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Color blind friendly mode</Text>
            <Switch
              value={colorBlind}
              onValueChange={setColorBlind}
              thumbColor={colorBlind ? Colors.teal : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Content</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Download for offline</Text>
            <Switch
              value={offline}
              onValueChange={setOffline}
              thumbColor={offline ? Colors.deepBlue : "#FFFFFF"}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Auto-play next lesson</Text>
            <Switch
              value={autoPlay}
              onValueChange={setAutoPlay}
              thumbColor={autoPlay ? Colors.deepBlue : "#FFFFFF"}
            />
          </View>

          <Pressable style={styles.itemRow}>
            <Text style={styles.rowLabel}>Default subject filter</Text>
            <View style={styles.itemRight}>
              <Text style={styles.itemValue}>All subjects</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.light.textSecondary}
              />
            </View>
          </Pressable>
        </View>

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>

          <Pressable style={styles.itemRow}>
            <Text style={styles.rowLabel}>Notification preferences</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.itemRow}>
            <Text style={styles.rowLabel}>Privacy settings</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.itemRow}>
            <Text style={styles.rowLabel}>Storage management</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.itemRow}>
            <Text style={styles.rowLabel}>Help &amp; Support</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.itemRow}>
            <Text style={styles.rowLabel}>About</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.textSecondary}
            />
          </Pressable>

          <Pressable style={styles.signOutButton} onPress={onSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  profileCard: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    ...Typography.h2,
    color: Colors.light.background,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  profileSub: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  profileEdit: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profileEditText: {
    ...Typography.caption,
    color: Colors.deepBlue,
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: {
    ...Typography.body,
    color: Colors.light.text,
  },
  sliderBlock: {
    marginTop: 4,
    gap: 2,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  valueText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  chipActive: {
    backgroundColor: `${Colors.deepBlue}15`,
    borderColor: Colors.deepBlue,
  },
  chipText: {
    ...Typography.small,
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.deepBlue,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemValue: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  signOutButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  signOutText: {
    ...Typography.bodyMedium,
    color: Colors.deepBlue,
  },
});
