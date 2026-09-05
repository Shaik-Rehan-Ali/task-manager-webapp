import { useMemo, useState } from 'react';
import { Icon } from '../icons';
import { IconBtn } from './ui';
import { exportToJson, parseFromJson } from '../backup';
import type { Note, Task } from '../types';
import { useToast } from './ui';

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string): Promise<void> {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

// ---------- Export ----------
export function ExportDialog({
  tasks,
  notes,
  onDismiss,
}: {
  tasks: Task[];
  notes: Note[];
  onDismiss: () => void;
}) {
  const jsonString = useMemo(() => exportToJson(tasks, notes), [tasks, notes]);
  const [showToast, toast] = useToast();

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Task Manager Backup JSON',
          text: jsonString,
        });
      } else {
        await copyToClipboard(jsonString);
        showToast('JSON copied to clipboard!');
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="title-wrap">
            <span className="title-icon">
              <Icon name="file_upload" size={20} />
            </span>
            <h2>Export Data</h2>
          </div>
          <IconBtn name="close" title="Close" onClick={onDismiss} />
        </div>

        <div className="dialog-body">
          <div className="summary-chips">
            <div className="summary-chip">
              <div className="cap">Tasks</div>
              <div className="num">{tasks.length} items</div>
            </div>
            <div className="summary-chip">
              <div className="cap">Notes</div>
              <div className="num">{notes.length} items</div>
            </div>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <span className="section-label">JSON Data Preview</span>
            <div className="json-preview">{jsonString}</div>
          </div>
        </div>

        <div className="dialog-footer">
          <button
            type="button"
            className="btn btn-outlined"
            onClick={async () => {
              await copyToClipboard(jsonString);
              showToast('JSON copied to clipboard!');
            }}
          >
            <Icon name="content_copy" size={18} />
            Copy JSON
          </button>
          <button type="button" className="btn" onClick={share}>
            <Icon name="share" size={18} />
            Share Backup
          </button>
        </div>
        {toast}
      </div>
    </div>
  );
}

// ---------- Import ----------
export function ImportDialog({
  onDismiss,
  onImportConfirmed,
}: {
  onDismiss: () => void;
  onImportConfirmed: (tasks: Task[], notes: Note[], replaceExisting: boolean) => void;
}) {
  const [jsonInput, setJsonInput] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [showToast, toast] = useToast();

  const parseResult = useMemo(() => {
    if (!jsonInput.trim()) return null;
    try {
      return parseFromJson(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  const valid = parseResult != null && (parseResult.tasks.length > 0 || parseResult.notes.length > 0);

  const pasteClipboard = async () => {
    try {
      const text = await navigator.clipboard?.readText();
      if (text && text.trim()) {
        setJsonInput(text.trim());
        showToast('Pasted from clipboard');
      } else {
        showToast('Clipboard is empty');
      }
    } catch {
      showToast('Unable to read clipboard');
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="title-wrap">
            <span className="title-icon" style={{ background: 'color-mix(in srgb, var(--secondary-container) 60%, transparent)', color: 'var(--secondary)' }}>
              <Icon name="data_object" size={20} />
            </span>
            <h2>Import Data</h2>
          </div>
          <IconBtn name="close" title="Close" onClick={onDismiss} />
        </div>

        <div className="dialog-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="section-label" style={{ margin: 0 }}>
              Paste JSON Content
            </span>
            <button type="button" className="btn btn-outlined" style={{ padding: '6px 12px', fontSize: 13 }} onClick={pasteClipboard}>
              <Icon name="content_paste" size={16} />
              Paste Clipboard
            </button>
          </div>

          <textarea
            className="input"
            value={jsonInput}
            placeholder={'{\n  "tasks": [...],\n  "notes": [...]\n}'}
            rows={6}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
            onChange={(e) => setJsonInput(e.target.value)}
          />

          {jsonInput.trim() !== '' && (
            <div className={`status-box ${valid ? 'ok' : 'err'}`}>
              <Icon name={valid ? 'check_circle' : 'error'} size={20} style={{ flexShrink: 0 }} />
              {valid ? (
                <div>
                  <div className="msg" style={{ fontWeight: 700 }}>
                    Valid Backup JSON
                  </div>
                  <div className="sub">
                    Found {parseResult!.tasks.length} tasks and {parseResult!.notes.length} notes ready to import.
                  </div>
                </div>
              ) : (
                <div className="msg">Invalid JSON format. Please paste a valid Task Manager JSON backup.</div>
              )}
            </div>
          )}

          <div className="field" style={{ marginTop: 12 }}>
            <span className="section-label">Import Mode</span>
            <div className="flow-row">
              <button
                type="button"
                className={`select-tile ${!replaceExisting ? 'selected' : ''}`}
                onClick={() => setReplaceExisting(false)}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>Merge</div>
                  <div style={{ fontSize: 11, fontWeight: 400 }}>Keep current data</div>
                </div>
              </button>
              <button
                type="button"
                className={`select-tile ${replaceExisting ? 'selected' : ''}`}
                onClick={() => setReplaceExisting(true)}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>Replace All</div>
                  <div style={{ fontSize: 11, fontWeight: 400 }}>Overwrite data</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-outlined" onClick={onDismiss}>
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            disabled={!valid}
            onClick={() => {
              if (parseResult) {
                onImportConfirmed(parseResult.tasks, parseResult.notes, replaceExisting);
                showToast(
                  `Successfully imported ${parseResult.tasks.length} tasks & ${parseResult.notes.length} notes!`,
                );
              }
            }}
          >
            Import Data
          </button>
        </div>
        {toast}
      </div>
    </div>
  );
}