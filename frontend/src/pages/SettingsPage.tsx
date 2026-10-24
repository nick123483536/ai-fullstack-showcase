import { useState, type ReactNode } from 'react';
import type { PostedWithin } from '../api/types';
import { Icon, type IconName } from '../components/Icon';
import { Pill, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { usePreferences, type Preferences } from '../context/PreferencesContext';
import { useTheme, type ThemeSetting } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, POSTED_OPTIONS, uniqueSorted } from '../lib/format';

type Tab = 'account' | 'security' | 'preferences' | 'notifications' | 'appearance';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'preferences', label: 'Preferences', icon: 'sliders' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'appearance', label: 'Appearance', icon: 'sun' },
];

/** One setting group: its name and help in the label column, its controls in the panel beside it. */
function Section({ title, desc, aside, children }: { title: string; desc: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="settings-section">
      <div>
        <h2>{title}{aside && <> {aside}</>}</h2>
        <p>{desc}</p>
      </div>
      <div className="settings-panel">{children}</div>
    </section>
  );
}

function AccountSection() {
  const { username } = useAuth();
  const { prefs, update } = usePreferences();
  const toast = useToast();
  const [name, setName] = useState(prefs.displayName || username || '');
  const [role, setRole] = useState(prefs.role);
  const dirty = name.trim() !== (prefs.displayName || username || '') || role.trim() !== prefs.role;

  return (
    <>
      <Section title="Profile" desc="How you appear in the sidebar. Stored on this device; the API has no profile endpoint yet.">
        <label className="field">
          <span className="field-label">Display name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Role</span>
          <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend engineer" />
        </label>
        <div className="panel-actions">
          <button type="button" className="btn btn-primary" disabled={!dirty} onClick={() => {
            update({ displayName: name.trim(), role: role.trim() });
            toast('Profile saved');
          }}>
            Save profile
          </button>
        </div>
      </Section>
      <Section title="Username" desc="Used to sign in. It can't be changed.">
        <label className="field">
          <span className="field-label">Username</span>
          <input className="input" value={username ?? ''} readOnly />
        </label>
      </Section>
    </>
  );
}

