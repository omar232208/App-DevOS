import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import { router } from 'expo-router';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon, label, value, color, delay }: { icon: string; label: string; value: string; color: string; delay: number }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </Animated.View>
  );
}

function QuickAction({ icon, label, color, onPress, delay }: { icon: string; label: string; color: string; onPress: () => void; delay: number }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <Pressable onPress={onPress} style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient colors={[color, color + 'BB']} style={styles.qaIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name={icon as any} size={20} color="#fff" />
        </LinearGradient>
        <Text style={[styles.qaLabel, { color: colors.foreground }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function ProjectMini({ project, delay }: { project: any; delay: number }) {
  const colors = useColors();
  const done = project.tasks.filter((t: any) => t.status === 'done').length;
  const total = project.tasks.length;
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(500)}>
      <Pressable
        style={[styles.projectMini, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {}}
      >
        <View style={[styles.projectDot, { backgroundColor: project.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.projectMiniName, { color: colors.foreground }]} numberOfLines={1}>{project.name}</Text>
          <Text style={[styles.projectMiniSub, { color: colors.mutedForeground }]}>{done}/{total} tasks</Text>
        </View>
        <ProgressRing progress={project.progress} size={40} strokeWidth={4} color={project.color} />
      </Pressable>
    </Animated.View>
  );
}

function ActivityItem({ icon, text, time, color }: { icon: string; text: string; time: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon as any} size={14} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.activityText, { color: colors.foreground }]}>{text}</Text>
        <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{time}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { projects, notes } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const totalTasks = useMemo(() => projects.reduce((a, p) => a + p.tasks.length, 0), [projects]);
  const doneTasks = useMemo(() => projects.reduce((a, p) => a + p.tasks.filter(t => t.status === 'done').length, 0), [projects]);
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'active'), [projects]);
  const productivity = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greetSub, { color: colors.mutedForeground }]}>{greeting()},</Text>
          <Text style={[styles.greetName, { color: colors.foreground }]}>{user?.name ?? 'Developer'}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => {}}>
            <Feather name="bell" size={18} color={colors.foreground} />
            <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
          </Pressable>
          <Pressable style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Productivity Banner */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={['#1C1C38', '#13132A']}
            style={[styles.productivityCard, { borderColor: colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.prodLabel}>Productivity Score</Text>
              <Text style={styles.prodValue}>{productivity}%</Text>
              <Text style={styles.prodSub}>{doneTasks} of {totalTasks} tasks complete</Text>
              <Badge
                label={productivity >= 80 ? 'Excellent' : productivity >= 50 ? 'On Track' : 'Getting Started'}
                variant={productivity >= 80 ? 'success' : productivity >= 50 ? 'info' : 'warning'}
                style={{ marginTop: 12 }}
              />
            </View>
            <ProgressRing progress={productivity} size={90} strokeWidth={7} />
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard icon="check-circle" label="Done" value={doneTasks.toString()} color={colors.success} delay={100} />
          <StatCard icon="folder" label="Projects" value={activeProjects.length.toString()} color={colors.primary} delay={150} />
          <StatCard icon="file-text" label="Notes" value={notes.length.toString()} color={colors.accent} delay={200} />
          <StatCard icon="zap" label="Streak" value="7d" color={colors.warning} delay={250} />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.qaGrid}>
          <QuickAction icon="plus-circle" label="New Task" color={colors.primary} onPress={() => router.push('/(tabs)/projects')} delay={100} />
          <QuickAction icon="folder-plus" label="Project" color={colors.accent} onPress={() => router.push('/(tabs)/projects')} delay={150} />
          <QuickAction icon="cpu" label="Ask AI" color="#EC4899" onPress={() => router.push('/(tabs)/ai')} delay={200} />
          <QuickAction icon="edit-3" label="New Note" color={colors.info} onPress={() => router.push('/(tabs)/notes')} delay={250} />
        </View>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Active Projects</Text>
              <Pressable onPress={() => router.push('/(tabs)/projects')}>
                <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_500Medium' }}>See all</Text>
              </Pressable>
            </View>
            {activeProjects.slice(0, 3).map((p, i) => (
              <ProjectMini key={p.id} project={p} delay={i * 80} />
            ))}
          </>
        )}

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
        <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {projects.length === 0 && notes.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Feather name="activity" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Create a project or note to get started</Text>
            </View>
          ) : (
            <>
              {projects.slice(0, 2).map((p, i) => (
                <ActivityItem key={p.id} icon="folder" text={`Created project "${p.name}"`} time={formatTime(p.createdAt)} color={p.color} />
              ))}
              {notes.slice(0, 2).map((n, i) => (
                <ActivityItem key={n.id} icon="file-text" text={`Added note "${n.title}"`} time={formatTime(n.createdAt)} color={colors.accent} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  greetSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  greetName: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notifDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', top: 7, right: 7 },
  avatar: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  productivityCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 20, marginBottom: 24,
    borderWidth: 1,
  },
  prodLabel: { color: '#ffffff66', fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  prodValue: { color: '#fff', fontSize: 40, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  prodSub: { color: '#ffffff77', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 12, letterSpacing: -0.2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1,
  },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2 },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickAction: {
    width: '47.5%', borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'flex-start', gap: 10,
  },
  qaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  projectMini: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14,
    padding: 14, marginBottom: 8, borderWidth: 1,
  },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  projectMiniName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  projectMiniSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  activityCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ffffff11' },
  activityIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  activityTime: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  emptyActivity: { alignItems: 'center', padding: 32, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
