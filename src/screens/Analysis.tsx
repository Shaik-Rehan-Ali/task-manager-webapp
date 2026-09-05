import { useMemo } from 'react';
import { useApp } from '../store';
import { Icon, type IconName } from '../icons';
import { CATEGORY_META, type TaskCategory } from '../types';
import type { DayProgress } from '../types';

function StatBox({ title, value, icon, tint, }: { title: string; value: string; icon: IconName; tint: string }) {
  return (
    <div className="stat-box">
      <Icon name={icon} size={18} style={{ color: tint }} />
      <div className="value">{value}</div>
      <div className="caption">{title}</div>
    </div>
  );
}

export function Analysis() {
  const { tasks, notes, openExport, openImport } = useApp();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(
    () => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    [today],
  );
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const monthName = today.toLocaleDateString(undefined, { month: 'long' });
  const weekdayLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // Today's analytics
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === todayStr), [tasks, todayStr]);
  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter((t) => t.isCompleted).length;
  const todayPending = todayTotal - todayCompleted;
  const todayRatio = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  // Month-to-date
  const monthTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.date);
        if (!m) return false;
        const y = Number(m[1]);
        const mo = Number(m[2]);
        const d = Number(m[3]);
        return y === currentYear && mo === currentMonth && d <= today.getDate();
      }),
    [tasks, currentYear, currentMonth, today],
  );
  const monthTotal = monthTasks.length;
  const monthCompleted = monthTasks.filter((t) => t.isCompleted).length;
  const monthRatio = monthTotal > 0 ? monthCompleted / monthTotal : 0;

  // Daily breakdown
  const daysInMonthToDate: DayProgress[] = useMemo(() => {
    const days: DayProgress[] = [];
    for (let day = 1; day <= today.getDate(); day++) {
      const dStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasks.filter((t) => t.date === dStr);
      days.push({
        dayNumber: day,
        dateStr: dStr,
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.isCompleted).length,
        completionRatio: dayTasks.length > 0 ? dayTasks.filter((t) => t.isCompleted).length / dayTasks.length : 0,
      });
    }
    return days;
  }, [tasks, currentYear, currentMonth, today]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const cats: TaskCategory[] = ['WORK', 'PERSONAL', 'STUDY', 'HEALTH', 'SHOPPING', 'OTHER'];
    return cats
      .map((cat) => {
        const catTasks = tasks.filter((t) => t.category === cat);
        return { cat, count: catTasks.length, completed: catTasks.filter((t) => t.isCompleted).length };
      })
      .filter((c) => c.count > 0);
  }, [tasks]);

  // Notes analytics
  const notesThisMonth = useMemo(
    () =>
      notes.filter((n) => {
        const m = /^(\d{4})-(\d{2})/.exec(n.date);
        return m && Number(m[1]) === currentYear && Number(m[2]) === currentMonth;
      }).length,
    [notes, currentYear, currentMonth],
  );

  const last14 = daysInMonthToDate.slice(-14);
  const heatColors = ['#10B981', 'var(--primary)', '#F59E0B'];

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-title">
          <img src="/logo.svg" alt="App Logo" className="topbar-logo" />
          <div>
            <h1>Analysis &amp; Insights</h1>
            <p className="subtitle">Productivity Intelligence</p>
          </div>
        </div>
      </header>

      <div className="analysis-list">
        {/* Today's progress */}
        <div className="card-primary-tint analysis-card">
          <div className="analysis-head">
            <div className="analysis-title">
              <span className="icon-circle">
                <Icon name="date_range" size={18} />
              </span>
              <div>
                <h3>Today's Progress</h3>
                <p>{weekdayLabel}</p>
              </div>
            </div>
            <span className="percent-tag">{Math.round(todayRatio * 100)}%</span>
          </div>

          <div className="progress-track" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${todayRatio * 100}%` }} />
          </div>

          <div className="stat-boxes">
            <StatBox title="Scheduled" value={String(todayTotal)} icon="calendar_month" tint="var(--primary)" />
            <StatBox title="Completed" value={String(todayCompleted)} icon="check_circle" tint="#10B981" />
            <StatBox title="Pending" value={String(todayPending)} icon="hourglass_empty" tint="#F59E0B" />
          </div>
        </div>

        {/* Month-to-date */}
        <div className="card analysis-card">
          <div className="analysis-head">
            <div className="analysis-title">
              <span className="icon-circle secondary">
                <Icon name="trending_up" size={18} />
              </span>
              <div>
                <h3>{monthName} (Month-to-Date)</h3>
                <p>
                  Days 1 – {today.getDate()} ({currentYear})
                </p>
              </div>
            </div>
            <span className="percent-tag secondary">{Math.round(monthRatio * 100)}%</span>
          </div>

          <div className="progress-track" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{ width: `${monthRatio * 100}%`, background: 'var(--secondary)' }} />
          </div>

          <div className="stat-boxes">
            <StatBox title="Month Total" value={String(monthTotal)} icon="analytics" tint="var(--secondary)" />
            <StatBox title="Completed" value={String(monthCompleted)} icon="assignment_turned_in" tint="#10B981" />
            <StatBox title="Notes Written" value={String(notesThisMonth)} icon="edit_note" tint="#8B5CF6" />
          </div>

          {last14.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 20 }}>
                Daily Activity Breakdown
              </div>
              <div className="heatmap">
                {last14.map((day) => {
                  const isToday = day.dayNumber === today.getDate();
                  const heightRatio = day.total === 0 ? 0.15 : 0.25 + day.completionRatio * 0.75;
                  const barColor =
                    day.total === 0
                      ? 'color-mix(in srgb, var(--outline-variant) 40%, transparent)'
                      : day.completed === day.total
                        ? heatColors[0]
                        : day.completed > 0
                          ? heatColors[1]
                          : heatColors[2];
                  return (
                    <div key={day.dateStr} className="heat-col">
                      <div className="heat-bar" style={{ height: `${40 * heightRatio}px`, background: barColor }} />
                      <div className={`heat-day ${isToday ? 'today' : ''}`}>{day.dayNumber}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Category distribution */}
        {categoryDistribution.length > 0 && (
          <div className="card analysis-card">
            <h3 className="settings-section-title">
              <Icon name="pie_chart" size={20} />
              Category Distribution
            </h3>
            {categoryDistribution.map(({ cat, count, completed }) => {
              const ratio = count > 0 ? completed / count : 0;
              return (
                <div key={cat} className="cat-progress-row">
                  <div className="row">
                    <span className="name">{CATEGORY_META[cat].label}</span>
                    <span className="count">
                      {completed} / {count} completed
                    </span>
                  </div>
                  <div className="progress-track slim">
                    <div className="progress-fill" style={{ width: `${ratio * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Data backup */}
        <div className="card-variant-tint analysis-card">
          <div className="analysis-title">
            <span className="icon-circle" style={{ background: 'var(--primary-container)', color: 'var(--primary)' }}>
              <Icon name="file_download" size={18} />
            </span>
            <div>
              <h3>Data Backup &amp; Migration</h3>
              <p>Export and import your tasks and notes seamlessly</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-block" onClick={openExport}>
              <Icon name="file_upload" size={18} />
              Export Data
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={openImport}>
              <Icon name="file_download" size={18} />
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}