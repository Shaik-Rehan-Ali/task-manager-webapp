import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../icons';

// ---------- Confirm dialog ----------
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onDismiss }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" onClick={onDismiss}>
      <div className="dialog confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-outlined" onClick={onDismiss}>
            Cancel
          </button>
          <button className={`btn ${danger ? 'btn-danger-text' : ''}`} onClick={onConfirm} style={danger ? { background: 'var(--error)', color: 'var(--on-error)' } : undefined}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Toast ----------
export function useToast(): [(msg: string) => void, ReactNode] {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2400);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return [show, msg ? <div className="toast">{msg}</div> : null];
}

// ---------- Icon button ----------
export function IconBtn({
  name,
  onClick,
  title,
  tint = 'default',
  size = 20,
  filled,
  style,
}: {
  name: IconName;
  onClick?: () => void;
  title?: string;
  tint?: 'default' | 'primary' | 'error';
  size?: number;
  filled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      className={`icon-btn ${tint === 'primary' ? 'tint-primary' : ''} ${tint === 'error' ? 'tint-error' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      style={style}
    >
      <Icon name={name} size={size} filled={filled} />
    </button>
  );
}