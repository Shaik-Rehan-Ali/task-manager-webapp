import { useState } from 'react';
import { IconBtn } from './ui';
import { NOTE_COLOR_PALETTE, type Note } from '../types';
import type { NoteFormData } from '../store';

const colorHex = (c: number) => `#${(c >>> 0).toString(16).padStart(6, '0')}`;

export function NoteEditDialog({
  note,
  initialDate,
  onDismiss,
  onSave,
}: {
  note: Note | null;
  initialDate: string;
  onDismiss: () => void;
  onSave: (form: NoteFormData) => void;
}) {
  const isEditing = note != null;
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [date, setDate] = useState(note?.date ?? initialDate);
  const [colorTag, setColorTag] = useState<number>(note?.colorTag ?? NOTE_COLOR_PALETTE[0]);
  const [isPinned, setPinned] = useState(note?.isPinned ?? false);
  const [titleError, setTitleError] = useState(false);

  const submit = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onSave({ id: note?.id ?? 0, title, content, date, colorTag, isPinned });
  };

  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{isEditing ? 'Edit Note' : 'New Note'}</h2>
          <div style={{ display: 'flex' }}>
            <IconBtn
              name="push_pin"
              title={isPinned ? 'Unpin' : 'Pin'}
              filled={isPinned}
              onClick={() => setPinned(!isPinned)}
              style={{ color: isPinned ? 'var(--primary)' : undefined }}
            />
            <IconBtn name="close" title="Close" onClick={onDismiss} />
          </div>
        </div>

        <div className="dialog-body">
          <div className="field">
            <input
              className={`input ${titleError ? 'error' : ''}`}
              value={title}
              placeholder="e.g., Ideas for Project / Daily Reflection"
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              autoFocus
            />
            {titleError && <div className="input-error-msg">Title is required</div>}
          </div>

          <div className="field">
            <textarea
              className="input"
              value={content}
              placeholder="Write your thoughts, checklist, or daily summary here..."
              rows={5}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="field">
            <span className="section-label">Date</span>
            <input
              className="input"
              value={date}
              placeholder="YYYY-MM-DD"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="field">
            <span className="section-label">Color Accent</span>
            <div className="color-swatches">
              {NOTE_COLOR_PALETTE.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  className={`swatch ${colorTag === hex ? 'selected' : ''}`}
                  style={{ background: colorHex(hex) }}
                  onClick={() => setColorTag(hex)}
                  aria-label={`Color ${colorHex(hex)}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-outlined" onClick={onDismiss}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={submit}>
            {isEditing ? 'Update' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}