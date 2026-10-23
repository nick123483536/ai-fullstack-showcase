import { useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><Icon name="logo" strokeWidth={2} /></div>
      <span className="brand-name">Job Intelligence</span>
    </div>
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="form-error">
      <Icon name="alert" size={15} strokeWidth={2} />
      {message}
    </div>
  );
}

export type Tone = 'success' | 'muted' | 'accent' | 'danger';

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`status tone-${tone}`}>{children}</span>;
}

export function Pill({ tone = 'muted', size, children }: { tone?: Tone; size?: 'xs'; children: ReactNode }) {
  return <span className={`pill tone-${tone}${size ? ' pill-xs' : ''}`}>{children}</span>;
}

export function SourceTag({ children }: { children: ReactNode }) {
  return <span className="source-tag">{children}</span>;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  highlight?: boolean;
  id?: string;
  'aria-label'?: string;
}

export function Select({ value, options, onChange, highlight, id, ...rest }: SelectProps) {
  return (
    <div className="select-wrap">
      <select
        id={id}
        aria-label={rest['aria-label']}
        className={`select${highlight ? ' is-active' : ''}`}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
        ))}
      </select>
      <Icon name="chevDown" size={14} strokeWidth={2} />
    </div>
  );
}

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} className="input has-trailing" />
      <button
        type="button"
        className="icon-btn-ghost input-trailing"
        style={{ width: 32, height: 32 }}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: 'default' | 'danger';
}

export function EmptyState({ icon, title, children, action, tone = 'default' }: EmptyStateProps) {
  const danger = tone === 'danger';
  return (
    <div className={`empty-state${danger ? ' is-solid' : ''}`} role={danger ? 'alert' : undefined}>
      <div className={`empty-icon${danger ? ' is-danger' : ''}`}><Icon name={icon} size={18} /></div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon="alert"
      tone="danger"
      title={title}
      action={
        <button type="button" className="btn btn-md" onClick={onRetry}>
          <Icon name="refresh" size={14} />Try again
        </button>
      }
    >
      {message}
    </EmptyState>
  );
}

const SKELETON_WIDTHS: [string, string][] = [['48%', '72%'], ['36%', '60%'], ['52%', '66%'], ['40%', '58%'], ['44%', '70%']];

export function JobListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="job-list" aria-busy="true" aria-label="Loading jobs">
      {SKELETON_WIDTHS.slice(0, rows).map(([w1, w2], i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-bar" style={{ width: 40, height: 40, borderRadius: 8, flex: 'none' }} />
          <div className="lines">
            <div className="skeleton-bar" style={{ height: 12, width: w1 }} />
            <div className="skeleton-bar" style={{ height: 10, width: w2 }} />
          </div>
          <div className="skeleton-bar hide-mobile" style={{ width: 150, height: 32, borderRadius: 7 }} />
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {SKELETON_WIDTHS.slice(0, rows).map(([w1, w2], i) => (
        <div key={i} className="list-row">
          <div className="skeleton-bar" style={{ width: 32, height: 32, borderRadius: 7, flex: 'none' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="skeleton-bar" style={{ height: 11, width: w1 }} />
            <div className="skeleton-bar" style={{ height: 9, width: w2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
