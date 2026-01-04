import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

const achievements = [
  { id: "a1", label: "First Lesson", color: "#FEF3C7" },
  { id: "a2", label: "5-Day Streak", color: "#DBEAFE" },
  { id: "a3", label: "Sensory Explorer", color: "#E0F2FE" },
];

const favoriteSubjects = ["Science", "Maths", "Music", "Art"];

const recentActivity = [
  { id: "r1", title: "Forces & Motion", time: "Today · 15 min" },
  { id: "r2", title: "Sound Waves & Hearing", time: "Yesterday · 20 min" },
  { id: "r3", title: "Color & Perception", time: "2 days ago · 10 min" },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const userName = user?.first_name || user?.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    // TODO: clear auth state and redirect to sign in
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
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/settings")}
            hitSlop={10}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.deepBlue}
            />
          </Pressable>
        </View>

        {/* Cover + Avatar */}
        <View style={styles.cover} />
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            )}
          </View>
        </View>

        {/* Name & Bio */}
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.bio}>Grade 6 · Sensory learner</Text>
          <Pressable
            style={styles.editButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.deepBlue} />
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6.5</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRow}
          >
            {achievements.map((badge) => (
              <View
                key={badge.id}
                style={[styles.badge, { backgroundColor: badge.color }]}
              >
                <Ionicons
                  name="ribbon-outline"
                  size={18}
                  color={Colors.deepBlue}
                />
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Favorite Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite subjects</Text>
          </View>
          <View style={styles.tagRow}>
            {favoriteSubjects.map((subject) => (
              <View key={subject} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name="play-circle"
                    size={20}
                    color={Colors.deepBlue}
                  />
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <Pressable style={styles.signOutRow} onPress={handleSignOut}>
          <Ionicons
            name="log-out-outline"
            size={18}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cover: {
    marginTop: 8,
    height: 110,
    borderRadius: 18,
    backgroundColor: Colors.deepBlue,
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: -34,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.backgroundSecondary,
    overflow: "hidden",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarInitial: {
    ...Typography.h2,
    color: Colors.deepBlue,
  },
  nameBlock: {
    alignItems: "center",
    gap: 4,
  },
  name: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  bio: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  editButton: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editText: {
    ...Typography.caption,
    color: Colors.deepBlue,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  badgeRow: {
    gap: 10,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.light.text,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tagText: {
    ...Typography.small,
    color: Colors.light.text,
  },
  activityList: {
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text,
  },
  activityTime: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  signOutRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
  },
  signOutText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});
