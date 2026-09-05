import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store';
import { Icon } from '../icons';
import { DateSelector } from '../components/DateSelector';
import { StatsCard } from '../components/StatsCard';
import { TaskCard } from '../components/TaskCard';
import { CATEGORY_FILTERS, CATEGORY_META } from '../types';

export function DailyTasks() {
  const {
    tasks,
    filteredTasks,
    selectedDate,
    selectedCategory,
    statusFilter,
    searchQuery,
    stats,
    setDate,
    setCategory,
    setStatusFilter,
    setSearchQuery,
    toggleTaskCompletion,
    openEditTask,
    promptDeleteTask,
    openCreateTask,
  } = useApp();

  const [searchExpanded, setSearchExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchExpanded) inputRef.current?.focus();
  }, [searchExpanded]);

  const closeSearch = () => {
    setSearchExpanded(false);
    setSearchQuery('');
  };

  return (
    <div className="page">
      {/* Top bar */}
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
                placeholder="Search tasks..."
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
              <img src="/logo.svg" alt="App Logo" className="topbar-logo" />
              <div>
                <h1>Daily Tasks</h1>
                <p className="subtitle">{filteredTasks.length} tasks active</p>
              </div>
            </div>
            <div className="topbar-actions">
              <button type="button" className="icon-btn" onClick={() => setSearchExpanded(true)} aria-label="Search tasks">
                <Icon name="search" size={24} />
              </button>
            </div>
          </>
        )}
      </header>

      <div className="scroll-list">
        <StatsCard stats={stats} />

        <DateSelector selectedDate={selectedDate} onDateSelected={setDate} />

        {/* Category filter chips */}
        <div className="chip-row">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${selectedCategory === cat ? 'selected' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat !== 'ALL' && <Icon name={CATEGORY_META[cat].icon} size={16} />}
              {cat === 'ALL' ? 'All' : CATEGORY_META[cat].label}
            </button>
          ))}
        </div>

        {/* Status tabs */}
        <div className="status-tabs">
          {(
            [
              { value: 'ALL', label: 'All' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map((f) => (
            <button
              key={f.value}
              type="button"
              className={`status-tab ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="section-header">
          <h3>{selectedDate == null ? 'All Tasks' : 'Scheduled Tasks'}</h3>
          <span>{filteredTasks.length} tasks</span>
        </div>

        {/* List or empty state */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="assignment_turned_in" size={40} />
            </div>
            <h3>{tasks.length === 0 ? 'No tasks yet!' : 'No matching tasks'}</h3>
            <p>
              {tasks.length === 0
                ? "Tap '+ Add Task' below to create and schedule your first activity."
                : 'Try changing your date, category, or search filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '5px 16px' }}>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => toggleTaskCompletion(task)}
                onEdit={() => openEditTask(task)}
                onDelete={() => promptDeleteTask(task)}
              />
            ))}
          </div>
        )}
      </div>

      <button type="button" className="fab" onClick={openCreateTask}>
        <Icon name="add" size={20} />
        Add Task
      </button>
    </div>
  );
}