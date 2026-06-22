import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Required for the OAuth redirect to complete the auth session.
WebBrowser.maybeCompleteAuthSession();

/** Warms up the Android browser to cut OAuth load time. */
function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

/** "Continue with Google" — browser-based Clerk OAuth (works on dev build + web). */
export function GoogleSignInButton() {
  const theme = useTheme();
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'todu', path: 'sso-callback' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Google sign-in error', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
        <Text style={[styles.or, { color: theme.textSecondary }]}>OR</Text>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
      </View>

      <Pressable
        onPress={onPress}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border, opacity: loading ? 0.6 : 1 }]}>
        {loading ? (
          <ActivityIndicator color={theme.textPrimary} />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color={theme.textPrimary} />
            <Text style={[styles.label, { color: theme.textPrimary }]}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14, marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  or: { fontSize: 12, fontWeight: '700' },
  button: {
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: { fontSize: 16, fontWeight: '700' },
});
