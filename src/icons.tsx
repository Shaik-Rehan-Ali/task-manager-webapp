// Material Symbols icons rendered from the subset ligature fonts.
// Use `filled` for the selected/filled variant, otherwise outlined.

export type IconName =
  | 'task_alt'
  | 'edit_note'
  | 'settings'
  | 'analytics'
  | 'add'
  | 'search'
  | 'close'
  | 'arrow_back'
  | 'clear'
  | 'calendar_month'
  | 'calendar_today'
  | 'schedule'
  | 'event'
  | 'repeat'
  | 'title'
  | 'description'
  | 'check_circle'
  | 'pending_actions'
  | 'assignment_turned_in'
  | 'assignment'
  | 'category'
  | 'check'
  | 'business_center'
  | 'person'
  | 'school'
  | 'fitness_center'
  | 'shopping_cart'
  | 'edit'
  | 'delete'
  | 'delete_outline'
  | 'push_pin'
  | 'dark_mode'
  | 'light_mode'
  | 'settings_brightness'
  | 'palette'
  | 'storage'
  | 'delete_sweep'
  | 'delete_forever'
  | 'content_copy'
  | 'open_in_browser'
  | 'code'
  | 'info'
  | 'file_download'
  | 'file_upload'
  | 'share'
  | 'content_paste'
  | 'data_object'
  | 'error'
  | 'trending_up'
  | 'date_range'
  | 'hourglass_empty'
  | 'pie_chart';

interface IconProps {
  name: IconName;
  filled?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, filled = false, size = 24, className = '', style }: IconProps) {
  return (
    <span
      aria-hidden
      className={`mi ${filled ? 'mi-filled' : 'mi-outlined'} ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}