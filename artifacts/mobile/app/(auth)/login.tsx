import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { GradientButton } from '@/components/ui/GradientButton';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const topInset = Platform.OS === 'web' ? 67 : 0;

  async function handleLogin() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/');
    } catch (_) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  }

  const inputStyle = [styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#05050A', '#0D0D20', '#05050A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, paddingTop: topInset }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Logo */}
            <View style={styles.logoRow}>
              <LinearGradient colors={[colors.primary, colors.accent]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name="terminal" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>DevOS</Text>
            </View>

            <Text style={styles.heading}>Welcome back</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>Sign in to your workspace</Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#ef444422', borderColor: '#ef444466' }]}>
                <Text style={{ color: '#ef4444', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{error}</Text>
              </View>
            ) : null}

            {/* Social buttons */}
            <View style={styles.socialRow}>
              {[
                { icon: 'github', label: 'GitHub' },
                { icon: 'google-circle', label: 'Google', lib: 'material' },
              ].map(s => (
                <Pressable
                  key={s.label}
                  style={[styles.socialBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  onPress={() => {}}
                >
                  <Feather name={s.icon as any} size={20} color={colors.foreground} />
                  <Text style={[styles.socialLabel, { color: colors.foreground }]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or continue with email</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Email */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Password */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                autoComplete="password"
              />
              <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Pressable style={styles.forgotRow}>
              <Text style={{ color: colors.primary, fontSize: 14, fontFamily: 'Inter_500Medium' }}>Forgot password?</Text>
            </Pressable>

            <GradientButton label="Sign In" onPress={handleLogin} loading={loading} size="lg" style={{ marginTop: 8 }} />

            <Pressable onPress={() => router.replace('/(auth)/register')} style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                No account? <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Create one</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 40 },
  logoBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  heading: { fontSize: 30, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 28 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderRadius: 12, paddingVertical: 13,
  },
  socialLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8, marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 12,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eyeBtn: { position: 'absolute', right: 16, padding: 4 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 20 },
});
