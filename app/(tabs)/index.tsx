import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { TaskCard } from '@/components/task-card';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useTheme } from '@/hooks/use-theme';
import { endOfToday, formatDue } from '@/lib/dates';

export default function TodayScreen() {
  const theme = useTheme();
  const router = useRouter();

  const tasks = useQuery(api.tasks.today, { endOfDay: endOfToday() });
  const projects = useQuery(api.projects.list);
  const setStatus = useMutation(api.tasks.setStatus);

  const projectMap = useMemo(
    () => new Map((projects ?? []).map((p) => [p._id, p])),
    [projects]
  );

  const total = tasks?.length ?? 0;

  const toggle = (id: Id<'tasks'>, status: 'open' | 'done') =>
    setStatus({ taskId: id, status: status === 'done' ? 'open' : 'done' });

  if (tasks === undefined) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safe, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Today</Text>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {total} {total === 1 ? 'task' : 'tasks'} to do
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const project = item.projectId ? projectMap.get(item.projectId) : undefined;
          const due = formatDue(item.dueDate);
          return (
            <TaskCard
              title={item.title}
              priority={item.priority}
              done={item.status === 'done'}
              projectName={project?.name}
              projectColor={project?.color}
              dueLabel={due?.label}
              overdue={due?.overdue}
              onToggle={() => toggle(item._id, item.status)}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: item._id } })}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState title="Nothing due today 🎉" hint="Enjoy the clear runway." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 96 },
  header: { marginBottom: 16, gap: 6 },
  eyebrow: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  progressText: { fontSize: 13 },
});
