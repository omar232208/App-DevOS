import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import * as Haptics from 'expo-haptics';

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  iconColor?: string;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  delay?: number;
}

function SettingRow({ icon, label, value, onPress, iconColor, danger, toggle, toggleValue, onToggle, delay = 0 }: SettingRowProps) {
  const colors = useColors();
  const ic = danger ? colors.destructive : (iconColor ?? colors.primary);

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.settRow, { borderBottomColor: colors.border, opacity: pressed && !toggle ? 0.7 : 1 }]}
        disabled={toggle}
      >
        <View style={[styles.settIcon, { backgroundColor: ic + '18' }]}>
          <Feather name={icon as any} size={15} color={ic} />
        </View>
        <Text style={[styles.settLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
        {toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle?.(v); }}
            thumbColor={toggleValue ? colors.primary : '#aaa'}
            trackColor={{ false: colors.border, true: colors.primary + '55' }}
          />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {value && <Text style={[styles.settValue, { color: colors.mutedForeground }]}>{value}</Text>}
            {onPress && <Feather name="chevron-right" size={15} color={colors.mutedForeground} />}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { projects, notes } = useData();
  const [notifs, setNotifs] = useState(true);
  const [compact, setCompact] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : 0;

  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === 'done').length, 0);
  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  function handleLogout() {
    Alert.alert('Sign Out', 'Sign out of DevOS?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  const stats = [
    { label: 'Projects', value: projects.length },
    { label: 'Tasks', value: totalTasks },
    { label: 'Done', value: doneTasks },
    { label: 'Notes', value: notes.length },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 110 }}>
        {/* Profile hero */}
        <LinearGradient colors={['#080818', '#0F0F28']} style={[styles.hero, { paddingTop: topPad + 20 }]}>
          {/* Decorative orbs */}
          <View style={styles.heroOrb1} />
          <View style={styles.heroOrb2} />

          {/* Avatar */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarWrap}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Pressable
              onPress={() => {}}
              style={[styles.avatarEdit, { backgroundColor: colors.primary, borderColor: '#080818' }]}
            >
              <Feather name="camera" size={11} color="#fff" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.nameBlock}>
            <Text style={styles.heroName}>{user?.name ?? 'Developer'}</Text>
            <Text style={styles.heroEmail}>{user?.email ?? ''}</Text>
            <View style={[styles.roleBadge, { borderColor: '#6366F155', backgroundColor: '#6366F115' }]}>
              <View style={[styles.roleDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.roleText}>{user?.role ?? 'Developer'}</Text>
            </View>
          </Animated.View>

          {/* Stats strip */}
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={[styles.statsStrip, { backgroundColor: '#ffffff08', borderColor: '#ffffff10' }]}>
            {stats.map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: '#ffffff15' }]}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </LinearGradient>

        {/* Settings */}
        <View style={styles.body}>
          <Section title="ACCOUNT">
            <SettingRow icon="user" label="Edit Profile" onPress={() => {}} delay={50} />
            <SettingRow icon="at-sign" label="Username" value={`@${(user?.name ?? 'dev').toLowerCase().replace(' ', '')}`} delay={80} />
            <SettingRow icon="calendar" label="Member Since" value={user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : 'Today'} delay={110} />
          </Section>

          <Section title="APPEARANCE">
            <SettingRow icon="sun" label="Theme" value="System" onPress={() => {}} iconColor="#F59E0B" delay={150} />
            <SettingRow icon="type" label="Font Size" value="Default" onPress={() => {}} iconColor="#3B82F6" delay={180} />
            <SettingRow icon="layout" label="Compact Mode" toggle toggleValue={compact} onToggle={setCompact} iconColor="#8B5CF6" delay={210} />
          </Section>

          <Section title="NOTIFICATIONS">
            <SettingRow icon="bell" label="Push Notifications" toggle toggleValue={notifs} onToggle={setNotifs} iconColor="#EC4899" delay={250} />
            <SettingRow icon="mail" label="Email Digest" value="Weekly" onPress={() => {}} iconColor="#6366F1" delay={280} />
            <SettingRow icon="message-circle" label="Slack Integration" value="Connect" onPress={() => {}} iconColor="#22C55E" delay={310} />
          </Section>

          <Section title="SECURITY">
            <SettingRow icon="lock" label="Change Password" onPress={() => {}} iconColor="#EF4444" delay={350} />
            <SettingRow icon="shield" label="Two-Factor Auth" value="Disabled" onPress={() => {}} iconColor="#F59E0B" delay={380} />
            <SettingRow icon="smartphone" label="Active Sessions" value="1 device" onPress={() => {}} iconColor="#3B82F6" delay={410} />
          </Section>

          <Section title="DATA & STORAGE">
            <SettingRow icon="download" label="Export Data" onPress={() => {}} iconColor="#14B8A6" delay={450} />
            <SettingRow icon="database" label="Storage Used" value={`${(projects.length * 2 + notes.length).toFixed(0)} KB`} delay={480} />
            <SettingRow icon="refresh-cw" label="Sync Status" value="Up to date" delay={510} />
          </Section>

          <Section title="ABOUT">
            <SettingRow icon="info" label="Version" value="1.0.0 (Build 1)" delay={550} />
            <SettingRow icon="star" label="Rate DevOS" onPress={() => {}} iconColor="#F59E0B" delay={580} />
            <SettingRow icon="help-circle" label="Help & Support" onPress={() => {}} iconColor="#3B82F6" delay={610} />
            <SettingRow icon="file-text" label="Privacy Policy" onPress={() => {}} delay={640} />
          </Section>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, { backgroundColor: '#EF444415', borderColor: '#EF444433', opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </Pressable>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>DevOS v1.0.0 · Made with ❤️ for developers</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center', overflow: 'hidden' },
  heroOrb1: { position: 'absolute', width: 220, height: 220, borderRadius: 999, backgroundColor: '#6366F114', top: -60, right: -50 },
  heroOrb2: { position: 'absolute', width: 180, height: 180, borderRadius: 999, backgroundColor: '#8B5CF610', bottom: -40, left: -60 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: { width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 34, fontFamily: 'Inter_700Bold', color: '#fff' },
  avatarEdit: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nameBlock: { alignItems: 'center', gap: 6, marginBottom: 20 },
  heroName: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.4 },
  heroEmail: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ffffff77' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginTop: 4 },
  roleDot: { width: 6, height: 6, borderRadius: 3 },
  roleText: { color: '#818CF8', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsStrip: { flexDirection: 'row', width: '100%', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#ffffff55', marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  settIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  settValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, padding: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  footer: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 20, marginBottom: 8 },
});
