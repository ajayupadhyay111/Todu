import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  hint?: string;
}

export function EmptyState({ icon = 'checkmark-done-circle-outline', title, hint }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={theme.textSecondary} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {hint && <Text style={[styles.hint, { color: theme.textSecondary }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 64 },
  title: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 14, textAlign: 'center' },
});
