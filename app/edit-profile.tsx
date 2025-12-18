import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";

import { Colors, Typography } from "@/constants/theme";

export default function EditProfileScreen() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState("Student");
  const [grade, setGrade] = useState("Grade 6");
  const [bio, setBio] = useState("Sensory learner");

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        // Permission denied – you could show a toast/snackbar here
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      // Silent fail for now – could log to monitoring
      console.warn("Error picking avatar", error);
    }
  };

  const handleSave = () => {
    // TODO: Persist profile changes to backend or local storage
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable
              style={styles.iconButton}
              onPress={handleCancel}
              hitSlop={10}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={Colors.deepBlue}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Edit profile</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {name ? name[0]?.toUpperCase() : "S"}
                  </Text>
                </View>
              )}
              <Pressable
                style={styles.cameraButton}
                onPress={handlePickAvatar}
                hitSlop={10}
              >
                <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Pressable onPress={handlePickAvatar}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Grade</Text>
              <TextInput
                style={styles.input}
                value={grade}
                onChangeText={setGrade}
                placeholder="e.g. Grade 6"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us a bit about how you like to learn"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.helperText}>
                This helps personalize lessons for your learning style.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryButton} onPress={handleCancel}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Save changes</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  headerRightSpacer: {
    width: 36,
    height: 36,
  },
  avatarSection: {
    alignItems: "center",
    gap: 8,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.backgroundSecondary,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarInitial: {
    ...Typography.h2,
    color: Colors.deepBlue,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.light.backgroundSecondary,
  },
  changePhotoText: {
    ...Typography.caption,
    color: Colors.deepBlue,
  },
  formSection: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    ...Typography.label,
    color: Colors.light.text,
  },
  input: {
    ...Typography.body,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  helperText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.light.textSecondary,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.deepBlue,
  },
  primaryButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});


