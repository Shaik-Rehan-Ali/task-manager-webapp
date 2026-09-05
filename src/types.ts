// Type definitions mirroring the Android app's data model exactly
// (same field names and enum values so JSON backups stay cross-compatible).

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskCategory = 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH' | 'SHOPPING' | 'OTHER';
export type CategoryFilter = 'ALL' | TaskCategory;

export interface Task {
  id: number; // 0 when unsaved (Room auto-generates)
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM" or ""
  priority: TaskPriority;
  category: TaskCategory;
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: number; // 0 when unsaved
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  colorTag: number; // hex color (0x6750A4 etc.)
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type CategoryIcon =
  | 'business_center'
  | 'person'
  | 'school'
  | 'fitness_center'
  | 'shopping_cart'
  | 'assignment';

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: 'Low', color: '#81C784' },
  MEDIUM: { label: 'Medium', color: '#FFB74D' },
  HIGH: { label: 'High', color: '#E57373' },
};

export const CATEGORY_META: Record<TaskCategory, { label: string; icon: CategoryIcon }> = {
  WORK: { label: 'Work', icon: 'business_center' },
  PERSONAL: { label: 'Personal', icon: 'person' },
  STUDY: { label: 'Study', icon: 'school' },
  HEALTH: { label: 'Health', icon: 'fitness_center' },
  SHOPPING: { label: 'Shopping', icon: 'shopping_cart' },
  OTHER: { label: 'Other', icon: 'assignment' },
};

export const CATEGORY_FILTERS: CategoryFilter[] = ['ALL', 'WORK', 'PERSONAL', 'STUDY', 'HEALTH', 'SHOPPING', 'OTHER'];

export type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';
export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
];

export type Tab = 'TASKS' | 'NOTES' | 'SETTINGS' | 'ANALYSIS';

export type ThemeMode = 'DARK' | 'LIGHT' | 'SYSTEM';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionPercentage: number;
}

export interface DayProgress {
  dayNumber: number;
  dateStr: string;
  total: number;
  completed: number;
  completionRatio: number;
}

export const NOTE_COLOR_PALETTE = [
  0x6750a4, // Purple / Amethyst
  0x0284c7, // Ocean Blue
  0x059669, // Emerald Green
  0xd97706, // Warm Amber
  0xe11d48, // Rose Red
  0x4b5563, // Neutral Slate
];

export const dateToStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const todayStr = (): string => dateToStr(new Date());