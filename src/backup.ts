// JSON export / import — mirrors the Android app's DataBackupManager so backups
// are interchangeable with the native app.
import type { Note, Task, TaskCategory, TaskPriority } from './types';
import { todayStr } from './types';

export interface BackupFile {
  version: number;
  appName: string;
  exportDate: string;
  tasksCount: number;
  notesCount: number;
  tasks: Task[];
  notes: Note[];
}

export function exportToJson(tasks: Task[], notes: Note[]): string {
  const root: BackupFile = {
    version: 1,
    appName: 'Task Manager',
    exportDate: new Date().toISOString(),
    tasksCount: tasks.length,
    notesCount: notes.length,
    tasks,
    notes,
  };
  return JSON.stringify(root, null, 2);
}

export interface ImportResult {
  tasks: Task[];
  notes: Note[];
  message: string;
}

function parsePriority(value: string): TaskPriority {
  try {
    const v = value.toUpperCase();
    if (v === 'LOW' || v === 'MEDIUM' || v === 'HIGH') return v;
  } catch {
    /* ignore */
  }
  return 'MEDIUM';
}

function parseCategory(value: string): TaskCategory {
  const valid: TaskCategory[] = ['WORK', 'PERSONAL', 'STUDY', 'HEALTH', 'SHOPPING', 'OTHER'];
  try {
    const v = value.toUpperCase() as TaskCategory;
    if (valid.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return 'PERSONAL';
}

export function parseFromJson(jsonString: string): ImportResult {
  const root = JSON.parse(jsonString.trim()) as Partial<BackupFile>;

  const parsedTasks: Task[] = [];
  if (Array.isArray(root.tasks)) {
    for (const t of root.tasks) {
      const title = String(t.title ?? '').trim();
      if (!title) continue;
      const date = String(t.date ?? '');
      parsedTasks.push({
        id: 0, // reset for re-indexing, same as Android
        title,
        description: String(t.description ?? ''),
        date: date ? date : todayStr(),
        time: String(t.time ?? ''),
        priority: parsePriority(String(t.priority ?? 'MEDIUM')),
        category: parseCategory(String(t.category ?? 'PERSONAL')),
        isCompleted: Boolean(t.isCompleted),
        createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
      });
    }
  }

  const parsedNotes: Note[] = [];
  if (Array.isArray(root.notes)) {
    for (const n of root.notes) {
      const title = String(n.title ?? '').trim();
      const content = String(n.content ?? '');
      if (!title && !content) continue;
      parsedNotes.push({
        id: 0,
        title,
        content,
        date: String(n.date ?? todayStr()),
        colorTag: typeof n.colorTag === 'number' ? n.colorTag : 0x6750a4,
        isPinned: Boolean(n.isPinned),
        createdAt: typeof n.createdAt === 'number' ? n.createdAt : Date.now(),
        updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
      });
    }
  }

  return {
    tasks: parsedTasks,
    notes: parsedNotes,
    message: `Parsed ${parsedTasks.length} tasks and ${parsedNotes.length} notes.`,
  };
}