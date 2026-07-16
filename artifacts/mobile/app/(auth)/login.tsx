import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

function SocialBtn({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon as any} size={18} color={colors.foreground} />
      <Text style={[styles.socialLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/');
    } catch {
      setError('Login failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#05050A', '#0D0D22', '#05050A']} style={StyleSheet.absoluteFill} />
      {/* Top orb */}
      <View style={styles.topOrb} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: botPad + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable onPress={() => router.replace('/(auth)/welcome')} style={styles.backBtn}>
            <View style={[styles.backCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </View>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="terminal" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to your workspace</Text>
          </Animated.View>

          {/* Error */}
          {error ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Social */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.socialRow}>
            <SocialBtn icon="github" label="GitHub" onPress={() => {}} />
            <SocialBtn icon="globe" label="Google" onPress={() => {}} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.divider}>
            <View style={[styles.divLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.divText, { color: colors.mutedForeground }]}>or email</Text>
            <View style={[styles.divLine, { backgroundColor: colors.border }]} />
          </Animated.View>

          {/* Fields */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email address</Text>
            <View style={[styles.inputWrap, {
              borderColor: emailFocus ? '#6366F1' : colors.border,
              backgroundColor: colors.card,
              shadowColor: emailFocus ? '#6366F1' : 'transparent',
            }]}>
              <Feather name="mail" size={16} color={emailFocus ? '#6366F1' : colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputWrap, {
              borderColor: pwFocus ? '#6366F1' : colors.border,
              backgroundColor: colors.card,
              shadowColor: pwFocus ? '#6366F1' : 'transparent',
            }]}>
              <Feather name="lock" size={16} color={pwFocus ? '#6366F1' : colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                autoComplete="password"
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
              />
              <Pressable onPress={() => setShowPw(!showPw)} hitSlop={12}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </Animated.View>

          <Pressable style={{ alignSelf: 'flex-end', marginBottom: 24, marginTop: 4 }}>
            <Text style={{ color: '#6366F1', fontSize: 13, fontFamily: 'Inter_500Medium' }}>Forgot password?</Text>
          </Pressable>

          {/* Sign in button */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [styles.signInBtn, { opacity: pressed || loading ? 0.8 : 1 }]}
            >
              <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.signInGradient}>
                {loading
                  ? <Text style={styles.signInText}>Signing in...</Text>
                  : <><Text style={styles.signInText}>Sign In</Text><Feather name="arrow-right" size={18} color="#fff" /></>
                }
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Pressable onPress={() => router.replace('/(auth)/register')} style={{ marginTop: 28, alignItems: 'center' }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
              No account yet?{'  '}
              <Text style={{ color: '#6366F1', fontFamily: 'Inter_600SemiBold' }}>Create one</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topOrb: {
    position: 'absolute', width: 350, height: 350, borderRadius: 999,
    backgroundColor: '#6366F114', top: -120, right: -80,
  },
  content: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 24, alignSelf: 'flex-start' },
  backCircle: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'flex-start', marginBottom: 28 },
  logoBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -0.7, marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EF444415',
    borderColor: '#EF444433', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 14, paddingVertical: 14 },
  socialLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 0,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  signInBtn: { borderRadius: 16, overflow: 'hidden' },
  signInGradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signInText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
