import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ProjectCard } from '@/components/project-card';
import { api } from '@/convex/_generated/api';
import { useTheme } from '@/hooks/use-theme';

const SWATCHES = ['#6366F1', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7'];

export default function ProjectsScreen() {
  const theme = useTheme();
  const projects = useQuery(api.projects.listWithCounts);
  const createProject = useMutation(api.projects.create);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await createProject({ name: name.trim(), color });
      setName('');
      setColor(SWATCHES[0]);
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      {projects === undefined ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Projects</Text>
              <Pressable
                onPress={() => setModalOpen(true)}
                hitSlop={10}
                accessibilityLabel="New project"
                style={[styles.addBtn, { backgroundColor: theme.primary }]}>
                <Ionicons name="add" size={22} color="#fff" />
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <ProjectCard name={item.name} color={item.color} taskCount={item.total} doneCount={item.done} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <EmptyState icon="folder-outline" title="No projects yet" hint="Create your first project." />
          }
        />
      )}

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalOpen(false)} />
        <View style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>New project</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Project name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <View style={styles.swatches}>
            {SWATCHES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c, borderColor: color === c ? theme.textPrimary : 'transparent' },
                ]}
              />
            ))}
          </View>
          <Pressable
            onPress={submit}
            disabled={!name.trim() || saving}
            style={[styles.cta, { backgroundColor: theme.primary, opacity: !name.trim() || saving ? 0.5 : 1 }]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Create</Text>}
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 96 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  swatches: { flexDirection: 'row', gap: 12 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2 },
  cta: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
