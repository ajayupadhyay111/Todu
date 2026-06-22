import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { TaskCard } from '@/components/task-card';
import { useTheme } from '@/hooks/use-theme';
import { todayTasks } from '@/lib/sample-data';
import type { Task } from '@/lib/types';

export default function TodayScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(() => todayTasks());

  const doneCount = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const progress = tasks.length ? doneCount / tasks.length : 0;

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'open' : 'done' } : t,
      ),
    );

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Today</Text>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[styles.progressFill, { backgroundColor: theme.primary, width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {doneCount} of {tasks.length} done
            </Text>
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
        ListEmptyComponent={<EmptyState title="Nothing due today 🎉" hint="Enjoy the clear runway." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16, gap: 6 },
  eyebrow: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 13 },
});
