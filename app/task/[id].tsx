import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useTheme } from '@/hooks/use-theme';
import { formatDue } from '@/lib/dates';
import type { Priority } from '@/lib/types';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export default function TaskDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = id as Id<'tasks'>;

  const task = useQuery(api.tasks.get, { taskId });
  const projects = useQuery(api.projects.list);
  const update = useMutation(api.tasks.update);
  const setStatus = useMutation(api.tasks.setStatus);
  const remove = useMutation(api.tasks.remove);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<Id<'projects'> | undefined>(undefined);
  const [dueDate, setDueDate] = useState<number | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydrate local state once the task loads.
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes ?? '');
      setPriority(task.priority);
      setProjectId(task.projectId);
      setDueDate(task.dueDate);
    }
  }, [task]);

  if (task === undefined) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (task === null) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]}>
        <EmptyState icon="alert-circle-outline" title="Task not found" />
      </View>
    );
  }

  const done = task.status === 'done';
  const due = formatDue(dueDate);

  const save = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await update({
        taskId,
        title: title.trim(),
        notes,
        priority,
        projectId: projectId ?? null,
        dueDate: dueDate ?? null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert('Delete task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove({ taskId });
          router.back();
        },
      },
    ]);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Task title"
        placeholderTextColor={theme.textSecondary}
        style={[styles.titleInput, { color: theme.textPrimary }]}
        multiline
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
      <View style={styles.row}>
        {PRIORITIES.map((p) => {
          const active = p === priority;
          const c = p === 'high' ? theme.priorityHigh : p === 'medium' ? theme.priorityMedium : theme.priorityLow;
          return (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[styles.chip, { borderColor: c, backgroundColor: active ? c + '22' : 'transparent' }]}>
              <Text style={[styles.chipText, { color: c }]}>{p[0].toUpperCase() + p.slice(1)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Project</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setProjectId(undefined)}
          style={[styles.chip, { borderColor: theme.border, backgroundColor: !projectId ? theme.surface : 'transparent' }]}>
          <Text style={[styles.chipText, { color: theme.textSecondary }]}>Inbox</Text>
        </Pressable>
        {(projects ?? []).map((p) => {
          const active = p._id === projectId;
          return (
            <Pressable
              key={p._id}
              onPress={() => setProjectId(p._id)}
              style={[styles.chip, { borderColor: p.color, backgroundColor: active ? p.color + '22' : 'transparent' }]}>
              <View style={[styles.dot, { backgroundColor: p.color }]} />
              <Text style={[styles.chipText, { color: theme.textPrimary }]}>{p.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Due</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.chip, { borderColor: theme.border }]}>
          <Ionicons name="calendar-outline" size={15} color={due?.overdue ? theme.danger : theme.textSecondary} />
          <Text style={[styles.chipText, { color: due?.overdue ? theme.danger : theme.textPrimary }]}>
            {due?.label ?? 'No date'}
          </Text>
        </Pressable>
        {dueDate !== undefined && (
          <Pressable onPress={() => setDueDate(undefined)} style={[styles.chip, { borderColor: theme.border }]}>
            <Text style={[styles.chipText, { color: theme.textSecondary }]}>Clear</Text>
          </Pressable>
        )}
      </View>
      {showPicker && (
        <DateTimePicker
          value={dueDate ? new Date(dueDate) : new Date()}
          mode="date"
          onChange={(event, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (event.type === 'set' && date) setDueDate(date.getTime());
          }}
        />
      )}

      <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Add details… (voice coming soon)"
        placeholderTextColor={theme.textSecondary}
        multiline
        style={[styles.notes, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
      />

      <Pressable
        onPress={() => setStatus({ taskId, status: done ? 'open' : 'done' })}
        style={[styles.cta, { backgroundColor: done ? theme.surface : theme.success, borderColor: theme.border }]}>
        <Ionicons name={done ? 'refresh' : 'checkmark-circle'} size={20} color={done ? theme.textPrimary : '#fff'} />
        <Text style={[styles.ctaText, { color: done ? theme.textPrimary : '#fff' }]}>
          {done ? 'Reopen task' : 'Mark complete'}
        </Text>
      </Pressable>

      <Pressable
        onPress={save}
        disabled={!title.trim() || saving}
        style={[styles.cta, { backgroundColor: theme.primary, opacity: !title.trim() || saving ? 0.5 : 1 }]}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.ctaText, { color: '#fff' }]}>Save changes</Text>}
      </Pressable>

      <Pressable onPress={confirmDelete} style={styles.delete}>
        <Ionicons name="trash-outline" size={18} color={theme.danger} />
        <Text style={[styles.deleteText, { color: theme.danger }]}>Delete task</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 10, paddingBottom: 48 },
  titleInput: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  label: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  notes: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  ctaText: { fontSize: 16, fontWeight: '700' },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  deleteText: { fontSize: 15, fontWeight: '600' },
});
