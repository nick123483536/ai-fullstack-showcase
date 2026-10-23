import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface SavedJobsContextValue {
  /** Job ids in the order they were saved. */
  savedIds: number[];
  isSaved: (id: number) => boolean;
  toggleSave: (id: number) => void;
}

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

/** Saved jobs live on this device until the API has a saved-jobs endpoint. Mount with key={username}. */
export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const { username } = useAuth();
  const toast = useToast();
  const key = `ji.saved.${username ?? 'anon'}`;
  const [ids, setIds] = useState<number[]>(() => readJson<number[]>(key, []));

  const toggleSave = useCallback((id: number) => {
    const has = ids.includes(id);
    const next = has ? ids.filter((x) => x !== id) : [...ids, id];
    writeJson(key, next);
    setIds(next);
    toast(has ? 'Removed from saved jobs' : 'Saved to your list');
  }, [ids, key, toast]);

  const value = useMemo<SavedJobsContextValue>(() => ({
    savedIds: ids,
    isSaved: (id) => ids.includes(id),
    toggleSave,
  }), [ids, toggleSave]);

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) throw new Error('useSavedJobs must be used inside SavedJobsProvider');
  return ctx;
}