function SecuritySection() {
  const { logout } = useAuth();
  return (
    <>
      <Section title="Password" desc="The API doesn't support password changes yet, so these fields are read-only." aside={<Pill tone="warning">Not available</Pill>}>
        {['Current password', 'New password'].map((label) => (
          <label key={label} className="field">
            <span className="field-label">{label}</span>
            <input type="password" className="input" autoComplete="new-password" disabled placeholder="Not available yet" />
          </label>
        ))}
      </Section>
      <Section title="Session" desc="You're signed in on this browser with a token that expires on its own.">
        <div className="switch-row" style={{ alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div className="switch-title">This browser</div>
            <div className="switch-desc">Signing out removes the token from this device.</div>
          </div>
          <button type="button" className="btn btn-danger" onClick={logout}>Sign out</button>
        </div>
      </Section>
    </>
  );
}

function PreferencesSection() {
  const { prefs, update } = usePreferences();
  const { jobs } = useWorkspace();
  const toast = useToast();
  const cities = uniqueSorted(jobs.map((j) => city(j.location)));
  if (prefs.defaultLocation && !cities.includes(prefs.defaultLocation)) cities.push(prefs.defaultLocation);

  const save = (patch: Partial<Preferences>) => {
    update(patch);
    toast('Preference saved');
  };

  return (
    <Section title="Job search defaults" desc="Applied when you open Jobs from the sidebar. Each change saves as you make it.">
      <div className="field">
        <span className="field-label" id="ji-pref-pp">Results per page</span>
        <div role="radiogroup" aria-labelledby="ji-pref-pp" className="segmented">
          {([10, 20, 50] as const).map((n) => (
            <button key={n} type="button" role="radio" aria-checked={prefs.perPage === n} onClick={() => save({ perPage: n })}>{n}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="ji-pref-loc" className="field-label">Location</label>
        <Select
          id="ji-pref-loc"
          value={prefs.defaultLocation}
          options={[{ value: '', label: 'Anywhere' }, ...cities.map((c) => ({ value: c, label: c }))]}
          onChange={(v) => save({ defaultLocation: v })}
        />
      </div>
      <div className="field">
        <label htmlFor="ji-pref-posted" className="field-label">Posted within</label>
        <Select
          id="ji-pref-posted"
          value={prefs.defaultPostedWithin}
          options={POSTED_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => save({ defaultPostedWithin: v as PostedWithin })}
        />
      </div>
    </Section>
  );
}

const NOTIFICATIONS: { key: keyof Preferences['notifications']; label: string; desc: string }[] = [
  { key: 'alerts', label: 'Job alerts', desc: 'Matches for your saved searches.' },
  { key: 'newJobs', label: 'New job notifications', desc: 'When new roles arrive from your sources.' },
  { key: 'ingestion', label: 'Ingestion notifications', desc: 'When a sync completes or fails.' },
];

function NotificationsSection() {
  const { prefs, update } = usePreferences();
  return (
    <Section
      title="Notifications"
      desc="Your choices are kept, but nothing is delivered yet: the backend has no notification service."
      aside={<Pill tone="warning">Not delivered yet</Pill>}
    >
      {NOTIFICATIONS.map((n) => {
        const on = prefs.notifications[n.key];
        const id = `ji-n-${n.key}`;
        return (
          <div key={n.key} className="switch-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div id={id} className="switch-title">{n.label}</div>
              <div className="switch-desc">{n.desc}</div>
            </div>
            <button
              type="button"
              role="switch"
              className="switch"
              aria-checked={on}
              aria-labelledby={id}
              onClick={() => update({ notifications: { ...prefs.notifications, [n.key]: !on } })}
            >
              <span />
            </button>
          </div>
        );
      })}
    </Section>
  );
}

const THEME_OPTIONS: { id: ThemeSetting; label: string; halves: [string, string]; side: string; line: string; border: string }[] = [
  { id: 'light', label: 'Light', halves: ['#f4faf7', '#ffffff'], side: '#f4faf7', line: '#d8e0dc', border: '#e3e9e6' },
  { id: 'dark', label: 'Dark', halves: ['#050c09', '#0b1511'], side: '#050c09', line: '#24352d', border: '#1b2a23' },
  { id: 'system', label: 'System', halves: ['#f4faf7', '#0b1511'], side: 'transparent', line: '#8aa197', border: '#9aa8a2' },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <Section title="Theme" desc="System follows your device's light or dark setting.">
      <div role="radiogroup" aria-label="Theme" className="theme-grid">
        {THEME_OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" className="theme-opt" aria-checked={theme === o.id} onClick={() => setTheme(o.id)}>
            <div aria-hidden="true" className="theme-preview" style={{ borderColor: o.border, background: o.halves[0] }}>
              <div className="theme-preview-side" style={{ background: o.side, borderColor: o.border }} />
              <div className="theme-preview-body" style={{ background: o.halves[1] }}>
                <span style={{ width: '60%', background: o.line }} />
                <span style={{ width: '85%', background: o.line }} />
                <span style={{ width: '30%', background: '#10b981' }} />
              </div>
            </div>
            <div className="theme-opt-label">{o.label}</div>
          </button>
        ))}
      </div>
    </Section>
  );
}

const DESCRIPTIONS: Record<Tab, string> = {
  account: 'Your profile and sign-in name.',
  security: 'Password and the session on this browser.',
  preferences: 'Defaults for searching jobs.',
  notifications: 'What you want to hear about.',
  appearance: 'How the interface looks on this device.',
};

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account');
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumb">Settings</div>
          <h1 className="page-title">{current.label}</h1>
          <p className="page-desc">{DESCRIPTIONS[tab]}</p>
        </div>
      </div>
      <div className="settings-layout">
        <nav aria-label="Settings areas" className="settings-nav">
          {TABS.map((t) => (
            <button key={t.id} type="button" className="nav-item" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={16} strokeWidth={1.5} />{t.label}
            </button>
          ))}
        </nav>
        <div className="settings-area">
          {tab === 'account' && <AccountSection />}
          {tab === 'security' && <SecuritySection />}
          {tab === 'preferences' && <PreferencesSection />}
          {tab === 'notifications' && <NotificationsSection />}
          {tab === 'appearance' && <AppearanceSection />}
        </div>
      </div>
    </div>
  );
}
