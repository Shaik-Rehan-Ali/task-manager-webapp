import type { Note } from '../types';
import { Icon } from '../icons';
import { IconBtn } from './ui';

export function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = `#${(note.colorTag >>> 0).toString(16).padStart(6, '0')}`;
  return (
    <div className="note-card">
      <div className="note-card-top">
        <div className="left">
          <span className="color-dot" style={{ background: accent }} />
          <span className="note-date">{note.date}</span>
          {note.isPinned && (
            <span className="pinned-badge">
              <Icon name="push_pin" size={12} filled />
              PINNED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          <IconBtn name="edit" title="Edit note" size={16} onClick={onEdit} />
          <IconBtn name="delete_outline" title="Delete note" size={16} tint="error" onClick={onDelete} />
        </div>
      </div>
      <p className="note-title" onClick={onEdit}>
        {note.title}
      </p>
      {note.content && (
        <p className="note-content" onClick={onEdit}>
          {note.content}
        </p>
      )}
    </div>
  );
}