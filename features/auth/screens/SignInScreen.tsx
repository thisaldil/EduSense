import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const onSubmit = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Login with backend
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Login successful, navigate to home with tabs
      router.replace("/(tabs)");
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please check your credentials.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToSignUp = () => {
    router.replace("/auth/signup");
  };

  const togglePassword = () => setShowPassword((p) => !p);
  const onGoogle = () => {
    // TODO: hook up Google OAuth
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>We’re glad you’re here.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={togglePassword} hitSlop={10}>
              <Text style={styles.inputIcon}>{showPassword ? "🙈" : "👁️"}</Text>
            </Pressable>
          </View>

          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

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
              <Text style={styles.primaryText}>Sign in</Text>
            )}
          </Pressable>

          <Pressable style={styles.googleButton} onPress={onGoogle}>
            <Image
              source={{
                uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
              }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>
        </View>

        <Pressable style={styles.linkRow} onPress={goToSignUp}>
          <Text style={styles.linkLabel}>Don’t have an account?</Text>
          <Text style={styles.link}>Sign Up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 22,
    paddingVertical: 32,
    gap: 18,
  },
  logoBlock: {
    alignItems: "center",
    marginBottom: 4,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: `${Colors.teal}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 44,
    height: 44,
  },
  header: {
    gap: 6,
    alignItems: "center",
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
    marginTop: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputIcon: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.light.text,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    ...Typography.caption,
    color: Colors.deepBlue,
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    backgroundColor: Colors.deepBlue,
    alignSelf: "stretch",
  },
  primaryText: {
    ...Typography.button,
    color: Colors.light.background,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
    alignSelf: "stretch",
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleText: {
    ...Typography.button,
    color: Colors.light.text,
  },
  linkRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  linkLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  link: {
    ...Typography.label,
    color: Colors.deepBlue,
  },
});
