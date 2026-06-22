import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { TaskCard } from '@/components/task-card';
import { useTheme } from '@/hooks/use-theme';
import { TASKS } from '@/lib/sample-data';
import type { Priority, Task } from '@/lib/types';

type Filter = 'all' | Priority;
const FILTERS: Filter[] = ['all', 'high', 'medium', 'low'];
const FILTER_LABEL: Record<Filter, string> = { all: 'All', high: 'High', medium: 'Medium', low: 'Low' };

export default function InboxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(() => TASKS.map((t) => ({ ...t })));
  const [filter, setFilter] = useState<Filter>('all');

  const visible = tasks.filter((t) => filter === 'all' || t.priority === filter);

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'open' : 'done' } : t,
      ),
    );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
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
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? '#fff' : theme.textSecondary },
                      ]}>
                      {FILTER_LABEL[f]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => toggle(item.id)}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="file-tray-outline" title="No tasks here" hint="Tap + to add one." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16, gap: 12 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  filters: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  chipText: { fontSize: 13, fontWeight: '600' },
});
