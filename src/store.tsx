import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as db from './db';
import type {
  CategoryFilter,
  Note,
  StatusFilter,
  Tab,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStats,
  ThemeMode,
} from './types';
import { todayStr } from './types';

export interface TaskFormData {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: TaskPriority;
  category: TaskCategory;
  repeatEveryDayOfMonth: boolean;
}

export interface NoteFormData {
  id: number;
  title: string;
  content: string;
  date: string;
  colorTag: number;
  isPinned: boolean;
}

interface AppState {
  tasks: Task[];
  notes: Note[];
  tab: Tab;
  selectedDate: string | null;
  selectedCategory: CategoryFilter;
  statusFilter: StatusFilter;
  searchQuery: string;
  themeMode: ThemeMode;
  isAddEditTaskOpen: boolean;
  taskToEdit: Task | null;
  taskToDelete: Task | null;
  isClearCompletedOpen: boolean;
  isExportOpen: boolean;
  isImportOpen: boolean;
  isResetAllOpen: boolean;
}

interface AppStore extends AppState {
  stats: TaskStats;
  filteredTasks: Task[];
  setTab: (tab: Tab) => void;
  setDate: (date: string | null) => void;
  setCategory: (cat: CategoryFilter) => void;
  setStatusFilter: (f: StatusFilter) => void;
  setSearchQuery: (q: string) => void;
  setThemeMode: (m: ThemeMode) => void;
  openCreateTask: () => void;
  openEditTask: (t: Task) => void;
  dismissTaskDialog: () => void;
  saveTask: (form: TaskFormData) => Promise<void>;
  toggleTaskCompletion: (t: Task) => Promise<void>;
  promptDeleteTask: (t: Task) => void;
  confirmDeleteTask: () => Promise<void>;
  dismissDeletePrompt: () => void;
  promptClearCompleted: () => void;
  confirmClearCompleted: () => Promise<void>;
  dismissClearCompleted: () => void;
  promptResetAll: () => void;
  confirmResetAll: () => Promise<void>;
  dismissResetAll: () => void;
  saveNote: (form: NoteFormData) => Promise<void>;
  deleteNote: (n: Note) => Promise<void>;
  openExport: () => void;
  dismissExport: () => void;
  openImport: () => void;
  dismissImport: () => void;
  importData: (tasks: Task[], notes: Note[], replaceExisting: boolean) => Promise<void>;
}

const Ctx = createContext<AppStore | null>(null);

const THEME_KEY = 'task-manager-theme';
const TAB_KEY = 'task-manager-tab';

