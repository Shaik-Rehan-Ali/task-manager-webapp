import { useApp } from '../store';
import { Icon, type IconName } from '../icons';
import { ConfirmDialog, useToast } from '../components/ui';
import type { ThemeMode } from '../types';

const REPO_URL = 'https://github.com/Shaik-Rehan-Ali/taskmanager.git';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'DARK', label: 'Dark', icon: 'dark_mode' },
  { value: 'LIGHT', label: 'Light', icon: 'light_mode' },
  { value: 'SYSTEM', label: 'System', icon: 'settings_brightness' },
];

export function Settings() {
  const {
    themeMode,
    setThemeMode,
    promptClearCompleted,
    promptResetAll,
    openExport,
    openImport,
  } = useApp();
  const [showToast, toast] = useToast();

  const copyRepo = async () => {
    try {
      await navigator.clipboard.writeText(REPO_URL);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Unable to copy link');
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-title">
          <h1>Settings</h1>
        </div>
      </header>

      <div className="settings-list">
        {/* Branding */}
        <div className="card-primary-tint settings-card">
          <div className="brand-row">
            <img src="/logo.svg" alt="App Logo" className="brand-logo" />
            <div>
              <p className="brand-name">Task Manager</p>
              <p className="brand-sub">Version 1.0.0 • Local IndexedDB Database</p>
              <span className="brand-badge">100% Offline &amp; Private</span>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="card settings-card">
          <h3 className="settings-section-title">
            <Icon name="palette" size={20} />
            Theme &amp; Appearance
          </h3>
          <div className="theme-row">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`theme-option ${themeMode === opt.value ? 'selected' : ''}`}
                onClick={() => setThemeMode(opt.value)}
              >
                <Icon name={opt.icon} size={20} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* GitHub repo */}
        <div className="card settings-card">
          <h3 className="settings-section-title">
            <Icon name="code" size={20} />
            GitHub Repository
          </h3>
          <div className="repo-url">{REPO_URL}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-outlined btn-block" onClick={copyRepo}>
              <Icon name="content_copy" size={16} />
              Copy Link
            </button>
            <button
              type="button"
              className="btn btn-block"
              onClick={() => window.open(REPO_URL, '_blank', 'noopener')}
            >
              <Icon name="open_in_browser" size={16} />
              Open Repo
            </button>
          </div>
        </div>

        {/* Data management */}
        <div className="card settings-card">
          <h3 className="settings-section-title">
            <Icon name="storage" size={20} />
            Database &amp; Maintenance
          </h3>
          <div className="settings-actions">
            <button type="button" className="btn btn-outlined btn-full" onClick={promptClearCompleted}>
              <Icon name="delete_sweep" size={18} />
              Clear Completed Tasks
            </button>
            <button type="button" className="btn btn-danger-outlined btn-full" onClick={promptResetAll}>
              <Icon name="delete_forever" size={18} />
              Reset All Data (Tasks &amp; Notes)
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-outlined btn-block" onClick={openExport}>
                <Icon name="file_download" size={16} />
                Export
              </button>
              <button type="button" className="btn btn-outlined btn-block" onClick={openImport}>
                <Icon name="file_upload" size={16} />
                Import
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card-variant-tint settings-card">
          <h3 className="settings-section-title" style={{ color: 'var(--outline)' }}>
            <Icon name="info" size={18} style={{ color: 'var(--outline)' }} />
            About App &amp; Developer
          </h3>
          <p className="about-text">
            Created by Shaik Rehan Ali
            <br />
            Built with React, Vite, and a Material 3 design system — a faithful web port of the Android
            Task Manager app, 100% offline with data stored locally in your browser.
          </p>
        </div>
      </div>

      {toast}

      <ClearCompletedConfirm />
      <ResetAllConfirm />
    </div>
  );
}

function ClearCompletedConfirm() {
  const { isClearCompletedOpen, confirmClearCompleted, dismissClearCompleted } = useApp();
  const [showToast, toast] = useToast();
  return (
    <>
      <ConfirmDialog
        open={isClearCompletedOpen}
        title="Clear Completed Tasks"
        message="Are you sure you want to remove all completed tasks?"
        confirmLabel="Clear All"
        danger
        onConfirm={() => {
          void confirmClearCompleted();
          showToast('Completed tasks cleared');
        }}
        onDismiss={dismissClearCompleted}
      />
      {toast}
    </>
  );
}

function ResetAllConfirm() {
  const { isResetAllOpen, confirmResetAll, dismissResetAll } = useApp();
  const [showToast, toast] = useToast();
  return (
    <>
      <ConfirmDialog
        open={isResetAllOpen}
        title="Reset All Data"
        message="This will permanently delete all tasks and all notes from your device. Are you sure?"
        confirmLabel="Reset Everything"
        danger
        onConfirm={() => {
          void confirmResetAll();
          showToast('All data reset');
        }}
        onDismiss={dismissResetAll}
      />
      {toast}
    </>
  );
}