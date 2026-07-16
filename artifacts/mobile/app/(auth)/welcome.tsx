import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { GradientButton } from '@/components/ui/GradientButton';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'terminal',
    iconLib: 'feather' as const,
    title: 'Your Developer OS',
    subtitle: 'A unified command center for everything you build — projects, tasks, code, and team — all in one premium experience.',
    gradient: ['#0D0D20', '#1a1a3e', '#0D0D20'] as [string, string, string],
    accentGradient: ['#6366F1', '#8B5CF6'] as [string, string],
    dotColor: '#6366F1',
  },
  {
    id: '2',
    icon: 'robot',
    iconLib: 'material' as const,
    title: 'AI-Powered',
    subtitle: 'Your intelligent coding partner — explains code, generates solutions, fixes bugs, and thinks with you in real time.',
    gradient: ['#0D0D20', '#1a0a3e', '#0D0D20'] as [string, string, string],
    accentGradient: ['#8B5CF6', '#EC4899'] as [string, string],
    dotColor: '#8B5CF6',
  },
  {
    id: '3',
    icon: 'layers',
    iconLib: 'feather' as const,
    title: 'Build Without Limits',
    subtitle: 'Manage projects, track goals, collaborate with your team, and ship faster than ever before.',
    gradient: ['#0D0D20', '#0a1a3e', '#0D0D20'] as [string, string, string],
    accentGradient: ['#3B82F6', '#6366F1'] as [string, string],
    dotColor: '#3B82F6',
  },
];

function SlideIcon({ icon, iconLib, colors: grad }: { icon: string; iconLib: 'feather' | 'material'; colors: [string, string] }) {
  return (
    <View style={styles.iconContainer}>
      <LinearGradient colors={grad} style={styles.iconGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {iconLib === 'feather'
          ? <Feather name={icon as any} size={48} color="#fff" />
          : <MaterialCommunityIcons name={icon as any} size={52} color="#fff" />
        }
      </LinearGradient>
      {/* Glow effect */}
      <View style={[styles.glow, { backgroundColor: grad[0] + '33' }]} />
    </View>
  );
}

export default function WelcomeScreen() {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const topInset = Platform.OS === 'web' ? 67 : 0;

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });

  function goNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  }

  function skip() {
    router.replace('/(auth)/login');
  }

  const currentSlide = slides[activeIndex];

  return (
    <View style={styles.root}>
      <LinearGradient colors={currentSlide.gradient} style={StyleSheet.absoluteFill} />

      {/* Grid pattern overlay */}
      <View style={styles.gridOverlay} />

      <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
        {/* Skip button */}
        <Pressable onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        {/* Slides */}
        <FlatList
          ref={flatRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <View style={{ width, alignItems: 'center', paddingHorizontal: 32 }}>
              <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                <SlideIcon icon={item.icon} iconLib={item.iconLib} colors={item.accentGradient} />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </Animated.View>
            </View>
          )}
        />

        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, {
                width: i === activeIndex ? 24 : 8,
                backgroundColor: i === activeIndex ? s.dotColor : '#ffffff33',
              }]}
            />
          ))}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <GradientButton
            label={activeIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            onPress={goNext}
            size="lg"
            style={styles.cta}
          />
          <Pressable onPress={() => router.replace('/(auth)/register')} style={{ marginTop: 16 }}>
            <Text style={styles.registerText}>
              New here? <Text style={{ color: '#818CF8', fontFamily: 'Inter_600SemiBold' }}>Create account</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: 'transparent',
  },
  safeArea: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 12 },
  skipText: { color: '#ffffff88', fontSize: 15, fontFamily: 'Inter_500Medium' },
  iconContainer: { alignItems: 'center', marginBottom: 8, marginTop: height * 0.05 },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    width: 160,
    height: 60,
    borderRadius: 80,
    marginTop: -30,
    zIndex: -1,
  },
  textBlock: { alignItems: 'center', marginTop: 40 },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#ffffff88',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 24 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'web' ? 34 : 24 },
  cta: { width: '100%' },
  registerText: { textAlign: 'center', color: '#ffffff55', fontSize: 14, fontFamily: 'Inter_400Regular' },
});