function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'DARK' || saved === 'LIGHT' || saved === 'SYSTEM') return saved;
  } catch {
    /* ignore */
  }
  return 'DARK'; // Android app defaults to DARK
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tab, setTabState] = useState<Tab>(() => {
    try {
      const saved = localStorage.getItem(TAB_KEY);
      if (saved === 'TASKS' || saved === 'NOTES' || saved === 'SETTINGS' || saved === 'ANALYSIS') return saved;
    } catch {
      /* ignore */
    }
    return 'TASKS';
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr());
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeModeState] = useState<ThemeMode>(loadTheme);
  const [isAddEditTaskOpen, setAddEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isClearCompletedOpen, setClearCompletedOpen] = useState(false);
  const [isExportOpen, setExportOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [isResetAllOpen, setResetAllOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ts, ns] = await Promise.all([db.loadAllTasks(), db.loadAllNotes()]);
      if (!cancelled) {
        setTasks(ts);
        setNotes(ns);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    try {
      localStorage.setItem(THEME_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  // --- Task actions (mirror TaskViewModel) ---
  const saveTask = useCallback(async (form: TaskFormData) => {
    const now = Date.now();
    if (form.id > 0) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === form.id
            ? {
                ...t,
                title: form.title.trim(),
                description: form.description.trim(),
                date: form.date,
                time: form.time.trim(),
                priority: form.priority,
                category: form.category,
                updatedAt: now,
              }
            : t,
        ),
      );
      const existing = await db.getTaskById(form.id);
      if (existing) {
        await db.updateTask({
          ...existing,
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          time: form.time.trim(),
          priority: form.priority,
          category: form.category,
          updatedAt: now,
        });
      }
    } else {
      if (form.repeatEveryDayOfMonth) {
        let parsed: Date;
        try {
          parsed = new Date(`${form.date}T00:00:00`);
        } catch {
          parsed = new Date();
        }
        const year = parsed.getFullYear();
        const month = parsed.getMonth();
        const lengthOfMonth = new Date(year, month + 1, 0).getDate();
        const created: Task[] = [];
        for (let day = 1; day <= lengthOfMonth; day++) {
          const dayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          created.push({
            id: 0,
            title: form.title.trim(),
            description: form.description.trim(),
            date: dayDate,
            time: form.time.trim(),
            priority: form.priority,
            category: form.category,
            isCompleted: false,
            createdAt: now,
            updatedAt: now,
          });
        }
        await db.insertTasks(created);
        setTasks(await db.loadAllTasks());
      } else {
        const newTask: Task = {
          id: 0,
          title: form.title.trim(),
          description: form.description.trim(),
          date: form.date,
          time: form.time.trim(),
          priority: form.priority,
          category: form.category,
          isCompleted: false,
          createdAt: now,
          updatedAt: now,
        };
        await db.insertTask(newTask);
        setTasks(await db.loadAllTasks());
      }
    }
    setAddEditTaskOpen(false);
    setTaskToEdit(null);
  }, []);

  const toggleTaskCompletion = useCallback(async (t: Task) => {
    const updated = { ...t, isCompleted: !t.isCompleted, updatedAt: Date.now() };
    setTasks((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    await db.updateTask(updated);
  }, []);

  const confirmDeleteTask = useCallback(async () => {
    if (taskToDelete == null) return;
    const id = taskToDelete.id;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTaskToDelete(null);
    await db.deleteTaskById(id);
  }, [taskToDelete]);

  const confirmClearCompleted = useCallback(async () => {
    setTasks((prev) => prev.filter((t) => !t.isCompleted));
    setClearCompletedOpen(false);
    await db.deleteCompletedTasks();
  }, []);

  // --- Note actions ---
  const saveNote = useCallback(async (form: NoteFormData) => {
    const now = Date.now();
    if (form.id > 0) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === form.id
            ? {
                ...n,
                title: form.title.trim(),
                content: form.content.trim(),
                date: form.date,
                colorTag: form.colorTag,
                isPinned: form.isPinned,
                updatedAt: now,
              }
            : n,
        ),
      );
      const existing = await db.getNoteById(form.id);
      if (existing) {
        await db.updateNote({
          ...existing,
          title: form.title.trim(),
          content: form.content.trim(),
          date: form.date,
          colorTag: form.colorTag,
          isPinned: form.isPinned,
          updatedAt: now,
        });
      }
    } else {
      const newNote: Note = {
        id: 0,
        title: form.title.trim(),
        content: form.content.trim(),
        date: form.date,
        colorTag: form.colorTag,
        isPinned: form.isPinned,
        createdAt: now,
        updatedAt: now,
      };
      await db.insertNote(newNote);
      setNotes(await db.loadAllNotes());
    }
  }, []);

  const deleteNote = useCallback(async (n: Note) => {
    setNotes((prev) => prev.filter((x) => x.id !== n.id));
    await db.deleteNoteById(n.id);
  }, []);

  // --- Data management ---
  const importData = useCallback(async (importedTasks: Task[], importedNotes: Note[], replaceExisting: boolean) => {
    if (replaceExisting) {
      await db.deleteAllTasks();
      await db.deleteAllNotes();
    }
    if (importedTasks.length > 0) await db.insertTasks(importedTasks);
    if (importedNotes.length > 0) await db.insertNotes(importedNotes);
    const [ts, ns] = await Promise.all([db.loadAllTasks(), db.loadAllNotes()]);
    setTasks(ts);
    setNotes(ns);
    setImportOpen(false);
  }, []);

  const confirmResetAll = useCallback(async () => {
    await Promise.all([db.deleteAllTasks(), db.deleteAllNotes()]);
    setTasks([]);
    setNotes([]);
    setResetAllOpen(false);
  }, []);

  // --- Derived state (mirrors ViewModel's combine + filter logic) ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = selectedDate == null || task.date === selectedDate;
      const matchesCategory = selectedCategory === 'ALL' || task.category === selectedCategory;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !task.isCompleted) ||
        (statusFilter === 'COMPLETED' && task.isCompleted);
      const matchesSearch =
        searchQuery.trim() === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [tasks, selectedDate, selectedCategory, statusFilter, searchQuery]);

  const stats: TaskStats = useMemo(() => {
    const today = todayStr();
    const todayTasks = tasks.filter((t) => t.date === today);
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.isCompleted).length;
    return {
      total,
      completed,
      pending: total - completed,
      completionPercentage: total > 0 ? completed / total : 0,
    };
  }, [tasks]);

  const value: AppStore = {
    tasks,
    notes,
    tab,
    selectedDate,
    selectedCategory,
    statusFilter,
    searchQuery,
    themeMode,
    isAddEditTaskOpen,
    taskToEdit,
    taskToDelete,
    isClearCompletedOpen,
    isExportOpen,
    isImportOpen,
    isResetAllOpen,
    stats,
    filteredTasks,
    setTab,
    setDate: setSelectedDate,
    setCategory: setSelectedCategory,
    setStatusFilter,
    setSearchQuery,
    setThemeMode,
    openCreateTask: () => {
      setTaskToEdit(null);
      setAddEditTaskOpen(true);
    },
    openEditTask: (t) => {
      setTaskToEdit(t);
      setAddEditTaskOpen(true);
    },
    dismissTaskDialog: () => {
      setAddEditTaskOpen(false);
      setTaskToEdit(null);
    },
    saveTask,
    toggleTaskCompletion,
    promptDeleteTask: setTaskToDelete,
    confirmDeleteTask,
    dismissDeletePrompt: () => setTaskToDelete(null),
    promptClearCompleted: () => setClearCompletedOpen(true),
    confirmClearCompleted,
    dismissClearCompleted: () => setClearCompletedOpen(false),
    promptResetAll: () => setResetAllOpen(true),
    confirmResetAll,
    dismissResetAll: () => setResetAllOpen(false),
    saveNote,
    deleteNote,
    openExport: () => setExportOpen(true),
    dismissExport: () => setExportOpen(false),
    openImport: () => setImportOpen(true),
    dismissImport: () => setImportOpen(false),
    importData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}