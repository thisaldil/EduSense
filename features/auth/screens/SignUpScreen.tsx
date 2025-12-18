import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors, Typography } from "@/constants/theme";

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    // TODO: hook up to backend auth
    router.replace("/auth/signin");
  };

  const goToSignIn = () => {
    router.replace("/auth/signin");
  };

  const onGoogle = () => {
    // TODO: hook up Google OAuth
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.primaryButton} onPress={onSubmit}>
            <Text style={styles.primaryText}>Sign up</Text>
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

        <Pressable style={styles.linkRow} onPress={goToSignIn}>
          <Text style={styles.linkLabel}>Already have an account?</Text>
          <Text style={styles.link}>Sign in</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
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
    ...Typography.body,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
  linkRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  linkLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  link: {
    ...Typography.label,
    color: Colors.deepBlue,
  },
  googleButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleText: {
    ...Typography.button,
    color: Colors.light.text,
  },
});
