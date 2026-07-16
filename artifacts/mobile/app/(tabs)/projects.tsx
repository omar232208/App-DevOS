import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useData, Project, Priority, TaskStatus } from '@/context/DataContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import * as Haptics from 'expo-haptics';

const PROJECT_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#EF4444', '#14B8A6'];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function CreateProjectModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { addProject } = useData();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  function handleCreate() {
    if (!name.trim()) return;
    addProject({ name: name.trim(), description: desc.trim(), status: 'active', color, icon: 'folder', progress: 0 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName(''); setDesc(''); setColor(PROJECT_COLORS[0]);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Project</Text>
          <Pressable onPress={onClose}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Project Name</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }]}
              value={name} onChangeText={setName} placeholder="e.g. Mobile App Redesign"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Description</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground, height: 90, textAlignVertical: 'top' }]}
              value={desc} onChangeText={setDesc} placeholder="What is this project about?" multiline
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {PROJECT_COLORS.map(c => (
                <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorSwatch, { backgroundColor: c, borderWidth: c === color ? 3 : 0, borderColor: '#fff' }]} />
              ))}
            </View>
          </View>
          <GradientButton label="Create Project" onPress={handleCreate} size="lg" style={{ marginTop: 8 }} disabled={!name.trim()} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function AddTaskModal({ projectId, visible, onClose }: { projectId: string; visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const { addTask } = useData();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const priorityColors: Record<Priority, string> = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', urgent: '#8B5CF6' };

  function handleAdd() {
    if (!title.trim()) return;
    addTask(projectId, { title: title.trim(), status: 'todo', priority });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTitle(''); setPriority('medium');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Task</Text>
          <Pressable onPress={onClose}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }]}
            value={title} onChangeText={setTitle} placeholder="Task title..." placeholderTextColor={colors.mutedForeground}
            autoFocus
          />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {priorities.map(p => (
              <Pressable key={p} onPress={() => setPriority(p)} style={[styles.priorityChip, { borderColor: p === priority ? priorityColors[p] : colors.border, backgroundColor: p === priority ? priorityColors[p] + '22' : colors.card }]}>
                <Text style={{ color: p === priority ? priorityColors[p] : colors.mutedForeground, fontSize: 12, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' }}>{p}</Text>
              </Pressable>
            ))}
          </View>
          <GradientButton label="Add Task" onPress={handleAdd} size="lg" disabled={!title.trim()} />
        </View>
      </View>
    </Modal>
  );
}

function TaskRow({ task, projectId, onToggle }: { task: any; projectId: string; onToggle: () => void }) {
  const colors = useColors();
  const priorityColors: Record<Priority, string> = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', urgent: '#8B5CF6' };
  const isDone = task.status === 'done';

  return (
    <View style={[styles.taskRow, { borderBottomColor: colors.border }]}>
      <Pressable onPress={onToggle} style={[styles.taskCheck, { borderColor: isDone ? colors.success : colors.border, backgroundColor: isDone ? colors.success + '22' : 'transparent' }]}>
        {isDone && <Feather name="check" size={12} color={colors.success} />}
      </Pressable>
      <Text style={[styles.taskTitle, { color: isDone ? colors.mutedForeground : colors.foreground, textDecorationLine: isDone ? 'line-through' : 'none' }]}>{task.title}</Text>
      <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority as Priority] }]} />
    </View>
  );
}

function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const colors = useColors();
  const { updateTask, deleteProject } = useData();
  const [expanded, setExpanded] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const activeTasks = project.tasks.filter(t => t.status !== 'done');
  const doneTasks = project.tasks.filter(t => t.status === 'done');

  function toggleTask(taskId: string, currentStatus: TaskStatus) {
    updateTask(project.id, taskId, { status: currentStatus === 'done' ? 'todo' : 'done' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function confirmDelete() {
    Alert.alert('Delete Project', `Delete "${project.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProject(project.id) },
    ]);
  }

  return (
    <>
      <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
        <View style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Color bar */}
          <View style={[styles.colorBar, { backgroundColor: project.color }]} />
          <View style={{ flex: 1 }}>
            <View style={styles.projectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.projectName, { color: colors.foreground }]}>{project.name}</Text>
                {project.description ? <Text style={[styles.projectDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{project.description}</Text> : null}
              </View>
              <View style={styles.projectActions}>
                <Badge label={project.status} variant={project.status === 'active' ? 'success' : 'default'} />
                <Pressable onPress={confirmDelete} style={{ padding: 4 }}>
                  <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <LinearGradient colors={[project.color, project.color + 'AA']} style={[styles.progressFill, { width: `${project.progress}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              </View>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{project.progress}%</Text>
            </View>

            <View style={styles.projectFooter}>
              <Text style={[styles.taskCount, { color: colors.mutedForeground }]}>
                {doneTasks.length}/{project.tasks.length} tasks
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => setAddTaskVisible(true)} style={[styles.addTaskBtn, { borderColor: project.color, backgroundColor: project.color + '15' }]}>
                  <Feather name="plus" size={12} color={project.color} />
                  <Text style={{ color: project.color, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>Task</Text>
                </Pressable>
                <Pressable onPress={() => setExpanded(!expanded)}>
                  <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            {expanded && project.tasks.length > 0 && (
              <View style={[styles.taskList, { borderTopColor: colors.border }]}>
                {project.tasks.map(t => (
                  <TaskRow key={t.id} task={t} projectId={project.id} onToggle={() => toggleTask(t.id, t.status)} />
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
      <AddTaskModal projectId={project.id} visible={addTaskVisible} onClose={() => setAddTaskVisible(false)} />
    </>
  );
}

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects } = useData();
  const [createVisible, setCreateVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Projects</Text>
        <Pressable onPress={() => setCreateVisible(true)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search} onChangeText={setSearch}
            placeholder="Search projects..." placeholderTextColor={colors.mutedForeground}
          />
          {search ? <Pressable onPress={() => setSearch('')}><Feather name="x" size={16} color={colors.mutedForeground} /></Pressable> : null}
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, { backgroundColor: f === filter ? colors.primary : colors.muted, borderColor: f === filter ? colors.primary : colors.border }]}>
            <Text style={{ color: f === filter ? '#fff' : colors.mutedForeground, fontSize: 13, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' }}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 120 : 100 }]}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="folder" size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No projects yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Create your first project to start organizing your work</Text>
            <GradientButton label="Create Project" onPress={() => setCreateVisible(true)} style={{ marginTop: 20, paddingHorizontal: 24 }} />
          </View>
        ) : (
          filtered.map((p, i) => <ProjectCard key={p.id} project={p} delay={i * 80} />)
        )}
      </ScrollView>

      <CreateProjectModal visible={createVisible} onClose={() => setCreateVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchRow: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  list: { padding: 20, gap: 12 },
  projectCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', marginBottom: 0 },
  colorBar: { width: 4 },
  projectHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 14, paddingBottom: 8 },
  projectName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
  projectDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  projectActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 8 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4 },
  progressLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', width: 28 },
  projectFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 12 },
  taskCount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  addTaskBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  taskList: { borderTopWidth: StyleSheet.hairlineWidth, marginHorizontal: 14, marginBottom: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  taskCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskTitle: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  priorityDot: { width: 7, height: 7, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular' },
  colorSwatch: { width: 32, height: 32, borderRadius: 10 },
  priorityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
});
