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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/');
    } catch {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  }

  function inputWrapStyle(field: string) {
    const active = focus === field;
    return [styles.inputWrap, {
      borderColor: active ? '#8B5CF6' : colors.border,
      backgroundColor: colors.card,
      shadowColor: active ? '#8B5CF6' : 'transparent',
    }];
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#05050A', '#100D22', '#05050A']} style={StyleSheet.absoluteFill} />
      <View style={styles.topOrb} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: botPad + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.backBtn}>
            <View style={[styles.backCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </View>
          </Pressable>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="user-plus" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.title}>Create account</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Start your developer journey today</Text>
          </Animated.View>

          {error ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBanner}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Name */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
            <View style={inputWrapStyle('name')}>
              <Feather name="user" size={16} color={focus === 'name' ? '#8B5CF6' : colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={name} onChangeText={setName}
                placeholder="Alex Developer"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                onFocus={() => setFocus('name')}
                onBlur={() => setFocus(null)}
              />
            </View>
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email address</Text>
            <View style={inputWrapStyle('email')}>
              <Feather name="mail" size={16} color={focus === 'email' ? '#8B5CF6' : colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={email} onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address" autoCapitalize="none"
                onFocus={() => setFocus('email')}
                onBlur={() => setFocus(null)}
              />
            </View>
          </Animated.View>

          {/* Password */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={inputWrapStyle('pw')}>
              <Feather name="lock" size={16} color={focus === 'pw' ? '#8B5CF6' : colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={password} onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                onFocus={() => setFocus('pw')}
                onBlur={() => setFocus(null)}
              />
              <Pressable onPress={() => setShowPw(!showPw)} hitSlop={12}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </Animated.View>

          <Text style={[styles.terms, { color: colors.mutedForeground }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: '#8B5CF6' }}>Terms</Text> &{' '}
            <Text style={{ color: '#8B5CF6' }}>Privacy Policy</Text>
          </Text>

          {/* Create button */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [styles.createBtn, { opacity: pressed || loading ? 0.8 : 1 }]}
            >
              <LinearGradient colors={['#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createGradient}>
                <Text style={styles.createText}>{loading ? 'Creating...' : 'Create Account'}</Text>
                {!loading && <Feather name="arrow-right" size={18} color="#fff" />}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28, alignItems: 'center' }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
              Already have an account?{'  '}
              <Text style={{ color: '#8B5CF6', fontFamily: 'Inter_600SemiBold' }}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 999, backgroundColor: '#8B5CF614', top: -80, left: -60 },
  content: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 24, alignSelf: 'flex-start' },
  backCircle: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 28 },
  logoBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: -0.7, marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EF444415', borderColor: '#EF444433', borderWidth: 1,
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  terms: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 24 },
  createBtn: { borderRadius: 16, overflow: 'hidden' },
  createGradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  createText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
