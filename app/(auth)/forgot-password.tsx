import { useState } from "react";
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Head from "expo-router/head";
import { Link } from "expo-router";
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
import { Icon } from "@components/ui/Icon";
import { ScreenContainer } from "@components/ui/ScreenContainer";
import { useToast } from "@components/ui/Toast";
import { useAuthStore } from "@stores/auth";
import { useLayout } from "@hooks/useLayout";
import { useContent } from "@hooks/useContent";

/**
 * Forgot password screen.
 * Sends a password reset email via Supabase.
 */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuthStore();
  const { hPadding, isDesktop } = useLayout();
  const { showToast } = useToast();
  const t = useContent().auth.forgotPassword;

  const handleSubmit = async () => {
    if (!email.trim()) {
      showToast({ type: "error", message: t.validationEmpty });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email.trim());
    setIsLoading(false);

    if (error) {
      showToast({ type: "error", message: error.message });
    } else {
      setSent(true);
    }
  };

  return (
    <ScreenContainer>
      <Head>
        <title>Reset Password | PisteWise</title>
      </Head>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          style={
            isDesktop
              ? { maxWidth: 480, alignSelf: "center" as const, width: "100%", paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl }
              : { flexGrow: 1, paddingTop: spacing.xxl, paddingBottom: spacing.xxl, paddingHorizontal: hPadding }
          }
        >
          {/* Header */}
          <View className="mb-6">
            <Text variant="h1">{sent ? t.sentTitle : t.title}</Text>
            <Text variant="body" color={colors.ink.normal} className="mt-2">
              {sent ? t.sentSubtitle.replace("{email}", email) : t.subtitle}
            </Text>
          </View>

          {!sent ? (
            <Card elevation="subtle" style={{ padding: spacing.lg, gap: spacing.md }}>
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
                  accessibilityLabel="Email address"
                />
              </View>

              <Button
                label={isLoading ? t.submitting : t.submit}
                onPress={handleSubmit}
                disabled={isLoading}
                fullWidth
              />
            </Card>
          ) : (
            <Card elevation="subtle" style={{ padding: spacing.xl, alignItems: "center", gap: spacing.sm }}>
              <Icon name="mail" size={32} color={colors.brand.primary} />
              <Text variant="bodySmall" color={colors.ink.normal} align="center">
                Didn't receive it? Check your spam folder, or{" "}
              </Text>
              <Button
                label="Resend email"
                variant="ghost"
                size="compact"
                onPress={() => setSent(false)}
              />
            </Card>
          )}

          {/* Back to sign in */}
          <View className="flex-row justify-center flex-wrap mt-6">
            <Text variant="body" color={colors.ink.normal}>
              {t.backToSignIn}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text
                variant="body"
                color={colors.brand.primary}
                style={{ fontFamily: fontFamily.medium }}
              >
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
