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
 * Sign in screen for existing users.
 * Supports email/password and social login.
 */
export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signInWithGoogle, signInWithApple } = useAuthStore();
  const { hPadding, isDesktop } = useLayout();
  const { showToast } = useToast();
  const t = useContent().auth.signIn;
  const tAuth = useContent().auth;

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      showToast({
        type: "error",
        message: t.validationEmpty,
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
        message: t.welcomeBack,
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
        message: t.welcomeBack,
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
        message: t.welcomeBack,
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

            {/* Sign In Form */}
            <Card elevation="subtle" style={{ padding: spacing.lg, gap: spacing.md }}>
              <View className="gap-1">
                <Text variant="label" className="ml-1">
                  {t.email}
                </Text>
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
                <View className="flex-row justify-between items-center ml-1">
                  <Text variant="label">
                    {t.password}
                  </Text>
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable accessibilityRole="link">
                      <Text variant="bodySmall" color={colors.brand.primary}>
                        {t.forgotPassword}
                      </Text>
                    </Pressable>
                  </Link>
                </View>
                <View className="relative">
                  <TextInput
                    style={[inputStyle, { paddingRight: spacing.xxl + spacing.md }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.ink.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
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

              <Button
                label={isLoading ? t.submitting : t.submit}
                onPress={handleSignIn}
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
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                  fullWidth
                />
              )}
              <Button
                label={t.google}
                variant="secondary"
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                fullWidth
              />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-6">
              <Text variant="body" color={colors.ink.normal}>
                {t.noAccount}{" "}
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable accessibilityRole="link">
                  <Text
                    variant="body"
                    color={colors.brand.primary}
                    style={{ fontFamily: fontFamily.medium }}
                  >
                    {t.signUpLink}
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Skip for now */}
            <Pressable
              onPress={() => router.back()}
              className="items-center mt-5 py-2"
              accessibilityLabel="Continue without signing in"
              accessibilityRole="button"
            >
              <Text variant="bodySmall" color={colors.ink.muted}>
                {t.skip}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
