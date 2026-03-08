import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import DateTimePicker from "@react-native-community/datetimepicker";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

type Gender = "male" | "female" | "other";

export function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2010, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const selectGender = (selectedGender: Gender) => {
    setGender(selectedGender);
    setShowGenderPicker(false);
  };

  const onSubmit = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (!gender) {
      Alert.alert("Error", "Please select your gender");
      return;
    }

    try {
      setIsSubmitting(true);

      // Register with backend
      await register({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: formatDate(dateOfBirth),
        gender,
      });

      // Registration successful, navigate to home with tabs
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error?.message || "Registration failed. Please try again.";
      const fieldErrors = error?.errors as Record<string, string[]> | undefined;
      const details = fieldErrors
        ? Object.entries(fieldErrors)
            .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
            .join("\n")
        : "";
      Alert.alert("Registration Failed", details ? `${message}\n\n${details}` : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToSignIn = () => {
    router.replace("/auth/signin");
  };

  const genderOptions: { label: string; value: Gender }[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoBlock}>
            <View style={styles.logoCircle}>
              <Image
                source={require("@/assets/images/splash-icon.png")}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <Text style={styles.brand}>EduSense</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Sign up to continue your multisensory learning journey.
            </Text>
          </View>

          <View style={styles.form}>
            {/* First Name */}
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#9CA3AF"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            {/* Last Name */}
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#9CA3AF"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

            {/* Username */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Date of Birth */}
            <Pressable
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.inputContent}>
                <Text
                  style={[
                    styles.inputText,
                    dateOfBirth && styles.inputTextFilled,
                  ]}
                >
                  {dateOfBirth
                    ? formatDateDisplay(dateOfBirth)
                    : "Date of Birth"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              </View>
            </Pressable>

            {/* Gender */}
            <Pressable
              style={styles.input}
              onPress={() => setShowGenderPicker(true)}
            >
              <View style={styles.inputContent}>
                <Text
                  style={[styles.inputText, gender && styles.inputTextFilled]}
                >
                  {gender
                    ? genderOptions.find((g) => g.value === gender)?.label
                    : "Gender"}
                </Text>
                <Ionicons
                  name="chevron-down-outline"
                  size={20}
                  color="#9CA3AF"
                />
              </View>
            </Pressable>

            {/* Submit Button */}
            <Pressable
              style={[
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.light.background} />
              ) : (
                <Text style={styles.primaryText}>Sign up</Text>
              )}
            </Pressable>
          </View>

          <Pressable style={styles.linkRow} onPress={goToSignIn}>
            <Text style={styles.linkLabel}>Already have an account?</Text>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={24} color={Colors.light.text} />
                </Pressable>
              </View>
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1950, 0, 1)}
              />
              {Platform.OS === "ios" && (
                <Pressable
                  style={styles.modalButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </Pressable>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}

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
            <View style={styles.genderOptions}>
              {genderOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.genderOption,
                    gender === option.value && styles.genderOptionSelected,
                  ]}
                  onPress={() => selectGender(option.value)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      gender === option.value &&
                        styles.genderOptionTextSelected,
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
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 24,
  },
  logoBlock: {
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: `${Colors.deepBlue}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 44,
    height: 44,
  },
  brand: {
    ...Typography.bodyMedium,
    color: Colors.deepBlue,
  },
  header: {
    gap: 8,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  form: {
    gap: 14,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    ...Typography.body,
    color: "#9CA3AF",
  },
  inputTextFilled: {
    color: Colors.light.text,
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.deepBlue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  primaryText: {
    ...Typography.button,
    color: Colors.light.background,
    letterSpacing: 0.2,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  linkRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  linkLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  link: {
    ...Typography.label,
    color: Colors.deepBlue,
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
    maxHeight: "50%",
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
  modalButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: Colors.deepBlue,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    ...Typography.button,
    color: Colors.light.background,
  },
  // Gender Picker Styles
  genderOptions: {
    paddingVertical: 8,
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  genderOptionSelected: {
    backgroundColor: `${Colors.deepBlue}10`,
  },
  genderOptionText: {
    ...Typography.body,
    color: Colors.light.text,
  },
  genderOptionTextSelected: {
    color: Colors.deepBlue,
    fontFamily: "Inter_600SemiBold",
  },
});
