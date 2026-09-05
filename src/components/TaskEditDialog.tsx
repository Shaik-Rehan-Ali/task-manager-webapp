import { useState } from 'react';
import { Icon } from '../icons';
import { IconBtn } from './ui';
import {
  CATEGORY_META,
  PRIORITY_META,
  dateToStr,
  type Task,
  type TaskCategory,
  type TaskPriority,
} from '../types';
import type { TaskFormData } from '../store';

const CATEGORIES: TaskCategory[] = ['PERSONAL', 'WORK', 'STUDY', 'HEALTH', 'SHOPPING', 'OTHER'];
const TIME_PRESETS = ['09:00 AM', '02:00 PM', '06:00 PM'];

export function TaskEditDialog({
  task,
  onDismiss,
  onSave,
}: {
  task: Task | null;
  onDismiss: () => void;
  onSave: (form: TaskFormData) => void;
}) {
  const isEditing = task != null;
  const today = dateToStr(new Date());
  const tomorrow = dateToStr(new Date(Date.now() + 86400000));

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [date, setDate] = useState(task?.date ?? today);
  const [time, setTime] = useState(task?.time ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'PERSONAL');
  const [repeatEveryDayOfMonth, setRepeat] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const toggleTime = (t: string) => setTime(time === t ? '' : t);

  const submit = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onSave({
      id: task?.id ?? 0,
      title,
      description,
      date,
      time,
      priority,
      category,
      repeatEveryDayOfMonth: !isEditing && repeatEveryDayOfMonth,
    });
  };

  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="title-wrap">
            <span className="title-icon">
              <Icon name={isEditing ? 'edit' : 'title'} size={20} />
            </span>
            <h2>{isEditing ? 'Edit task' : 'New task'}</h2>
          </div>
          <IconBtn name="close" title="Close" onClick={onDismiss} />
        </div>

        <div className="dialog-body">
          {/* Title */}
          <div className="field">
            <input
              className={`input ${titleError ? 'error' : ''}`}
              value={title}
              placeholder="e.g. Update design system documentation"
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              autoFocus
            />
            {titleError && <div className="input-error-msg">Title is required</div>}
          </div>

          {/* Description */}
          <div className="field">
            <textarea
              className="input"
              value={description}
              placeholder="Add additional details, notes, or steps..."
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Due date */}
          <div className="field">
            <span className="field-label">
              Due Date — {date || 'Select date'}
            </span>
            <div className="quick-chips" style={{ marginBottom: 8 }}>
              <button type="button" className={`quick-chip ${date === today ? 'selected' : ''}`} onClick={() => setDate(today)}>
                Today
              </button>
              <button type="button" className={`quick-chip ${date === tomorrow ? 'selected' : ''}`} onClick={() => setDate(tomorrow)}>
                Tomorrow
              </button>
            </div>
            <input
              className="input"
              value={date}
              placeholder="Date (YYYY-MM-DD)"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Schedule frequency */}
          {!isEditing && (
            <div className="field">
              <span className="section-label">Schedule Frequency</span>
              <div className="flow-row">
                <button
                  type="button"
                  className={`select-tile ${!repeatEveryDayOfMonth ? 'selected' : ''}`}
                  onClick={() => setRepeat(false)}
                >
                  <Icon name="event" size={18} />
                  Just selected day
                </button>
                <button
                  type="button"
                  className={`select-tile ${repeatEveryDayOfMonth ? 'selected' : ''}`}
                  onClick={() => setRepeat(true)}
                >
                  <Icon name="repeat" size={18} />
                  Every day of month
                </button>
              </div>
              {repeatEveryDayOfMonth && (
                <div className="info-hint">This task will be automatically created for all days of the month.</div>
              )}
            </div>
          )}

          {/* Time */}
          <div className="field">
            <span className="field-label">Time (Optional) — {time || 'No time set'}</span>
            <div className="quick-chips" style={{ marginBottom: 8 }}>
              {TIME_PRESETS.map((t) => (
                <button key={t} type="button" className={`quick-chip ${time === t ? 'selected' : ''}`} onClick={() => toggleTime(t)}>
                  {t}
                </button>
              ))}
            </div>
            <input
              className="input"
              value={time}
              placeholder="Custom Time (e.g. 10:30 AM)"
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="field">
            <span className="section-label">Priority</span>
            <div className="flow-row">
              {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`select-tile ${priority === p ? 'selected' : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="field">
            <span className="section-label">Category</span>
            <div className="flow-row">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`select-tile ${category === c ? 'selected' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  <Icon name={CATEGORY_META[c].icon} size={16} />
                  {CATEGORY_META[c].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn btn-outlined" onClick={onDismiss}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={submit}>
            <Icon name="edit" size={18} />
            {isEditing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}