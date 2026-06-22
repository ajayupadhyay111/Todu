import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { TaskCard } from '@/components/task-card';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useTheme } from '@/hooks/use-theme';
import { formatDue } from '@/lib/dates';
import type { Priority } from '@/lib/types';

type Filter = 'all' | Priority;
const FILTERS: Filter[] = ['all', 'high', 'medium', 'low'];
const FILTER_LABEL: Record<Filter, string> = { all: 'All', high: 'High', medium: 'Medium', low: 'Low' };

export default function InboxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const tasks = useQuery(api.tasks.list);
  const projects = useQuery(api.projects.list);
  const setStatus = useMutation(api.tasks.setStatus);

  const projectMap = useMemo(
    () => new Map((projects ?? []).map((p) => [p._id, p])),
    [projects]
  );

  const visible = useMemo(
    () => (tasks ?? []).filter((t) => filter === 'all' || t.priority === filter),
    [tasks, filter]
  );

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
        data={visible}
        keyExtractor={(t) => t._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Inbox</Text>
            <View style={styles.filters}>
              {FILTERS.map((f) => {
                const active = f === filter;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.chip,
                      { borderColor: theme.border, backgroundColor: active ? theme.primary : 'transparent' },
                    ]}>
                    <Text style={[styles.chipText, { color: active ? '#fff' : theme.textSecondary }]}>
                      {FILTER_LABEL[f]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
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
        ListEmptyComponent={<EmptyState icon="file-tray-outline" title="No tasks yet" hint="Tap + to add one." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 96 },
  header: { marginBottom: 16, gap: 12 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  filters: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  chipText: { fontSize: 13, fontWeight: '600' },
});
