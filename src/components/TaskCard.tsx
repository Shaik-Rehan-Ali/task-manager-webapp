import { CATEGORY_META, PRIORITY_META, type Task } from '../types';
import { Icon } from '../icons';
import { IconBtn } from './ui';

export function CategoryBadge({ category }: { category: Task['category'] }) {
  const meta = CATEGORY_META[category];
  return (
    <span className="badge badge-category">
      <Icon name={meta.icon} size={12} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className="badge badge-priority"
      style={{ '--badge-color': meta.color } as React.CSSProperties}
    >
      {meta.label}
    </span>
  );
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`task-card ${task.isCompleted ? 'completed' : ''}`}>
      <div className="task-card-top">
        <button
          type="button"
          className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.isCompleted && <Icon name="check" size={18} style={{ color: '#fff' }} />}
        </button>

        <div className="task-main" onClick={onEdit}>
          <p className="task-title">{task.title}</p>
          {task.description && <p className="task-desc">{task.description}</p>}
        </div>

        <div className="task-actions">
          <IconBtn name="edit" title="Edit task" tint="primary" onClick={onEdit} />
          <IconBtn name="delete" title="Delete task" tint="error" onClick={onDelete} />
        </div>
      </div>

      <div className="task-meta">
        <CategoryBadge category={task.category} />
        <PriorityBadge priority={task.priority} />
        <span className="spacer" />
        <span className="meta-text">
          <Icon name="calendar_today" size={14} />
          {task.date}
        </span>
        {task.time && (
          <span className="meta-text">
            <Icon name="schedule" size={14} />
            {task.time}
          </span>
        )}
      </div>
    </div>
  );
}