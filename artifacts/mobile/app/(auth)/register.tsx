import React, { useState } from 'react';
import {
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

export default function RegisterScreen() {
  const colors = useColors();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const topInset = Platform.OS === 'web' ? 67 : 0;

  async function handleRegister() {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/(tabs)/');
    } catch (_) {
      setError('Registration failed. Please try again.');
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
            {/* Back */}
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color="#ffffff88" />
            </Pressable>

            <View style={styles.logoRow}>
              <LinearGradient colors={[colors.primary, colors.accent]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name="terminal" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>DevOS</Text>
            </View>

            <Text style={styles.heading}>Create account</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>Start your developer journey</Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: '#ef444422', borderColor: '#ef444466' }]}>
                <Text style={{ color: '#ef4444', fontSize: 14, fontFamily: 'Inter_400Regular' }}>{error}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
            <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder="Alex Developer" placeholderTextColor={colors.mutedForeground} autoCapitalize="words" />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput style={inputStyle} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
              />
              <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Text style={[styles.terms, { color: colors.mutedForeground }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text>{' '}
              and <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>

            <GradientButton label="Create Account" onPress={handleRegister} loading={loading} size="lg" style={{ marginTop: 8 }} />

            <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: 'Inter_400Regular' }}>
                Already have an account? <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Sign in</Text>
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
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },
  backBtn: { padding: 8, marginBottom: 16, alignSelf: 'flex-start' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  heading: { fontSize: 30, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 28 },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 8, marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 12,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eyeBtn: { position: 'absolute', right: 16, padding: 4 },
  terms: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 20 },
});
