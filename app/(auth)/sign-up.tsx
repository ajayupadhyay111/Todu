import { useSignUp } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { useTheme } from '@/hooks/use-theme';

export default function SignUpScreen() {
  const theme = useTheme();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerify, setPendingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 8 && !submitting;

  const onSignUp = async () => {
    if (!isLoaded || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerify(true);
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!isLoaded || code.trim().length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
      } else {
        setError('Verification incomplete. Try the code again.');
      }
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={[styles.brand, { color: theme.primary }]}>Todu</Text>

          {pendingVerify ? (
            <>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Verify email</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Enter the code we sent to {email.trim()}.
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Verification code"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
              <Pressable
                onPress={onVerify}
                disabled={submitting}
                style={[styles.button, { backgroundColor: theme.primary, opacity: submitting ? 0.5 : 1 }]}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Create account</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Capture tasks in seconds.
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Password (min 8 chars)"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
              <Pressable
                onPress={onSignUp}
                disabled={!canSubmit}
                style={[styles.button, { backgroundColor: theme.primary, opacity: canSubmit ? 1 : 0.5 }]}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
              </Pressable>
              <GoogleSignInButton />

              <View style={styles.footer}>
                <Text style={{ color: theme.textSecondary }}>Have an account? </Text>
                <Link href="/(auth)/sign-in" style={[styles.linkText, { color: theme.primary }]}>
                  Sign in
                </Link>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function clerkError(err: unknown): string {
  const e = err as { errors?: { message?: string; longMessage?: string }[] };
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? 'Something went wrong.';
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  brand: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginBottom: 12 },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: { fontSize: 13, fontWeight: '600' },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  linkText: { fontWeight: '700' },
});
