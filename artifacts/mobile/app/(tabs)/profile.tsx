import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import * as Haptics from 'expo-haptics';

function SettingRow({ icon, label, value, onPress, color, rightElement, delay = 0 }:
  { icon: string; label: string; value?: string; onPress?: () => void; color?: string; rightElement?: React.ReactNode; delay?: number }) {
  const colors = useColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <Pressable onPress={onPress} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.settingIcon, { backgroundColor: (color ?? colors.primary) + '22' }]}>
          <Feather name={icon as any} size={16} color={color ?? colors.primary} />
        </View>
        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
        {rightElement ?? (
          <View style={styles.settingRight}>
            {value && <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>}
            {onPress && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { projects, notes } = useData();
  const scheme = useColorScheme();
  const [notifs, setNotifs] = useState(true);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : 0;

  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === 'done').length, 0);
  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/welcome'); } },
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}
      >
        {/* Profile Header */}
        <LinearGradient colors={['#0D0D20', '#1A1A3E']} style={[styles.profileHeader, { paddingTop: topInset + 20 }]}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.avatarContainer}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Pressable style={[styles.avatarEdit, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={12} color="#fff" />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Developer'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role ?? 'Developer'}</Text>
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
            {[
              { value: projects.length.toString(), label: 'Projects' },
              { value: doneTasks.toString(), label: 'Done' },
              { value: notes.length.toString(), label: 'Notes' },
              { value: totalTasks.toString(), label: 'Tasks' },
            ].map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < 3 && { borderRightWidth: 1, borderRightColor: '#ffffff22' }]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </LinearGradient>

        {/* Settings */}
        <View style={[styles.settingsContainer, { backgroundColor: colors.background }]}>
          <SectionHeader title="Account" />
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow icon="user" label="Edit Profile" onPress={() => {}} delay={50} />
            <SettingRow icon="at-sign" label="Username" value="@developer" delay={100} />
            <SettingRow icon="calendar" label="Member Since" value={user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Today'} delay={150} />
          </View>

          <SectionHeader title="Appearance" />
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow icon="moon" label="Dark Mode" value={scheme === 'dark' ? 'On' : 'Off'} delay={200} />
            <SettingRow icon="type" label="Font Size" value="Medium" onPress={() => {}} delay={250} />
            <SettingRow icon="layout" label="Compact View" delay={300}
              rightElement={<Switch value={false} onValueChange={() => {}} thumbColor={colors.primary} trackColor={{ false: colors.border, true: colors.primary + '66' }} />}
            />
          </View>

          <SectionHeader title="Notifications" />
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow icon="bell" label="Push Notifications" delay={350}
              rightElement={<Switch value={notifs} onValueChange={v => { setNotifs(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} thumbColor={colors.primary} trackColor={{ false: colors.border, true: colors.primary + '66' }} />}
            />
            <SettingRow icon="mail" label="Email Digest" value="Weekly" onPress={() => {}} delay={400} />
          </View>

          <SectionHeader title="Security" />
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow icon="lock" label="Change Password" onPress={() => {}} delay={450} />
            <SettingRow icon="smartphone" label="Two-Factor Auth" value="Off" onPress={() => {}} delay={500} />
            <SettingRow icon="shield" label="Privacy Settings" onPress={() => {}} delay={550} />
          </View>

          <SectionHeader title="Data" />
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow icon="download" label="Export Data" onPress={() => {}} delay={600} />
            <SettingRow icon="database" label="Storage Used" value={`${(projects.length * 2 + notes.length * 1).toFixed(1)} MB`} delay={650} />
          </View>

          <SectionHeader title="About" />
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow icon="info" label="Version" value="1.0.0" delay={700} />
            <SettingRow icon="star" label="Rate DevOS" onPress={() => {}} delay={750} />
            <SettingRow icon="help-circle" label="Help & Support" onPress={() => {}} delay={800} />
          </View>

          {/* Logout */}
          <Pressable onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: '#ef444422', borderColor: '#ef444444' }]}>
            <Feather name="log-out" size={18} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {},
  profileHeader: { alignItems: 'center', paddingBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  avatarEdit: { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0D0D20' },
  userInfo: { alignItems: 'center', gap: 4, marginBottom: 20 },
  userName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.3 },
  userEmail: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ffffff88' },
  roleBadge: { backgroundColor: '#6366F122', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#6366F166', marginTop: 4 },
  roleText: { color: '#818CF8', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', width: '100%', paddingHorizontal: 24 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#ffffff66', marginTop: 2 },
  settingsContainer: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  settingsGroup: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 0 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, marginBottom: 8, padding: 16, borderRadius: 14, borderWidth: 1 },
  logoutText: { color: '#ef4444', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
