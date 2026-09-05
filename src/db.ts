// IndexedDB persistence, the web stand-in for the Android app's Room database.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Note, Task } from './types';

interface TaskManagerDB extends DBSchema {
  tasks: {
    key: number;
    value: Task;
    indexes: { 'by-date': string; 'by-completed': number };
  };
  notes: {
    key: number;
    value: Note;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<TaskManagerDB>> | null = null;

function getDB(): Promise<IDBPDatabase<TaskManagerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TaskManagerDB>('task_manager_db', 1, {
      upgrade(db) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        taskStore.createIndex('by-date', 'date');
        taskStore.createIndex('by-completed', 'isCompleted');
        const noteStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        noteStore.createIndex('by-date', 'date');
      },
    });
  }
  return dbPromise;
}

// --- Tasks ---
export async function loadAllTasks(): Promise<Task[]> {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  // Mirror TaskDao.getAllTasks() ordering: completed last, date asc, priority desc (HIGH first), id desc
  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    }
    return b.id - a.id;
  });
}

export async function insertTask(task: Task): Promise<number> {
  const db = await getDB();
  return (await db.add('tasks', task)) as number;
}

export async function insertTasks(tasks: Task[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  await Promise.all(tasks.map((t) => tx.store.add({ ...t, id: 0 })));
  await tx.done;
}

export async function updateTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteTaskById(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function deleteCompletedTasks(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  let cursor = await tx.store.openCursor();
  while (cursor) {
    if (cursor.value.isCompleted) await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function deleteAllTasks(): Promise<void> {
  const db = await getDB();
  await db.clear('tasks');
}

// --- Notes ---
export async function loadAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAll('notes');
  // Mirror NoteDao.getAllNotes(): pinned first, updatedAt desc
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export async function insertNote(note: Note): Promise<number> {
  const db = await getDB();
  return (await db.add('notes', note)) as number;
}

export async function insertNotes(notes: Note[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('notes', 'readwrite');
  await Promise.all(notes.map((n) => tx.store.add({ ...n, id: 0 })));
  await tx.done;
}

export async function updateNote(note: Note): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function deleteNoteById(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function deleteAllNotes(): Promise<void> {
  const db = await getDB();
  await db.clear('notes');
}

export async function getNoteById(id: number): Promise<Note | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}