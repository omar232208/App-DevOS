import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useData, Note } from '@/context/DataContext';
import { GradientButton } from '@/components/ui/GradientButton';
import * as Haptics from 'expo-haptics';

const NOTE_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#EF4444', '#14B8A6'];

function NoteModal({ note, onClose }: { note: Note | null; onClose: () => void }) {
  const colors = useColors();
  const { addNote, updateNote } = useData();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor] = useState(note?.color ?? NOTE_COLORS[0]);

  function handleSave() {
    if (!title.trim()) return;
    if (note) {
      updateNote(note.id, { title: title.trim(), content: content.trim(), color });
    } else {
      addNote({ title: title.trim(), content: content.trim(), color, tags: [], pinned: false });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} style={styles.modalClose}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{note ? 'Edit Note' : 'New Note'}</Text>
          <Pressable onPress={handleSave}>
            <Text style={{ color: colors.primary, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Save</Text>
          </Pressable>
        </View>

        {/* Color picker */}
        <View style={[styles.colorPickerRow, { borderBottomColor: colors.border }]}>
          {NOTE_COLORS.map(c => (
            <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: c === color ? 3 : 0, borderColor: '#fff' }]} />
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <TextInput
            style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
            value={title} onChangeText={setTitle}
            placeholder="Note title..."
            placeholderTextColor={colors.mutedForeground}
            fontSize={22}
          />
          <TextInput
            style={[styles.contentInput, { color: colors.foreground }]}
            value={content} onChangeText={setContent}
            placeholder="Start writing..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            fontSize={15}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

function NoteCard({ note, delay, onPress, onDelete }: { note: Note; delay: number; onPress: () => void; onDelete: () => void }) {
  const colors = useColors();
  const preview = note.content.slice(0, 80) + (note.content.length > 80 ? '...' : '');
  const d = new Date(note.updatedAt);
  const timeStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <Pressable
        onPress={onPress}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Delete Note', `Delete "${note.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
          ]);
        }}
        style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.noteColorBar, { backgroundColor: note.color }]} />
        <View style={{ flex: 1, padding: 14 }}>
          <View style={styles.noteHeader}>
            <Text style={[styles.noteTitle, { color: colors.foreground }]} numberOfLines={1}>{note.title}</Text>
            {note.pinned && <Feather name="bookmark" size={14} color={note.color} />}
          </View>
          {preview ? <Text style={[styles.notePreview, { color: colors.mutedForeground }]} numberOfLines={2}>{preview}</Text> : null}
          <Text style={[styles.noteDate, { color: colors.mutedForeground }]}>{timeStr}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notes, deleteNote } = useData();
  const [search, setSearch] = useState('');
  const [editNote, setEditNote] = useState<Note | null | undefined>(undefined); // undefined = closed
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(n => n.pinned);
  const rest = filtered.filter(n => !n.pinned);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Notes</Text>
        <Pressable onPress={() => setEditNote(null)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search} onChangeText={setSearch}
            placeholder="Search notes..." placeholderTextColor={colors.mutedForeground}
          />
          {search ? <Pressable onPress={() => setSearch('')}><Feather name="x" size={16} color={colors.mutedForeground} /></Pressable> : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 120 : 100 }]} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <LinearGradient colors={[colors.accent, colors.primary]} style={styles.emptyIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="edit-3" size={32} color="#fff" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {search ? 'Try a different search term' : 'Capture your ideas, snippets, and thoughts'}
            </Text>
            {!search && (
              <GradientButton label="Create Note" onPress={() => setEditNote(null)} style={{ marginTop: 20, paddingHorizontal: 24 }} />
            )}
          </View>
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Pinned</Text>
                {pinned.map((n, i) => <NoteCard key={n.id} note={n} delay={i * 60} onPress={() => setEditNote(n)} onDelete={() => deleteNote(n.id)} />)}
              </>
            )}
            {rest.length > 0 && (
              <>
                {pinned.length > 0 && <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>All Notes</Text>}
                {rest.map((n, i) => <NoteCard key={n.id} note={n} delay={i * 60} onPress={() => setEditNote(n)} onDelete={() => deleteNote(n.id)} />)}
              </>
            )}
          </>
        )}
      </ScrollView>

      {editNote !== undefined && (
        <NoteModal note={editNote} onClose={() => setEditNote(undefined)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  pageTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchRow: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  list: { padding: 20, gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  noteCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  noteColorBar: { width: 4 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  noteTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  notePreview: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 8 },
  noteDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalClose: { padding: 4 },
  modalTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  colorPickerRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  titleInput: { fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 16, borderBottomWidth: 1, paddingBottom: 12 },
  contentInput: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 26, minHeight: 300 },
});
