import type { ReactNode } from 'react';
import { Icon, type IconName } from '../components/Icon';
import { Brand, Pill } from '../components/ui';

const FEATURES: { icon: IconName; title: string; desc: string; soon?: boolean }[] = [
  { icon: 'layers', title: 'Unified job discovery', desc: 'Listings from multiple providers, normalized into one schema.' },
  { icon: 'filter', title: 'Smart filtering', desc: 'Search by title, company, location, job type and recency.' },
  { icon: 'sparkles', title: 'AI-powered insights', desc: 'Resume matching and skill-gap analysis.', soon: true },
  { icon: 'db', title: 'Multiple job sources', desc: 'IndianAPI today — LinkedIn, Indeed and Naukri planned.' },
];

const PIPELINE = ['Sources', 'Ingestion', 'Normalization', 'Search', 'Intelligence'];

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
          <span className="eyebrow">Job data platform</span>
          <h2>Find better opportunities with intelligence.</h2>
          <p className="auth-panel-lead">
            Collect, search and — soon — analyze roles from every source you care about, in one workspace.
          </p>
          <div className="feature-list">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature">
                <div className="feature-icon"><Icon name={f.icon} /></div>
                <div className="stack" style={{ gap: 2 }}>
                  <div className="feature-title">
                    {f.title}
                    {f.soon && <Pill size="xs">Coming soon</Pill>}
                  </div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pipeline-mini">
            {PIPELINE.map((step, i) => (
              <span key={step} style={{ display: 'contents' }}>
                <span className={`step${i === PIPELINE.length - 1 ? ' is-planned' : ''}`}>{step}</span>
                {i < PIPELINE.length - 1 && <span aria-hidden="true">→</span>}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
