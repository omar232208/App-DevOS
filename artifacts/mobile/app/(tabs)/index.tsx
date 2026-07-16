import React, { useState } from 'react';
import {
  Dimensions,
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
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function StatCard({ icon, label, value, color, delay }: {
  icon: string; label: string; value: string; color: string; delay: number;
}) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient colors={[color + '22', color + '11']} style={styles.statIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Feather name={icon as any} size={17} color={color} />
      </LinearGradient>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </Animated.View>
  );
}

function QuickAction({ icon, label, gradient, onPress, delay }: {
  icon: string; label: string; gradient: [string, string]; onPress: () => void; delay: number;
}) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={{ width: '47.5%' }}>
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
        style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
      >
        <LinearGradient colors={gradient} style={styles.qaIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name={icon as any} size={22} color="#fff" />
        </LinearGradient>
        <Text style={[styles.qaLabel, { color: colors.foreground }]}>{label}</Text>
        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

function ProjectRow({ project, delay }: { project: any; delay: number }) {
  const colors = useColors();
  const done = project.tasks.filter((t: any) => t.status === 'done').length;
  const total = project.tasks.length;
  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(450)}>
      <Pressable
        onPress={() => router.push('/(tabs)/projects')}
        style={({ pressed }) => [styles.projectRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
      >
        <View style={[styles.projectColorDot, { backgroundColor: project.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>{project.name}</Text>
          <View style={styles.progressMini}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={[project.color, project.color + 'AA']}
                style={[styles.progressFill, { width: `${project.progress}%` as any }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>{project.progress}%</Text>
          </View>
          <Text style={[styles.taskCount, { color: colors.mutedForeground }]}>{done}/{total} tasks</Text>
        </View>
        <ProgressRing progress={project.progress} size={44} strokeWidth={4} color={project.color} />
      </Pressable>
    </Animated.View>
  );
}

function ActivityRow({ icon, text, time, color }: { icon: string; text: string; time: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.actRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.actIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon as any} size={13} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.actText, { color: colors.foreground }]} numberOfLines={1}>{text}</Text>
        <Text style={[styles.actTime, { color: colors.mutedForeground }]}>{time}</Text>
      </View>
    </View>
  );
}

function timeSince(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { projects, notes } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === 'done').length, 0);
  const activeProjects = projects.filter(p => p.status === 'active');
  const score = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: botPad + 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero Header */}
        <LinearGradient colors={['#08081A', '#0F0F28', '#08081A']} style={[styles.hero, { paddingTop: topPad + 16 }]}>
          {/* Orb decorations */}
          <View style={[styles.heroOrb1, { backgroundColor: '#6366F120' }]} />
          <View style={[styles.heroOrb2, { backgroundColor: '#8B5CF615' }]} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreet}>{greeting()},</Text>
              <Text style={styles.heroName}>{user?.name?.split(' ')[0] ?? 'Developer'} 👋</Text>
            </View>
            <View style={styles.heroActions}>
              <Pressable
                onPress={() => {}}
                style={[styles.headerIconBtn, { backgroundColor: '#ffffff10', borderColor: '#ffffff15' }]}
              >
                <Feather name="bell" size={18} color="#fff" />
                <View style={styles.notifBadge} />
              </Pressable>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.heroAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.heroAvatarText}>{initials}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Productivity card inside hero */}
          <Animated.View entering={FadeInDown.delay(50).duration(500)}>
            <View style={[styles.scoreCard, { backgroundColor: '#ffffff08', borderColor: '#ffffff10' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scoreLabel}>Productivity Score</Text>
                <Text style={styles.scoreValue}>{score}%</Text>
                <Text style={styles.scoreDesc}>{doneTasks} of {totalTasks} tasks complete</Text>
                <View style={{ marginTop: 12 }}>
                  <Badge
                    label={score >= 80 ? '🔥 Excellent' : score >= 50 ? '✓ On Track' : '⚡ Getting Started'}
                    variant={score >= 80 ? 'success' : score >= 50 ? 'info' : 'warning'}
                  />
                </View>
              </View>
              <ProgressRing progress={score} size={96} strokeWidth={8} />
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="check-circle" label="Done" value={doneTasks.toString()} color={colors.success} delay={80} />
            <StatCard icon="folder" label="Projects" value={activeProjects.length.toString()} color={colors.primary} delay={130} />
            <StatCard icon="file-text" label="Notes" value={notes.length.toString()} color={colors.accent} delay={180} />
            <StatCard icon="zap" label="Streak" value="7d" color={colors.warning} delay={230} />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.qaGrid}>
            <QuickAction icon="plus-circle" label="New Task" gradient={['#6366F1', '#4F46E5']} onPress={() => router.push('/(tabs)/projects')} delay={100} />
            <QuickAction icon="folder-plus" label="Project" gradient={['#8B5CF6', '#7C3AED']} onPress={() => router.push('/(tabs)/projects')} delay={150} />
            <QuickAction icon="cpu" label="Ask AI" gradient={['#EC4899', '#DB2777']} onPress={() => router.push('/(tabs)/ai')} delay={200} />
            <QuickAction icon="edit-3" label="New Note" gradient={['#3B82F6', '#2563EB']} onPress={() => router.push('/(tabs)/notes')} delay={250} />
          </View>

          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Active Projects</Text>
                <Pressable onPress={() => router.push('/(tabs)/projects')}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'Inter_500Medium' }}>View all</Text>
                </Pressable>
              </View>
              {activeProjects.slice(0, 4).map((p, i) => (
                <ProjectRow key={p.id} project={p} delay={i * 60} />
              ))}
            </>
          )}

          {/* Activity */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {projects.length === 0 && notes.length === 0 ? (
              <View style={styles.emptyAct}>
                <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyActIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Feather name="activity" size={22} color="#fff" />
                </LinearGradient>
                <Text style={[styles.emptyActTitle, { color: colors.foreground }]}>No activity yet</Text>
                <Text style={[styles.emptyActSub, { color: colors.mutedForeground }]}>Create a project or note to get started</Text>
              </View>
            ) : (
              <>
                {projects.slice(0, 3).map(p => (
                  <ActivityRow key={p.id} icon="folder" text={`Created project "${p.name}"`} time={timeSince(p.createdAt)} color={p.color} />
                ))}
                {notes.slice(0, 2).map(n => (
                  <ActivityRow key={n.id} icon="file-text" text={`Added note "${n.title}"`} time={timeSince(n.createdAt)} color={colors.accent} />
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 24, overflow: 'hidden' },
  heroOrb1: { position: 'absolute', width: 250, height: 250, borderRadius: 999, top: -80, right: -60 },
  heroOrb2: { position: 'absolute', width: 200, height: 200, borderRadius: 999, bottom: -60, left: -40 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  heroGreet: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#ffffff66', marginBottom: 2 },
  heroName: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -0.4 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBtn: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1', position: 'absolute', top: 8, right: 8 },
  heroAvatar: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff' },
  scoreCard: { borderRadius: 18, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center' },
  scoreLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#ffffff55', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  scoreValue: { fontSize: 44, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -1, lineHeight: 50 },
  scoreDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ffffff66', marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.2, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, gap: 6 },
  statIconBg: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 21, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickAction: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10, flexDirection: 'row', alignItems: 'center' },
  qaIconBox: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  projectColorDot: { width: 10, height: 10, borderRadius: 5 },
  projectName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  progressMini: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4 },
  progressPct: { fontSize: 11, fontFamily: 'Inter_500Medium', width: 30 },
  taskCount: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  activityCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  actIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  actTime: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  emptyAct: { alignItems: 'center', padding: 32, gap: 10 },
  emptyActIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyActTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  emptyActSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
});
