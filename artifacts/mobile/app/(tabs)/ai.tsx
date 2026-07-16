import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { useData, AIMessage } from '@/context/DataContext';
import * as Haptics from 'expo-haptics';

const SUGGESTIONS = [
  'Explain what async/await does in JavaScript',
  'Generate a REST API endpoint for user auth',
  'How do I optimize a React component for performance?',
  'Write a SQL query to find duplicate records',
  'Explain the difference between TCP and UDP',
];

const AI_RESPONSES: Record<string, string> = {
  default: "I'm your AI coding assistant. I can help you write code, explain concepts, debug issues, and more. What would you like to work on?",
  explain: "Great question! This concept works by breaking down complex operations into smaller, manageable steps. The key insight is that each part can be understood independently, then combined to form the complete solution.",
  generate: "Here's a clean implementation:\n\n```typescript\nexport async function handler(req: Request, res: Response) {\n  const { email, password } = req.body;\n  const user = await User.findByEmail(email);\n  if (!user || !user.verifyPassword(password)) {\n    return res.status(401).json({ error: 'Invalid credentials' });\n  }\n  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);\n  return res.json({ token, user });\n}\n```\n\nThis handles authentication securely with proper error handling.",
  optimize: "For better performance, consider:\n\n• **Memoization** — Use `useMemo` and `useCallback` to avoid unnecessary re-renders\n• **Lazy loading** — Split your bundle with `React.lazy()` and `Suspense`\n• **Virtual lists** — Replace large lists with FlatList or FlashList\n• **Code splitting** — Dynamic imports for routes and heavy components",
  debug: "Let me analyze this. Common causes for this issue:\n\n1. **State mutation** — Always create new objects/arrays instead of mutating\n2. **Async race conditions** — Use cleanup functions in useEffect\n3. **Stale closures** — Check your dependency arrays carefully\n4. **Memory leaks** — Cancel subscriptions when components unmount",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('how does')) return AI_RESPONSES.explain;
  if (lower.includes('generate') || lower.includes('write') || lower.includes('create')) return AI_RESPONSES.generate;
  if (lower.includes('optimize') || lower.includes('performance') || lower.includes('faster')) return AI_RESPONSES.optimize;
  if (lower.includes('debug') || lower.includes('fix') || lower.includes('error')) return AI_RESPONSES.debug;
  return AI_RESPONSES.default;
}

function MessageBubble({ message }: { message: AIMessage }) {
  const colors = useColors();
  const isUser = message.role === 'user';

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.bubbleRow, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isUser && (
        <LinearGradient colors={[colors.primary, colors.accent]} style={styles.aiBubbleAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Feather name="cpu" size={14} color="#fff" />
        </LinearGradient>
      )}
      <View style={[
        styles.bubble,
        isUser
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        { maxWidth: '80%' }
      ]}>
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.foreground }]}>{message.content}</Text>
        <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.6)' : colors.mutedForeground }]}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { aiMessages, addAIMessage, clearAIMessages } = useData();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  function sendMessage(text: string) {
    const msg = text.trim();
    if (!msg || isTyping) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    addAIMessage({ role: 'user', content: msg });
    setIsTyping(true);

    setTimeout(() => {
      addAIMessage({ role: 'assistant', content: getAIResponse(msg) });
      setIsTyping(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000 + Math.random() * 800);
  }

  const isEmpty = aiMessages.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={[colors.primary, colors.accent]} style={styles.headerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Feather name="cpu" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI Assistant</Text>
            <Text style={[styles.headerSub, { color: colors.success }]}>● Online</Text>
          </View>
        </View>
        {!isEmpty && (
          <Pressable onPress={clearAIMessages} style={[styles.clearBtn, { borderColor: colors.border }]}>
            <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.emptyIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="cpu" size={40} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>DevOS AI</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Your intelligent developer companion. Ask me anything about code, architecture, debugging, or best practices.</Text>

            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <Pressable key={i} onPress={() => sendMessage(s)} style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="zap" size={12} color={colors.primary} />
                  <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                  <Feather name="arrow-right" size={12} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={aiMessages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
            onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? (
              <View style={styles.typingRow}>
                <LinearGradient colors={[colors.primary, colors.accent]} style={styles.aiBubbleAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Feather name="cpu" size={14} color="#fff" />
                </LinearGradient>
                <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.typingText, { color: colors.mutedForeground }]}>AI is thinking...</Text>
                </View>
              </View>
            ) : null}
          />
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border, paddingBottom: bottomInset + 8, backgroundColor: colors.background }]}>
          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.foreground }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={2000}
              onSubmitEditing={() => sendMessage(input)}
            />
            <Pressable
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={[styles.sendBtn, { backgroundColor: input.trim() && !isTyping ? colors.primary : colors.border }]}
            >
              <Feather name="send" size={16} color={input.trim() && !isTyping ? '#fff' : colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 1 },
  clearBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginBottom: 12 },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  suggestions: { width: '100%', gap: 8 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  suggestionText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  messageList: { paddingHorizontal: 16, paddingTop: 16 },
  bubbleRow: { flexDirection: 'row', marginBottom: 14, gap: 8 },
  bubbleLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiBubbleAvatar: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  bubble: { borderRadius: 16, padding: 12 },
  bubbleText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  bubbleTime: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 6, alignSelf: 'flex-end' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: { borderRadius: 14, padding: 12, borderWidth: 1 },
  typingText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  inputContainer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderWidth: 1, borderRadius: 16, paddingLeft: 14, paddingRight: 8, paddingVertical: 8 },
  textInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', maxHeight: 120, paddingVertical: 4 },
  sendBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
