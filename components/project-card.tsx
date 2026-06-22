import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface Props {
  name: string;
  color: string;
  taskCount: number;
  doneCount?: number;
  onPress?: () => void;
}

export function ProjectCard({ name, color, taskCount, doneCount, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>
        <Text style={[styles.count, { color: theme.textSecondary }]}>
          {doneCount !== undefined ? `${doneCount}/${taskCount} done` : `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  count: { fontSize: 13, marginTop: 2 },
});
