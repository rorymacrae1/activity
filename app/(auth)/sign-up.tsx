import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import Head from "expo-router/head";
import { router, Link } from "expo-router";
import { colors, spacing, radius, typography as typo } from "@theme";
import { fontFamily } from "@theme/fonts";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { useAuthStore } from "@stores/auth";
import { useLayout } from "@hooks/useLayout";

/**
 * Sign up screen for new users.
 * Creates account with email/password or social login.
 */
export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, signInWithGoogle, signInWithApple } = useAuthStore();
  const { hPadding } = useLayout();

  const validateForm = (): string | null => {
    if (!email.trim()) return "Please enter your email.";
    if (!password.trim()) return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Invalid input", validationError);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(
      email.trim(),
      password,
      displayName.trim() || undefined,
    );
    setIsLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "We've sent you a confirmation link. Please verify your email to complete registration.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/sign-in") }],
      );
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      Alert.alert("Google sign up failed", error.message);
    } else {
      router.replace("/(main)");
    }
  };

  const handleAppleSignUp = async () => {
    setIsLoading(true);
    const { error } = await signInWithApple();
    setIsLoading(false);

    if (error) {
      Alert.alert("Apple sign up failed", error.message);
    } else {
      router.replace("/(main)");
    }
  };

  return (
    <ScreenContainer>
      <Head>
        <title>Sign Up | PisteWise</title>
        <meta
          name="description"
          content="Create an account to sync your ski preferences across devices."
        />
      </Head>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: hPadding },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="h1">Create Account</Text>
            <Text
              variant="body"
              color={colors.text.secondary}
              style={styles.subtitle}
            >
              Sign up to save your preferences and sync across devices.
            </Text>
          </View>

          {/* Sign Up Form */}
          <Card elevation="subtle" style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text variant="label" style={styles.inputLabel}>
                Display Name (optional)
              </Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="label" style={styles.inputLabel}>
                Email
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="label" style={styles.inputLabel}>
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordBtn}
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  accessibilityRole="button"
                >
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="label" style={styles.inputLabel}>
                Confirm Password
              </Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.text.tertiary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>

            <Button
              label={isLoading ? "Creating account..." : "Create Account"}
              onPress={handleSignUp}
              disabled={isLoading}
              fullWidth
            />
          </Card>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text
              variant="bodySmall"
              color={colors.text.tertiary}
              style={styles.dividerText}
            >
              or sign up with
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            {Platform.OS === "ios" && (
              <Button
                label="Sign up with Apple"
                variant="secondary"
                onPress={handleAppleSignUp}
                disabled={isLoading}
                fullWidth
              />
            )}
            <Button
              label="Sign up with Google"
              variant="secondary"
              onPress={handleGoogleSignUp}
              disabled={isLoading}
              fullWidth
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text variant="body" color={colors.text.secondary}>
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable accessibilityRole="link">
                <Text
                  variant="body"
                  color={colors.primary}
                  style={styles.linkText}
                >
                  Sign In
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Skip for now */}
          <Pressable
            onPress={() => router.back()}
            style={styles.skipButton}
            accessibilityLabel="Continue without signing up"
            accessibilityRole="button"
          >
            <Text variant="bodySmall" color={colors.text.tertiary}>
              Continue without an account
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  formCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typo.body.fontSize,
    fontFamily: fontFamily.regular,
    color: colors.text.primary,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: spacing.xxl + spacing.md,
  },
  showPasswordBtn: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  linkText: {
    fontFamily: fontFamily.medium,
  },
  skipButton: {
    alignItems: "center",
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
