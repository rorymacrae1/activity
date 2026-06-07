import { useState } from "react";
import {
  View,
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

const inputStyle = {
  backgroundColor: colors.surface.elevated,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border.default,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: typo.body.fontSize,
  fontFamily: fontFamily.regular,
  color: colors.ink.rich,
} as const;
import { Text } from "@components/ui/Text";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { useToast } from "@components/ui/Toast";
import { useAuthStore } from "@stores/auth";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";

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
  const { hPadding, isDesktop } = useLayout();
  const { showToast } = useToast();
  const t = useContent().auth.signUp;
  const tAuth = useContent().auth;

  const validateForm = (): string | null => {
    if (!email.trim()) return t.validationEmail;
    if (!password.trim()) return t.validationPassword;
    if (password.length < 6) return t.validationPasswordLength;
    if (password !== confirmPassword) return t.validationPasswordMatch;
    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateForm();
    if (validationError) {
      showToast({ type: "error", message: validationError });
      return;
    }

    setIsLoading(true);
    const { error, session } = await signUp(
      email.trim(),
      password,
      displayName.trim() || undefined,
    );
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else if (session) {
      // User is signed in immediately (email confirmation disabled)
      showToast({
        type: "success",
        message: t.successMessage,
        duration: 4000,
      });
      router.replace("/(onboarding)/trip-type");
    } else {
      // Email confirmation required
      showToast({
        type: "info",
        message: t.confirmEmail,
        duration: 5000,
      });
      router.replace("/(auth)/sign-in");
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else {
      showToast({
        type: "success",
        message: t.successMessage,
        duration: 4000,
      });
      router.replace("/(onboarding)/trip-type");
    }
  };

  const handleAppleSignUp = async () => {
    setIsLoading(true);
    const { error } = await signInWithApple();
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else {
      showToast({
        type: "success",
        message: t.successMessage,
        duration: 4000,
      });
      router.replace("/(onboarding)/trip-type");
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
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: spacing.xxl, paddingBottom: spacing.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              isDesktop
                ? { maxWidth: 480, alignSelf: "center" as const, width: "100%", paddingHorizontal: spacing.xl }
                : { paddingHorizontal: hPadding }
            }
          >
            {/* Header */}
            <View className="mb-6">
              <Text variant="h1">{t.title}</Text>
              <Text variant="body" color={colors.ink.normal} className="mt-2">
                {t.subtitle}
              </Text>
            </View>

            {/* Sign Up Form */}
            <Card elevation="subtle" style={{ padding: spacing.lg, gap: spacing.md }}>
              <View className="gap-1">
                <Text variant="label" className="ml-1">{t.displayName}</Text>
                <TextInput
                  style={inputStyle}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor={colors.ink.muted}
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!isLoading}
                />
              </View>

              <View className="gap-1">
                <Text variant="label" className="ml-1">{t.email}</Text>
                <TextInput
                  style={inputStyle}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.ink.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <View className="gap-1">
                <Text variant="label" className="ml-1">{t.password}</Text>
                <View className="relative">
                  <TextInput
                    style={[inputStyle, { paddingRight: spacing.xxl + spacing.md }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t.placeholder}
                    placeholderTextColor={colors.ink.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-0 bottom-0 justify-center"
                    accessibilityLabel={
                      showPassword ? tAuth.hidePassword : tAuth.showPassword
                    }
                    accessibilityRole="button"
                  >
                    <Text variant="bodySmall" color={colors.ink.normal}>
                      {showPassword ? tAuth.hidePassword : tAuth.showPassword}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="gap-1">
                <Text variant="label" className="ml-1">{t.confirmPassword}</Text>
                <TextInput
                  style={inputStyle}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.ink.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  editable={!isLoading}
                />
              </View>

              <Button
                label={isLoading ? t.submitting : t.submit}
                onPress={handleSignUp}
                disabled={isLoading}
                fullWidth
              />
            </Card>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1" style={{ height: 1, backgroundColor: colors.border.default }} />
              <Text variant="bodySmall" color={colors.ink.muted} className="mx-4">
                {t.or}
              </Text>
              <View className="flex-1" style={{ height: 1, backgroundColor: colors.border.default }} />
            </View>

            {/* Social Login */}
            <View className="gap-2">
              {Platform.OS === "ios" && (
                <Button
                  label={t.apple}
                  variant="secondary"
                  onPress={handleAppleSignUp}
                  disabled={isLoading}
                  fullWidth
                />
              )}
              <Button
                label={t.google}
                variant="secondary"
                onPress={handleGoogleSignUp}
                disabled={isLoading}
                fullWidth
              />
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-6">
              <Text variant="body" color={colors.ink.normal}>
                {t.hasAccount}{" "}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable accessibilityRole="link">
                  <Text
                    variant="body"
                    color={colors.brand.primary}
                    style={{ fontFamily: fontFamily.medium }}
                  >
                    {t.signInLink}
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Skip for now */}
            <Pressable
              onPress={() => router.back()}
              className="items-center mt-5 py-2"
              accessibilityLabel="Continue without signing up"
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color={colors.ink.muted}>
                Continue without an account
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
