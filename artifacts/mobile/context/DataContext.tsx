import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'completed' | 'archived' | 'paused';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  icon: string;
  progress: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface DataContextType {
  projects: Project[];
  notes: Note[];
  aiMessages: AIMessage[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, t: Omit<Task, 'id' | 'createdAt' | 'projectId'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addAIMessage: (m: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  clearAIMessages: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const PROJECTS_KEY = '@devos_projects';
const NOTES_KEY = '@devos_notes';
const AI_KEY = '@devos_ai';

const PROJECT_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#3B82F6', '#EF4444', '#14B8A6'];
const PROJECT_ICONS = ['code', 'folder', 'layers', 'zap', 'box', 'terminal', 'globe', 'database'];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [aiMessages, setAIMessages] = useState<AIMessage[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, n, a] = await Promise.all([
          AsyncStorage.getItem(PROJECTS_KEY),
          AsyncStorage.getItem(NOTES_KEY),
          AsyncStorage.getItem(AI_KEY),
        ]);
        if (p) setProjects(JSON.parse(p));
        if (n) setNotes(JSON.parse(n));
        if (a) setAIMessages(JSON.parse(a));
      } catch (_) {}
    })();
  }, []);

  async function persistProjects(next: Project[]) {
    setProjects(next);
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  }

  async function persistNotes(next: Note[]) {
    setNotes(next);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  async function persistAI(next: AIMessage[]) {
    setAIMessages(next);
    await AsyncStorage.setItem(AI_KEY, JSON.stringify(next));
  }

  function addProject(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) {
    const now = new Date().toISOString();
    const newP: Project = { ...p, id: uid(), tasks: [], createdAt: now, updatedAt: now };
    persistProjects([newP, ...projects]);
  }

  function updateProject(id: string, updates: Partial<Project>) {
    persistProjects(projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  }

  function deleteProject(id: string) {
    persistProjects(projects.filter(p => p.id !== id));
  }

  function addTask(projectId: string, t: Omit<Task, 'id' | 'createdAt' | 'projectId'>) {
    const task: Task = { ...t, id: uid(), projectId, createdAt: new Date().toISOString() };
    persistProjects(projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = [task, ...p.tasks];
      const done = tasks.filter(t => t.status === 'done').length;
      const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      return { ...p, tasks, progress, updatedAt: new Date().toISOString() };
    }));
  }

  function updateTask(projectId: string, taskId: string, updates: Partial<Task>) {
    persistProjects(projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      const done = tasks.filter(t => t.status === 'done').length;
      const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      return { ...p, tasks, progress, updatedAt: new Date().toISOString() };
    }));
  }

  function addNote(n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    persistNotes([{ ...n, id: uid(), createdAt: now, updatedAt: now }, ...notes]);
  }

  function updateNote(id: string, updates: Partial<Note>) {
    persistNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  }

  function deleteNote(id: string) {
    persistNotes(notes.filter(n => n.id !== id));
  }

  function addAIMessage(m: Omit<AIMessage, 'id' | 'timestamp'>) {
    const msg: AIMessage = { ...m, id: uid(), timestamp: new Date().toISOString() };
    const next = [...aiMessages, msg];
    persistAI(next);
  }

  function clearAIMessages() {
    persistAI([]);
  }

  return (
    <DataContext.Provider value={{
      projects, notes, aiMessages,
      addProject, updateProject, deleteProject,
      addTask, updateTask,
      addNote, updateNote, deleteNote,
      addAIMessage, clearAIMessages,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
