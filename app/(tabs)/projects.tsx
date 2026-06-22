import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ProjectCard } from '@/components/project-card';
import { useTheme } from '@/hooks/use-theme';
import { PROJECTS, tasksByProject } from '@/lib/sample-data';

export default function ProjectsScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <FlatList
        data={PROJECTS}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.title, { color: theme.textPrimary }]}>Projects</Text>
        }
        renderItem={({ item }) => (
          <ProjectCard project={item} taskCount={tasksByProject(item.id).length} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<EmptyState icon="folder-outline" title="No projects yet" hint="Create your first project." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginBottom: 16 },
});
