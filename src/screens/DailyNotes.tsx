import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import { Icon } from '../icons';
import { NoteCard } from '../components/NoteCard';
import { NoteEditDialog } from '../components/NoteEditDialog';
import { ConfirmDialog } from '../components/ui';
import { todayStr, type Note } from '../types';

export function DailyNotes() {
  const { notes, saveNote, deleteNote } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const [isAddOpen, setAddOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = todayStr();

  useEffect(() => {
    if (searchExpanded) inputRef.current?.focus();
  }, [searchExpanded]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !filterTodayOnly || note.date === today;
      return matchesSearch && matchesDate;
    });
  }, [notes, searchQuery, filterTodayOnly, today]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const closeSearch = () => {
    setSearchExpanded(false);
    setSearchQuery('');
  };

  return (
    <div className="page">
      <header className="topbar">
        {searchExpanded ? (
          <>
            <button type="button" className="icon-btn" onClick={closeSearch} aria-label="Close search">
              <Icon name="arrow_back" size={24} />
            </button>
            <div className="search-field">
              <input
                ref={inputRef}
                value={searchQuery}
                placeholder="Search notes..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="icon-btn" onClick={() => setSearchQuery('')} aria-label="Clear text">
                  <Icon name="clear" size={20} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="topbar-title">
              <div>
                <h1>Daily Notes</h1>
                <p className="subtitle">{notes.length} total notes written</p>
              </div>
            </div>
            <div className="topbar-actions">
              <button type="button" className="icon-btn" onClick={() => setSearchExpanded(true)} aria-label="Search notes">
                <Icon name="search" size={24} />
              </button>
            </div>
          </>
        )}
      </header>

      <div className="scroll-list">
        {/* All / Today filter */}
        <div className="status-tabs">
          <button
            type="button"
            className={`status-tab ${!filterTodayOnly ? 'active' : ''}`}
            onClick={() => setFilterTodayOnly(false)}
          >
            All Notes ({notes.length})
          </button>
          <button
            type="button"
            className={`status-tab ${filterTodayOnly ? 'active' : ''}`}
            onClick={() => setFilterTodayOnly(true)}
          >
            Today ({today})
          </button>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="edit_note" size={44} />
            </div>
            <h3>{notes.length === 0 ? 'No notes written yet' : 'No matching notes found'}</h3>
            <p>
              {notes.length === 0
                ? "Capture your thoughts, reflections, daily meetings, or ideas by tapping 'New Note' below."
                : 'Try clearing your search query or switching date filters.'}
            </p>
            {notes.length === 0 && (
              <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => setAddOpen(true)}>
                <Icon name="add" size={18} />
                Create First Note
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '5px 16px' }}>
            {pinnedNotes.length > 0 && (
              <>
                <div className="section-header" style={{ justifyContent: 'flex-start', gap: 6 }}>
                  <Icon name="push_pin" size={16} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ color: 'var(--primary)' }}>Pinned Notes</h3>
                </div>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => setNoteToEdit(note)}
                    onDelete={() => setNoteToDelete(note)}
                  />
                ))}
              </>
            )}
            {otherNotes.length > 0 && (
              <>
                {pinnedNotes.length > 0 && (
                  <div className="section-header" style={{ justifyContent: 'flex-start' }}>
                    <h3>All Notes</h3>
                  </div>
                )}
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => setNoteToEdit(note)}
                    onDelete={() => setNoteToDelete(note)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <button type="button" className="fab" onClick={() => setAddOpen(true)}>
        <Icon name="add" size={20} />
        New Note
      </button>

      {isAddOpen && (
        <NoteEditDialog
          note={null}
          initialDate={today}
          onDismiss={() => setAddOpen(false)}
          onSave={(form) => {
            void saveNote(form);
            setAddOpen(false);
          }}
        />
      )}

      {noteToEdit && (
        <NoteEditDialog
          note={noteToEdit}
          initialDate={noteToEdit.date}
          onDismiss={() => setNoteToEdit(null)}
          onSave={(form) => {
            void saveNote(form);
            setNoteToEdit(null);
          }}
        />
      )}

      <ConfirmDialog
        open={noteToDelete != null}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title ?? ''}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (noteToDelete) void deleteNote(noteToDelete);
          setNoteToDelete(null);
        }}
        onDismiss={() => setNoteToDelete(null)}
      />
    </div>
  );
}