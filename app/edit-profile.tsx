import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { Image } from "expo-image";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { updateCurrentUser, UpdateUserRequest } from "@/services/user";
import { uploadAvatar } from "@/services/firebase-storage";

type Gender = "male" | "female" | "other" | "prefer_not_to_say";
type LearningStyle = "visual" | "auditory" | "kinesthetic" | "multisensory";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";
type AccessibilityNeed =
  | "visual_impairment"
  | "hearing_impairment"
  | "motor_skills"
  | "learning_disabilities"
  | "other";

const LEARNING_STYLES: { label: string; value: LearningStyle; icon: string }[] =
  [
    { label: "Visual", value: "visual", icon: "eye-outline" },
    { label: "Auditory", value: "auditory", icon: "headset-outline" },
    { label: "Kinesthetic", value: "kinesthetic", icon: "hand-right-outline" },
    { label: "Multisensory", value: "multisensory", icon: "sparkles-outline" },
  ];

const DIFFICULTY_LEVELS: { label: string; value: DifficultyLevel }[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const ACCESSIBILITY_NEEDS: { label: string; value: AccessibilityNeed }[] = [
  { label: "Visual Impairment", value: "visual_impairment" },
  { label: "Hearing Impairment", value: "hearing_impairment" },
  { label: "Motor Skills", value: "motor_skills" },
  { label: "Learning Disabilities", value: "learning_disabilities" },
  { label: "Other", value: "other" },
];

const SUBJECTS = [
  "Math",
  "Science",
  "English",
  "History",
  "Geography",
  "Art",
  "Music",
  "Physical Education",
  "Computer Science",
  "Foreign Language",
  "Social Studies",
  "Biology",
  "Chemistry",
  "Physics",
  "Literature",
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
];

const GENDERS: { label: string; value: Gender }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(
    null
  );
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] =
    useState<DifficultyLevel | null>(null);
  const [language, setLanguage] = useState("en");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [otherAccessibility, setOtherAccessibility] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showLearningStylePicker, setShowLearningStylePicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setGender((user.gender as Gender) || null);
      setAvatarUrl(user.avatar_url || "");
      setAvatarLocalUri(null); // Reset local URI when loading user data
      setLearningStyle((user.learning_style as LearningStyle) || null);
      setPreferredSubjects(user.preferred_subjects || []);
      setDifficultyLevel((user.difficulty_level as DifficultyLevel) || null);
      setLanguage(user.language || "en");
      setAccessibilityNeeds(user.accessibility_needs || []);
      setTimezone(user.timezone || "");
    }
  }, [user]);

  const handlePickAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // Note: MediaTypeOptions is deprecated but MediaType doesn't exist in v17.0.10
        // Using MediaTypeOptions until we can upgrade to a newer version
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        if (!user?.id) {
          Alert.alert("Error", "User not found. Please login again.");
          return;
        }

        const selectedImage = result.assets[0];
        setAvatarLocalUri(selectedImage.uri);

        // Upload image to Firebase Storage
        try {
          setIsUploadingAvatar(true);
          const downloadURL = await uploadAvatar(selectedImage.uri, user.id);
          setAvatarUrl(downloadURL);

          // Automatically save avatar_url to database
          try {
            const updatedUser = await updateCurrentUser({
              avatar_url: downloadURL,
            });
            // Update auth context with new user data
            updateUser(updatedUser);
            Alert.alert("Success", "Avatar uploaded and saved successfully");
          } catch (updateError: any) {
            console.error("Error saving avatar URL:", updateError);
            // Avatar uploaded but failed to save URL - show warning
            Alert.alert(
              "Warning",
              "Avatar uploaded but failed to save. Please try saving again."
            );
          }
        } catch (error: any) {
          console.error("Upload error:", error);
          Alert.alert(
            "Upload Failed",
            error.message || "Failed to upload image. Please try again."
          );
          // Keep local URI for preview even if upload fails
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.warn("Error picking avatar", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const toggleSubject = (subject: string) => {
    setPreferredSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const toggleAccessibilityNeed = (need: AccessibilityNeed) => {
    setAccessibilityNeeds((prev) => {
      const needStr = need;
      if (prev.includes(needStr)) {
        if (need === "other") {
          setOtherAccessibility("");
        }
        return prev.filter((n) => n !== needStr);
      } else {
        return [...prev, needStr];
      }
    });
  };

  const handleSave = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData: UpdateUserRequest = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender: gender || undefined,
        avatar_url: avatarUrl.trim() || null,
        learning_style: learningStyle || null,
        preferred_subjects:
          preferredSubjects.length > 0 ? preferredSubjects : null,
        difficulty_level: difficultyLevel || null,
        language: language,
        accessibility_needs:
          accessibilityNeeds.length > 0
            ? [
                ...accessibilityNeeds.filter((n) => n !== "other"),
                ...(accessibilityNeeds.includes("other") &&
                otherAccessibility.trim()
                  ? [otherAccessibility.trim()]
                  : []),
              ]
            : null,
        timezone: timezone.trim() || null,
      };

      // Update user profile
      const updatedUser = await updateCurrentUser(updateData);

      // Update auth context with new user data
      updateUser(updatedUser);

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to update profile. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.deepBlue} />
        </View>
      </SafeAreaView>
    );
  }

  const userInitial = (firstName || lastName || "U").charAt(0).toUpperCase();

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
              <Ionicons name="chevron-back" size={20} color={Colors.deepBlue} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Section 1: Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <Pressable
                onPress={handlePickAvatar}
                disabled={isUploadingAvatar}
                style={styles.avatarPressable}
              >
                <View style={styles.avatarWrapper}>
                  {isUploadingAvatar ? (
                    <View style={styles.avatarLoading}>
                      <ActivityIndicator size="large" color={Colors.deepBlue} />
                    </View>
                  ) : avatarLocalUri || avatarUrl ? (
                    <Image
                      source={{ uri: avatarLocalUri || avatarUrl }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{userInitial}</Text>
                    </View>
                  )}
                  <View style={styles.cameraButton}>
                    <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={handlePickAvatar}
                disabled={isUploadingAvatar}
              >
                <Text style={styles.changePhotoText}>
                  {isUploadingAvatar ? "Uploading..." : "Change photo"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, styles.inputText]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, styles.inputText]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowGenderPicker(true)}
              >
                <View style={styles.inputContent}>
                  <Text
                    style={[styles.inputText, gender && styles.inputTextFilled]}
                  >
                    {gender
                      ? GENDERS.find((g) => g.value === gender)?.label
                      : "Select gender"}
                  </Text>
                  <Ionicons
                    name="chevron-down-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.readOnlyText}>
                  {formatDate(user.date_of_birth)}
                </Text>
              </View>
              <Text style={styles.helperText}>Set during registration</Text>
            </View>
          </View>

          {/* Section 2: Learning Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Preferences</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Learning Style</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowLearningStylePicker(true)}
              >
                <View style={styles.inputContent}>
                  <Text
                    style={[
                      styles.inputText,
                      learningStyle && styles.inputTextFilled,
                    ]}
                  >
                    {learningStyle
                      ? LEARNING_STYLES.find((s) => s.value === learningStyle)
                          ?.label
                      : "Select learning style"}
                  </Text>
                  <Ionicons
                    name="chevron-down-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Difficulty Level</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowDifficultyPicker(true)}
              >
                <View style={styles.inputContent}>
                  <Text
                    style={[
                      styles.inputText,
                      difficultyLevel && styles.inputTextFilled,
                    ]}
                  >
                    {difficultyLevel
                      ? DIFFICULTY_LEVELS.find(
                          (d) => d.value === difficultyLevel
                        )?.label
                      : "Select difficulty level"}
                  </Text>
                  <Ionicons
                    name="chevron-down-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Preferred Subjects</Text>
              <View style={styles.chipsContainer}>
                {SUBJECTS.map((subject) => (
                  <Pressable
                    key={subject}
                    style={[
                      styles.chip,
                      preferredSubjects.includes(subject) &&
                        styles.chipSelected,
                    ]}
                    onPress={() => toggleSubject(subject)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        preferredSubjects.includes(subject) &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {subject}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Language</Text>
              <Pressable
                style={styles.input}
                onPress={() => setShowLanguagePicker(true)}
              >
                <View style={styles.inputContent}>
                  <Text
                    style={[
                      styles.inputText,
                      language && styles.inputTextFilled,
                    ]}
                  >
                    {LANGUAGES.find((l) => l.code === language)?.name ||
                      "English"}
                  </Text>
                  <Ionicons
                    name="chevron-down-outline"
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Section 3: Accessibility & Special Needs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Accessibility & Special Needs
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Accessibility Needs</Text>
              <View style={styles.checkboxContainer}>
                {ACCESSIBILITY_NEEDS.map((need) => (
                  <Pressable
                    key={need.value}
                    style={styles.checkboxRow}
                    onPress={() => toggleAccessibilityNeed(need.value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        accessibilityNeeds.includes(need.value) &&
                          styles.checkboxChecked,
                      ]}
                    >
                      {accessibilityNeeds.includes(need.value) && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={Colors.deepBlue}
                        />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{need.label}</Text>
                  </Pressable>
                ))}
              </View>
              {accessibilityNeeds.includes("other") && (
                <TextInput
                  style={[styles.input, styles.inputText, styles.marginTop]}
                  value={otherAccessibility}
                  onChangeText={setOtherAccessibility}
                  placeholder="Please specify"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              )}
            </View>
          </View>

          {/* Section 4: Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <View style={styles.readOnlyRow}>
                  <Text style={styles.readOnlyText}>{user.email}</Text>
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                </View>
              </View>
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <View style={styles.readOnlyRow}>
                  <Text style={styles.readOnlyText}>{user.username}</Text>
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                </View>
              </View>
              <Text style={styles.helperText}>Username cannot be changed</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Timezone</Text>
              <TextInput
                style={[styles.input, styles.inputText]}
                value={timezone}
                onChangeText={setTimezone}
                placeholder="e.g., UTC-5, America/New_York"
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Section 5: Safety & Compliance (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety & Compliance</Text>

            <View style={styles.readOnlyGroup}>
              <Text style={styles.readOnlyLabel}>Parental Consent</Text>
              <Text style={styles.readOnlyValue}>
                {user.parental_consent ? "✓ Given" : "✗ Not given"}
              </Text>
            </View>

            {user.consent_date && (
              <View style={styles.readOnlyGroup}>
                <Text style={styles.readOnlyLabel}>Consent Date</Text>
                <Text style={styles.readOnlyValue}>
                  {formatDate(user.consent_date)}
                </Text>
              </View>
            )}

            <View style={styles.readOnlyGroup}>
              <Text style={styles.readOnlyLabel}>Email Verified</Text>
              <Text style={styles.readOnlyValue}>
                {user.email_verified ? "✓ Verified" : "✗ Not verified"}
              </Text>
            </View>
          </View>

          {/* Section 6: System Information (Read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.readOnlyGroup}>
              <Text style={styles.readOnlyLabel}>Account Created</Text>
              <Text style={styles.readOnlyValue}>
                {formatDateTime(user.created_at)}
              </Text>
            </View>

            <View style={styles.readOnlyGroup}>
              <Text style={styles.readOnlyLabel}>Last Login</Text>
              <Text style={styles.readOnlyValue}>
                {formatDateTime(user.last_login || "")}
              </Text>
            </View>

            <View style={styles.readOnlyGroup}>
              <Text style={styles.readOnlyLabel}>Account Status</Text>
              <Text style={styles.readOnlyValue}>
                {user.is_active ? "✓ Active" : "✗ Inactive"}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showGenderPicker}
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <Pressable
                onPress={() => setShowGenderPicker(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>
            <View style={styles.modalOptions}>
              {GENDERS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    gender === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setGender(option.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      gender === option.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {gender === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.deepBlue}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Learning Style Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showLearningStylePicker}
        onRequestClose={() => setShowLearningStylePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLearningStylePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Learning Style</Text>
              <Pressable
                onPress={() => setShowLearningStylePicker(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>
            <View style={styles.modalOptions}>
              {LEARNING_STYLES.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    learningStyle === option.value &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setLearningStyle(option.value);
                    setShowLearningStylePicker(false);
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      learningStyle === option.value
                        ? Colors.deepBlue
                        : Colors.light.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      learningStyle === option.value &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {learningStyle === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.deepBlue}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Difficulty Level Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showDifficultyPicker}
        onRequestClose={() => setShowDifficultyPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDifficultyPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Difficulty Level</Text>
              <Pressable
                onPress={() => setShowDifficultyPicker(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>
            <View style={styles.modalOptions}>
              {DIFFICULTY_LEVELS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    difficultyLevel === option.value &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setDifficultyLevel(option.value);
                    setShowDifficultyPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      difficultyLevel === option.value &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {difficultyLevel === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.deepBlue}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Language Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showLanguagePicker}
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguagePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <Pressable
                onPress={() => setShowLanguagePicker(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {LANGUAGES.map((option) => (
                <Pressable
                  key={option.code}
                  style={[
                    styles.modalOption,
                    language === option.code && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setLanguage(option.code);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      language === option.code &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                  {language === option.code && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.deepBlue}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  section: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    gap: 16,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 8,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  avatarPressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarInitial: {
    ...Typography.h2,
    color: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.light.background,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  changePhotoText: {
    ...Typography.caption,
    color: Colors.deepBlue,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    ...Typography.label,
    color: Colors.light.text,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    ...Typography.body,
    color: Colors.light.text,
  },
  inputTextFilled: {
    color: Colors.light.text,
  },
  inputDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readOnlyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  helperText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  chipSelected: {
    backgroundColor: Colors.deepBlue,
    borderColor: Colors.deepBlue,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.light.text,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.deepBlue,
    borderColor: Colors.deepBlue,
  },
  checkboxLabel: {
    ...Typography.body,
    color: Colors.light.text,
    flex: 1,
  },
  marginTop: {
    marginTop: 8,
  },
  readOnlyGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  readOnlyLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  readOnlyValue: {
    ...Typography.body,
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.deepBlue,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.light.text,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOptions: {
    paddingVertical: 8,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 12,
  },
  modalOptionSelected: {
    backgroundColor: `${Colors.deepBlue}10`,
  },
  modalOptionText: {
    ...Typography.body,
    color: Colors.light.text,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },
});
