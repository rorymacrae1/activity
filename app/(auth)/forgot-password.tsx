import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Head from "expo-router/head";
import { Link } from "expo-router";
import { colors, spacing, radius, typography as typo } from "@theme";
import { fontFamily } from "@theme/fonts";
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
        style={styles.keyboardView}
      >
        <View
          style={[
            isDesktop ? styles.desktopForm : styles.scrollContent,
            isDesktop ? {} : { paddingHorizontal: hPadding },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="h1">{sent ? t.sentTitle : t.title}</Text>
            <Text
              variant="body"
              color={colors.ink.normal}
              style={styles.subtitle}
            >
              {sent ? t.sentSubtitle.replace("{email}", email) : t.subtitle}
            </Text>
          </View>

          {!sent ? (
            <Card elevation="subtle" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text variant="label" style={styles.inputLabel}>
                  {t.email}
                </Text>
                <TextInput
                  style={styles.input}
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
            <Card elevation="subtle" style={styles.successCard}>
              <Icon name="mail" size={32} color={colors.brand.primary} />
              <Text
                variant="bodySmall"
                color={colors.ink.normal}
                align="center"
              >
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
          <View style={styles.footer}>
            <Text variant="body" color={colors.ink.normal}>
              {t.backToSignIn}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text
                variant="body"
                color={colors.brand.primary}
                style={styles.linkText}
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
    color: colors.ink.rich,
  },
  successCard: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    flexWrap: "wrap",
  },
  linkText: {
    fontFamily: fontFamily.medium,
  },
  desktopForm: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
});
