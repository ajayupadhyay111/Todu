import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PriorityBadge } from '@/components/priority-badge';
import { useTheme } from '@/hooks/use-theme';
import type { Priority } from '@/lib/types';

interface Props {
  title: string;
  priority: Priority;
  done: boolean;
  projectName?: string;
  projectColor?: string;
  dueLabel?: string;
  overdue?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
}

export function TaskCard({
  title,
  priority,
  done,
  projectName,
  projectColor,
  dueLabel,
  overdue,
  onPress,
  onToggle,
}: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? 'Mark incomplete' : 'Mark complete'}>
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={done ? theme.success : theme.textSecondary}
        />
      </Pressable>

      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            { color: done ? theme.textSecondary : theme.textPrimary },
            done && styles.struck,
          ]}>
          {title}
        </Text>

        <View style={styles.meta}>
          <PriorityBadge priority={priority} />
          {projectName && (
            <View style={styles.project}>
              <View style={[styles.projectDot, { backgroundColor: projectColor ?? theme.textSecondary }]} />
              <Text style={[styles.projectName, { color: theme.textSecondary }]}>{projectName}</Text>
            </View>
          )}
          {dueLabel && (
            <Text style={[styles.due, { color: overdue ? theme.danger : theme.textSecondary }]}>
              {dueLabel}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: { flex: 1, gap: 8 },
  title: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  struck: { textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  project: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  projectDot: { width: 8, height: 8, borderRadius: 4 },
  projectName: { fontSize: 12, fontWeight: '500' },
  due: { fontSize: 12, fontWeight: '600' },
});
