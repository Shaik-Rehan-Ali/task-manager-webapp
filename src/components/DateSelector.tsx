import { useMemo } from 'react';
import { Icon } from '../icons';
import { dateToStr } from '../types';

interface DateItem {
  dateString: string;
  dayOfWeek: string;
  dayOfMonth: string;
  isToday: boolean;
}

function buildItems(): DateItem[] {
  const today = new Date();
  const items: DateItem[] = [];
  for (let offset = -3; offset <= 10; offset++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    items.push({
      dateString: dateToStr(d),
      dayOfWeek: d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
      dayOfMonth: String(d.getDate()),
      isToday: offset === 0,
    });
  }
  return items;
}

export function DateSelector({
  selectedDate,
  onDateSelected,
}: {
  selectedDate: string | null;
  onDateSelected: (date: string | null) => void;
}) {
  const dateItems = useMemo(buildItems, []);
  return (
    <div className="date-bar">
      <button
        type="button"
        className={`date-all ${selectedDate === null ? 'selected' : ''}`}
        onClick={() => onDateSelected(null)}
      >
        <Icon name="calendar_month" size={20} />
        <span>All</span>
      </button>
      {dateItems.map((item) => (
        <button
          type="button"
          key={item.dateString}
          className={`date-item ${selectedDate === item.dateString ? 'selected' : ''} ${item.isToday ? 'today' : ''}`}
          onClick={() => onDateSelected(item.dateString)}
        >
          <span className="dow">{item.dayOfWeek}</span>
          <span className="dom">{item.dayOfMonth}</span>
          {item.isToday ? <span className="dot" /> : <span style={{ height: 4 }} />}
        </button>
      ))}
    </div>
  );
}