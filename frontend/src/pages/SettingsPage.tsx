import { useState, type CSSProperties, type ReactNode } from 'react';
import type { PostedWithin } from '../api/types';
import { Icon, type IconName } from '../components/Icon';
import { Pill, Select } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { usePreferences, type Preferences } from '../context/PreferencesContext';
import { useTheme, type ThemeSetting } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, initials, POSTED_OPTIONS, uniqueSorted } from '../lib/format';

type Tab = 'account' | 'security' | 'preferences' | 'notifications' | 'appearance';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'preferences', label: 'Preferences', icon: 'sliders' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'appearance', label: 'Appearance', icon: 'sun' },
];

function SectionHead({ title, desc, aside }: { title: string; desc: string; aside?: ReactNode }) {
  return (
    <div className="settings-head">
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      {aside}
    </div>
  );
}

function AccountSection() {
  const { username } = useAuth();
  const { prefs, displayName, update } = usePreferences();
  const toast = useToast();
  const [name, setName] = useState(prefs.displayName || username || '');
  const [role, setRole] = useState(prefs.role);

  return (
    <section className="card settings-section">
      <SectionHead title="Account" desc="Your profile information. Stored on this device." />
      <div className="settings-row">
        <div className="settings-row-label">Avatar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar" aria-hidden="true" style={{ width: 44, height: 44, fontSize: 15 }}>{initials(displayName)}</div>
          <span className="card-sub">Generated from your initials</span>
        </div>
      </div>
      <label className="settings-row">
        <div><div className="settings-row-label">Display name</div><div className="settings-row-hint">Shown in the sidebar</div></div>
        <input className="input input-sm" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="settings-row">
        <div><div className="settings-row-label">Username</div><div className="settings-row-hint">Used to sign in</div></div>
        <input className="input input-sm" value={username ?? ''} readOnly />
      </label>
      <label className="settings-row">
        <div><div className="settings-row-label">Role</div><div className="settings-row-hint">Shown under your name</div></div>
        <input className="input input-sm" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineer" />
      </label>
      <div className="card-foot">
        <button type="button" className="btn btn-md btn-primary" onClick={() => {
          update({ displayName: name.trim(), role: role.trim() });
          toast('Changes saved');
        }}>
          Save changes
        </button>
      </div>
    </section>
  );
}

function SecuritySection() {
  const { logout } = useAuth();
  return (
    <div className="settings-section" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section className="card">
        <SectionHead
          title="Password"
          desc="Password changes aren't supported by the API yet."
          aside={<Pill>Coming soon</Pill>}
        />
        {['Current password', 'New password', 'Confirm new password'].map((label) => (
          <label key={label} className="settings-row" style={{ padding: '16px 20px' }}>
            <div className="settings-row-label">{label}</div>
            <input type="password" className="input input-sm" autoComplete="new-password" disabled />
          </label>
        ))}
      </section>
      <section className="card">
        <SectionHead title="Session" desc="Authenticated with a JWT bearer token." />
        <div className="toggle-row" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Icon name="monitor" size={18} style={{ color: 'var(--text-3)' }} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="settings-row-label">This browser</div>
            <div className="settings-row-hint">Current session</div>
          </div>
          <button type="button" className="btn btn-md btn-danger-text" onClick={logout}>Sign out</button>
        </div>
      </section>
    </div>
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
    <section className="card settings-section">
      <SectionHead title="Preferences" desc="Defaults applied when you open Jobs from the sidebar." />
      <div className="settings-row">
        <div><div className="settings-row-label">Results per page</div><div className="settings-row-hint">Used by the Jobs list</div></div>
        <div role="radiogroup" aria-label="Results per page" className="segmented">
          {([10, 20, 50] as const).map((n) => (
            <button key={n} type="button" role="radio" aria-checked={prefs.perPage === n} onClick={() => save({ perPage: n })}>{n}</button>
          ))}
        </div>
      </div>
      <div className="settings-row">
        <div>
          <label htmlFor="ji-pref-loc" className="settings-row-label">Default location</label>
          <div className="settings-row-hint">Pre-filled on new searches</div>
        </div>
        <Select
          id="ji-pref-loc"
          value={prefs.defaultLocation}
          options={[{ value: '', label: 'No default' }, ...cities.map((c) => ({ value: c, label: c }))]}
          onChange={(v) => save({ defaultLocation: v })}
        />
      </div>
      <div className="settings-row">
        <div>
          <label htmlFor="ji-pref-posted" className="settings-row-label">Default recency</label>
          <div className="settings-row-hint">Posted within</div>
        </div>
        <Select
          id="ji-pref-posted"
          value={prefs.defaultPostedWithin}
          options={POSTED_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => save({ defaultPostedWithin: v as PostedWithin })}
        />
      </div>
    </section>
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
    <section className="card settings-section">
      <SectionHead title="Notifications" desc="Choose what you want to hear about." aside={<Pill>Delivery coming soon</Pill>} />
      {NOTIFICATIONS.map((n) => {
        const on = prefs.notifications[n.key];
        const id = `ji-n-${n.key}`;
        return (
          <div key={n.key} className="toggle-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div id={id} className="settings-row-label">{n.label}</div>
              <div className="settings-row-hint">{n.desc}</div>
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
    </section>
  );
}

const THEME_OPTIONS: { id: ThemeSetting; label: string; bg: string; side: string; line: string; border: string; line2: string }[] = [
  { id: 'light', label: 'Light', bg: '#f6f7f9', side: '#ffffff', line: '#d2d6dd', border: '#e3e6eb', line2: '#e3e6eb' },
  { id: 'dark', label: 'Dark', bg: '#0b0c10', side: '#121419', line: '#3a3f4c', border: '#242832', line2: '#242832' },
  { id: 'system', label: 'System', bg: 'linear-gradient(90deg,#f6f7f9 50%,#0b0c10 50%)', side: 'transparent', line: '#8a90a0', border: '#6b7180', line2: '#9aa0ad' },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  return (
    <section className="card settings-section">
      <SectionHead title="Appearance" desc="Select a theme for the interface." />
      <div role="radiogroup" aria-label="Theme" className="theme-grid">
        {THEME_OPTIONS.map((o) => (
          <button key={o.id} type="button" role="radio" className="theme-opt" aria-checked={theme === o.id} onClick={() => setTheme(o.id)}>
            <div aria-hidden="true" className="theme-preview" style={{ background: o.bg, borderColor: o.border } as CSSProperties}>
              <div className="theme-preview-side" style={{ background: o.side, borderColor: o.border }} />
              <div className="theme-preview-body">
                <span style={{ width: '60%', background: o.line }} />
                <span style={{ width: '85%', background: o.line2 }} />
                <span style={{ width: '40%', background: '#6366f1' }} />
              </div>
            </div>
            <div className="theme-opt-label"><span className="radio-dot" />{o.label}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account');

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-desc">Manage your account and workspace preferences.</p>
      </div>
      <div className="settings-layout">
        <nav aria-label="Settings sections" className="settings-nav">
          {TABS.map((t) => (
            <button key={t.id} type="button" className="nav-item" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} />{t.label}
            </button>
          ))}
        </nav>
        <div style={{ minWidth: 0 }}>
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
