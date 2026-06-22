import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useThemeMode, type ThemePref } from '@/hooks/use-theme-mode';

const OPTIONS: { value: ThemePref; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { pref, setPref } = useThemeMode();
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.accountLabel, { color: theme.textSecondary }]}>Signed in as</Text>
          <Text style={[styles.accountEmail, { color: theme.textPrimary }]}>
            {user?.primaryEmailAddress?.emailAddress ?? '—'}
          </Text>
        </View>

        <Text style={[styles.section, { color: theme.textSecondary }]}>Appearance</Text>
        <View style={styles.segments}>
          {OPTIONS.map((opt) => {
            const active = opt.value === pref;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPref(opt.value)}
                style={[
                  styles.segment,
                  { borderColor: theme.border, backgroundColor: active ? theme.primary : theme.surface },
                ]}>
                <Ionicons name={opt.icon} size={18} color={active ? '#fff' : theme.textSecondary} />
                <Text style={[styles.segmentText, { color: active ? '#fff' : theme.textPrimary }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => signOut()}
          style={[styles.signOut, { borderColor: theme.border }]}>
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={[styles.signOutText, { color: theme.danger }]}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  card: { padding: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  accountLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  accountEmail: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  section: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  segments: { flexDirection: 'row', gap: 8 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmentText: { fontSize: 14, fontWeight: '600' },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  signOutText: { fontSize: 16, fontWeight: '700' },
});
