import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { PriorityBadge } from '@/components/priority-badge';
import { useTheme } from '@/hooks/use-theme';
import { projectById, taskById } from '@/lib/sample-data';

export default function TaskDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = taskById(id);
  const [done, setDone] = useState(task?.status === 'done');

  if (!task) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]}>
        <EmptyState icon="alert-circle-outline" title="Task not found" />
      </View>
    );
  }

  const project = projectById(task.projectId);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{task.title}</Text>

      <View style={styles.row}>
        <PriorityBadge priority={task.priority} />
        {task.dueLabel && (
          <View style={styles.meta}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={task.overdue ? theme.danger : theme.textSecondary}
            />
            <Text style={{ color: task.overdue ? theme.danger : theme.textSecondary, fontWeight: '600' }}>
              {task.dueLabel}
            </Text>
          </View>
        )}
        {project && (
          <View style={styles.meta}>
            <View style={[styles.dot, { backgroundColor: project.color }]} />
            <Text style={{ color: theme.textSecondary, fontWeight: '500' }}>{project.name}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
      <Text style={[styles.desc, { color: task.notes ? theme.textPrimary : theme.textSecondary }]}>
        {task.notes ?? 'No description yet. Add one — or dictate it with voice.'}
      </Text>

      <Pressable
        onPress={() => setDone((d) => !d)}
        style={[
          styles.cta,
          { backgroundColor: done ? theme.surface : theme.primary, borderColor: theme.border },
        ]}>
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={done ? theme.success : '#fff'}
        />
        <Text style={[styles.ctaText, { color: done ? theme.textPrimary : '#fff' }]}>
          {done ? 'Completed' : 'Mark complete'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  desc: { fontSize: 15, lineHeight: 22 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  ctaText: { fontSize: 16, fontWeight: '700' },
});
