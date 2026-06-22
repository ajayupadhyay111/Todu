import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useTheme } from '@/hooks/use-theme';
import type { Priority } from '@/lib/types';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

/** Floating + button that opens a bottom-sheet to create a task fast. */
export function QuickAddFab() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const projects = useQuery(api.projects.list);
  const createTask = useMutation(api.tasks.create);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<Id<'projects'> | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle('');
    setPriority('medium');
    setProjectId(undefined);
  };

  const open = () => sheetRef.current?.present();

  const submit = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({ title: title.trim(), priority, projectId });
      reset();
      sheetRef.current?.dismiss();
    } finally {
      setSaving(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    []
  );

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityLabel="Add task"
        style={[styles.fab, { backgroundColor: theme.primary, bottom: insets.bottom + 70 }]}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}>
        <BottomSheetView style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>New task</Text>

          <BottomSheetTextInput
            placeholder="What needs doing?"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
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
          </ScrollView>

          <Pressable
            onPress={submit}
            disabled={!title.trim() || saving}
            style={[styles.cta, { backgroundColor: theme.primary, opacity: !title.trim() || saving ? 0.5 : 1 }]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Add task</Text>}
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sheet: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  heading: { fontSize: 20, fontWeight: '800' },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  label: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 6 },
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
  cta: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
