import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '0',
    icon: 'terminal' as const,
    title: 'Your Developer OS',
    subtitle: 'A unified command center for everything you build — projects, tasks, code, and team.',
    bg1: '#050510',
    bg2: '#0D0D25',
    accent1: '#6366F1',
    accent2: '#8B5CF6',
    orb1: '#6366F133',
    orb2: '#8B5CF622',
  },
  {
    id: '1',
    icon: 'cpu' as const,
    title: 'AI-Powered Dev',
    subtitle: 'Your intelligent coding partner — explains, generates, fixes bugs, and thinks with you.',
    bg1: '#050510',
    bg2: '#150D25',
    accent1: '#8B5CF6',
    accent2: '#EC4899',
    orb1: '#8B5CF633',
    orb2: '#EC489922',
  },
  {
    id: '2',
    icon: 'layers' as const,
    title: 'Build Without Limits',
    subtitle: 'Manage projects, track goals, collaborate with your team, and ship faster than ever.',
    bg1: '#050510',
    bg2: '#0D1525',
    accent1: '#3B82F6',
    accent2: '#6366F1',
    orb1: '#3B82F633',
    orb2: '#6366F122',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SlideContent({ slide }: { slide: typeof slides[0] }) {
  return (
    <View style={{ width, alignItems: 'center', paddingHorizontal: 32 }}>
      {/* Icon with glow rings */}
      <View style={styles.iconWrapper}>
        {/* Outer glow ring */}
        <View style={[styles.glowRing, styles.glowRingOuter, { borderColor: slide.accent1 + '22' }]} />
        <View style={[styles.glowRing, styles.glowRingMid, { borderColor: slide.accent1 + '33' }]} />
        {/* Icon box */}
        <LinearGradient
          colors={[slide.accent1, slide.accent2]}
          style={styles.iconBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name={slide.icon} size={52} color="#FFFFFF" />
        </LinearGradient>
      </View>

      {/* Text */}
      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.textBlock}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const btnScale = useSharedValue(1);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  }

  function handlePressIn() {
    btnScale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }
  function handlePressOut() {
    btnScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }

  function goNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = activeIndex + 1;
    if (next < slides.length) {
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  }

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const slide = slides[activeIndex];

  return (
    <View style={styles.root}>
      <LinearGradient colors={[slide.bg1, slide.bg2]} style={StyleSheet.absoluteFill} />

      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orb1, { backgroundColor: slide.orb1 }]} />
      <View style={[styles.orb, styles.orb2, { backgroundColor: slide.orb2 }]} />

      {/* Grid overlay */}
      <View style={styles.grid} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View style={styles.logoRow}>
          <LinearGradient colors={[slide.accent1, slide.accent2]} style={styles.logoMark} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="terminal" size={14} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>DevOS</Text>
        </View>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        bounces={false}
        decelerationRate="fast"
      >
        {slides.map(s => (
          <SlideContent key={s.id} slide={s} />
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: botPad + 24 }]}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => {
                setActiveIndex(i);
                scrollRef.current?.scrollTo({ x: i * width, animated: true });
              }}
            >
              <View style={[
                styles.dot,
                {
                  width: i === activeIndex ? 28 : 8,
                  backgroundColor: i === activeIndex ? slide.accent1 : '#ffffff33',
                },
              ]} />
            </Pressable>
          ))}
        </View>

        {/* Main CTA */}
        <AnimatedPressable
          style={[btnStyle, styles.btnWrapper]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={goNext}
        >
          <LinearGradient
            colors={[slide.accent1, slide.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {activeIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Feather
              name={activeIndex === slides.length - 1 ? 'arrow-right' : 'chevron-right'}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </AnimatedPressable>

        {/* Register link */}
        <Pressable onPress={() => router.replace('/(auth)/register')} style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={styles.altText}>
            New here?{'  '}
            <Text style={[styles.altLink, { color: slide.accent1 }]}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: { width: 320, height: 320, top: -80, right: -80 },
  orb2: { width: 280, height: 280, bottom: 80, left: -100 },
  grid: { ...StyleSheet.absoluteFillObject, opacity: 0.03 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
  skipText: { color: '#ffffff55', fontSize: 14, fontFamily: 'Inter_500Medium' },
  iconWrapper: { alignItems: 'center', justifyContent: 'center', marginTop: height * 0.04, marginBottom: 8 },
  glowRing: { position: 'absolute', borderRadius: 9999, borderWidth: 1 },
  glowRingOuter: { width: 220, height: 220 },
  glowRingMid: { width: 175, height: 175 },
  iconBox: {
    width: 130, height: 130, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.6, shadowRadius: 32, elevation: 16,
  },
  textBlock: { alignItems: 'center', marginTop: 44 },
  slideTitle: {
    fontSize: 34, fontFamily: 'Inter_700Bold', color: '#FFFFFF',
    textAlign: 'center', letterSpacing: -0.8, marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16, fontFamily: 'Inter_400Regular', color: '#ffffff77',
    textAlign: 'center', lineHeight: 27, paddingHorizontal: 4,
  },
  bottom: { paddingHorizontal: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  btnWrapper: { borderRadius: 18, overflow: 'hidden' },
  btn: {
    height: 58, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  btnText: { color: '#fff', fontSize: 17, fontFamily: 'Inter_700Bold' },
  altText: { color: '#ffffff44', fontSize: 14, fontFamily: 'Inter_400Regular' },
  altLink: { fontFamily: 'Inter_600SemiBold' },
});
