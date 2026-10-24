import type { ReactNode } from 'react';
import { Icon, type IconName } from '../components/Icon';
import { Brand } from '../components/ui';

const POINTS: [IconName, string, string][] = [
  ['sparkles', 'Fresh first', 'Roles from the last 24 hours stand out, so you apply while the list is short.'],
  ['layers', 'One list', 'Adzuna, Jobicy and Remotive listings in one place, searchable by title, city, company and type.'],
  ['bookmark', 'Kept for you', 'Save roles and come back to them before they close.'],
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-main">
        <Brand />
        <div className="auth-center">
          <div className="auth-form-wrap">{children}</div>
        </div>
        <div className="auth-foot">© {new Date().getFullYear()} Job Intelligence</div>
      </div>

      <aside className="auth-panel">
        <div className="auth-panel-inner">
          <h2>Indian tech jobs, the hour they're posted.</h2>
          <p className="auth-panel-lead">
            Job Intelligence pulls new listings from job APIs every hour and shows you what's fresh, so you apply early instead of late.
          </p>
          <ul className="auth-points stagger">
            {POINTS.map(([icon, title, desc]) => (
              <li key={title} className="auth-point">
                <span className="ico"><Icon name={icon} size={18} /></span>
                <div><b>{title}</b><span>{desc}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
