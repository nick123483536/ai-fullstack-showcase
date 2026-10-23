import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PostedWithin } from '../api/types';
import { readJson, writeJson } from '../lib/storage';
import { useAuth } from './AuthContext';

export interface Preferences {
  displayName: string;
  role: string;
  perPage: 10 | 20 | 50;
  defaultLocation: string;
  defaultPostedWithin: PostedWithin;
  notifications: { alerts: boolean; newJobs: boolean; ingestion: boolean };
}

const DEFAULTS: Preferences = {
  displayName: '',
  role: '',
  perPage: 10,
  defaultLocation: '',
  defaultPostedWithin: '',
  notifications: { alerts: true, newJobs: true, ingestion: false },
};

interface PreferencesContextValue {
  prefs: Preferences;
  /** Display name, falling back to the username from the token. */
  displayName: string;
  update: (patch: Partial<Preferences>) => void;
  /** /jobs URL with the default location and recency applied. */
  jobsUrl: string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/** Preferences are stored per user on this device; the API has no profile endpoint yet. Mount with key={username}. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { username } = useAuth();
  const key = `ji.prefs.${username ?? 'anon'}`;
  const [prefs, setPrefs] = useState<Preferences>(() => ({ ...DEFAULTS, ...readJson<Partial<Preferences>>(key, {}) }));

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      writeJson(key, next);
      return next;
    });
  }, [key]);

  const value = useMemo<PreferencesContextValue>(() => {
    const q = new URLSearchParams();
    if (prefs.defaultLocation) q.set('location', prefs.defaultLocation);
    if (prefs.defaultPostedWithin) q.set('postedWithin', prefs.defaultPostedWithin);
    const qs = q.toString();
    return {
      prefs,
      displayName: prefs.displayName.trim() || username || 'User',
      update,
      jobsUrl: qs ? `/jobs?${qs}` : '/jobs',
    };
  }, [prefs, username, update]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
