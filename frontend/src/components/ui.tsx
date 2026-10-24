import { useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import { initials } from '../lib/format';
import { Icon, type IconName } from './Icon';

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size, borderRadius: size * 0.3 }} aria-hidden="true">
      <Icon name="logo" size={Math.round(size * 0.52)} strokeWidth={2.2} />
    </span>
  );
}

export function Brand({ scope }: { scope?: string }) {
  return (
    <div className="brand">
      <BrandMark />
      <div className="brand-text fade">
        <span className="brand-name">Job Intelligence</span>
        {scope && <span className="brand-scope">{scope}</span>}
      </div>
    </div>
  );
}

// Light and dark tints for company initials, picked by a hash of the name so a company keeps its colour.
const TINTS: [string, string, string, string][] = [
  ['#fde3d6', '#9a3412', '#3b2116', '#fdba8c'],
  ['#d7f5e3', '#166534', '#13291c', '#86efac'],
  ['#dbe8ff', '#1e40af', '#172440', '#93c5fd'],
  ['#fef0c7', '#854d0e', '#30260e', '#fcd34d'],
  ['#e0f2fe', '#075985', '#10283a', '#7dd3fc'],
  ['#ede9fe', '#5b21b6', '#221a3a', '#c4b5fd'],
  ['#ccfbf1', '#115e59', '#0f2a28', '#5eead4'],
  ['#ffe4e6', '#9f1239', '#33171d', '#fda4af'],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function LogoTile({ name, size = 36 }: { name: string; size?: number }) {
  const { isDark } = useTheme();
  const t = TINTS[hash(name) % TINTS.length];
  return (
    <span
      className="logo-tile"
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: size * 0.28, fontSize: size * 0.36, background: isDark ? t[2] : t[0], color: isDark ? t[3] : t[1] }}
    >
      {initials(name).slice(0, 1)}
    </span>
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="form-error">
      <Icon name="alert" size={16} />
      {message}
    </div>
  );
}

export type Tone = 'positive' | 'negative' | 'warning' | 'info' | 'brand' | 'neutral';

export function Pill({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`pill tone-${tone}`}>{children}</span>;
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
      <Icon name="chevDown" size={15} />
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
        className="icon-btn sm input-trailing"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );
}

/** An empty block keeps the frame it sits in and says what to do next. */
export function EmptyBlock({ title, icon = 'inbox', children, action }: { title: string; icon?: IconName; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-block rise">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div className="actions">{action}</div>}
    </div>
  );
}

/** A failure stays inside the block that failed. */
export function ErrorLine({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-line" role="alert">
      <Icon name="alert" size={18} />
      <span>{message}</span>
      <button type="button" className="text-btn" onClick={onRetry}>Retry</button>
    </div>
  );
}
