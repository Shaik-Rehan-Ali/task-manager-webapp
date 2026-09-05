import { Icon } from '../icons';
import type { TaskStats } from '../types';

export function StatsCard({ stats }: { stats: TaskStats }) {
  const pct = Math.round(stats.completionPercentage * 100);
  return (
    <div className="stats-card">
      <div className="stats-card-top">
        <div>
          <h2>Daily Progress (Today)</h2>
          <p>
            {stats.total === 0
              ? 'No tasks scheduled for today'
              : `${stats.completed} of ${stats.total} tasks completed today`}
          </p>
        </div>
        <span className="stats-percent">{pct}%</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="stat-pills">
        <div className="stat-pill">
          <span className="icon-wrap" style={{ background: 'color-mix(in srgb, var(--tertiary) 15%, transparent)', color: 'var(--tertiary)' }}>
            <Icon name="pending_actions" size={16} />
          </span>
          <div>
            <div className="label">Pending</div>
            <div className="value">{stats.pending}</div>
          </div>
        </div>
        <div className="stat-pill">
          <span className="icon-wrap" style={{ background: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)' }}>
            <Icon name="check_circle" size={16} />
          </span>
          <div>
            <div className="label">Completed</div>
            <div className="value">{stats.completed}</div>
          </div>
        </div>
      </div>
    </div>
  );
}