import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import Head from "expo-router/head";
import { router, Link } from "expo-router";
import { colors, spacing, radius, typography as typo } from "@theme";
import { fontFamily } from "@theme/fonts";
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { useToast } from "@components/ui/Toast";
import { useAuthStore } from "@stores/auth";
import { useLayout } from "@hooks/useLayout";

/**
 * Sign in screen for existing users.
 * Supports email/password and social login.
 */
export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signInWithGoogle, signInWithApple } = useAuthStore();
  const { hPadding } = useLayout();
  const { showToast } = useToast();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      showToast({
        type: "error",
        message: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else {
      // Navigate to main app
      showToast({
        type: "success",
        message: "Welcome back!",
        duration: 3000,
      });
      router.replace("/(main)");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else {
      showToast({
        type: "success",
        message: "Welcome back!",
        duration: 3000,
      });
      router.replace("/(main)");
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithApple();
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else {
      showToast({
        type: "success",
        message: "Welcome back!",
        duration: 3000,
      });
      router.replace("/(main)");
    }
  };

  return (
    <ScreenContainer>
      <Head>
        <title>Sign In | PisteWise</title>
        <meta
          name="description"
          content="Sign in to sync your ski preferences across devices."
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
            <Text variant="h1">Welcome Back</Text>
            <Text
              variant="body"
              color={colors.text.secondary}
              style={styles.subtitle}
            >
              Sign in to sync your preferences and favorites across devices.
            </Text>
          </View>

          {/* Sign In Form */}
          <Card elevation="subtle" style={styles.formCard}>
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
              <View style={styles.passwordLabelRow}>
                <Text variant="label" style={styles.inputLabel}>
                  Password
                </Text>
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable accessibilityRole="link">
                    <Text variant="bodySmall" color={colors.primary}>
                      Forgot password?
                    </Text>
                  </Pressable>
                </Link>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
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

            <Button
              label={isLoading ? "Signing in..." : "Sign In"}
              onPress={handleSignIn}
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
              or continue with
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            {Platform.OS === "ios" && (
              <Button
                label="Continue with Apple"
                variant="secondary"
                onPress={handleAppleSignIn}
                disabled={isLoading}
                fullWidth
              />
            )}
            <Button
              label="Continue with Google"
              variant="secondary"
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              fullWidth
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text variant="body" color={colors.text.secondary}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable accessibilityRole="link">
                <Text
                  variant="body"
                  color={colors.primary}
                  style={styles.linkText}
                >
                  Sign Up
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Skip for now */}
          <Pressable
            onPress={() => router.back()}
            style={styles.skipButton}
            accessibilityLabel="Continue without signing in"
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
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
