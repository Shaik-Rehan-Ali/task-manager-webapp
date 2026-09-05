import { useEffect } from 'react';
import { AppProvider, useApp } from './store';
import { Icon, type IconName } from './icons';
import { TaskEditDialog } from './components/TaskEditDialog';
import { ExportDialog, ImportDialog } from './components/ExportImportDialogs';
import { ConfirmDialog } from './components/ui';
import { DailyTasks } from './screens/DailyTasks';
import { DailyNotes } from './screens/DailyNotes';
import { Settings } from './screens/Settings';
import { Analysis } from './screens/Analysis';
import type { Tab } from './types';

const TABS: { value: Tab; label: string; icon: IconName }[] = [
  { value: 'TASKS', label: 'daily tasks', icon: 'task_alt' },
  { value: 'NOTES', label: 'daily notes', icon: 'edit_note' },
  { value: 'SETTINGS', label: 'settings', icon: 'settings' },
  { value: 'ANALYSIS', label: 'analysis', icon: 'analytics' },
];

function Shell() {
  const app = useApp();
  const {
    tab,
    setTab,
    themeMode,
    isAddEditTaskOpen,
    taskToEdit,
    dismissTaskDialog,
    saveTask,
    taskToDelete,
    confirmDeleteTask,
    dismissDeletePrompt,
    isExportOpen,
    dismissExport,
    isImportOpen,
    dismissImport,
    importData,
    tasks,
    notes,
  } = app;

  // Apply theme to document
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveDark = themeMode === 'DARK' || (themeMode === 'SYSTEM' && prefersDark);
    document.documentElement.setAttribute('data-theme', effectiveDark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', effectiveDark ? '#1c1b1f' : '#fdfbff');
    }
  }, [themeMode]);

  return (
    <div className="app-shell">
      {tab === 'TASKS' && <DailyTasks />}
      {tab === 'NOTES' && <DailyNotes />}
      {tab === 'SETTINGS' && <Settings />}
      {tab === 'ANALYSIS' && <Analysis />}

      <nav className="nav-bar">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`nav-item ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            <span className="pill">
              <Icon name={t.icon} size={24} filled={tab === t.value} />
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Global: task add/edit dialog */}
      {isAddEditTaskOpen && (
        <TaskEditDialog
          task={taskToEdit}
          onDismiss={dismissTaskDialog}
          onSave={(form) => void saveTask(form)}
        />
      )}

      {/* Global: delete task confirmation */}
      <ConfirmDialog
        open={taskToDelete != null}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title ?? ''}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => void confirmDeleteTask()}
        onDismiss={dismissDeletePrompt}
      />

      {/* Global: export & import */}
      {isExportOpen && <ExportDialog tasks={tasks} notes={notes} onDismiss={dismissExport} />}
      {isImportOpen && (
        <ImportDialog
          onDismiss={dismissImport}
          onImportConfirmed={(ts, ns, replace) => void importData(ts, ns, replace)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}