import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../api';
import { errorMessage, isAbortError } from '../api/client';
import type { Job } from '../api/types';
import { readJson, writeJson } from '../lib/storage';
import { useToast } from './ToastContext';

export interface SyncRecord {
  at: number;
  fetched: number;
  durationMs: number;
  ok: boolean;
}

type LoadStatus = 'loading' | 'ready' | 'error';

interface WorkspaceContextValue {
  /** Every stored job, from GET /api/jobs. Used for the dashboard, analytics and filter options. */
  jobs: Job[];
  jobsStatus: LoadStatus;
  jobsError: string;
  reloadJobs: () => void;

  syncing: boolean;
  /** Syncs triggered from this browser (the API doesn't expose ingestion history). */
  syncHistory: SyncRecord[];
  lastSync: number | null;
  runSync: () => Promise<void>;
  syncModalOpen: boolean;
  setSyncModalOpen: (open: boolean) => void;
}

const HISTORY_KEY = 'ji.syncHistory';
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsStatus, setJobsStatus] = useState<LoadStatus>('loading');
  const [jobsError, setJobsError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState<SyncRecord[]>(() => readJson<SyncRecord[]>(HISTORY_KEY, []));
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setJobsStatus('loading');
    api.getAllJobs(ctrl.signal)
      .then((data) => {
        setJobs(data);
        setJobsStatus('ready');
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setJobsError(errorMessage(err));
        setJobsStatus('error');
      });
    return () => ctrl.abort();
  }, [reloadKey]);

  const reloadJobs = useCallback(() => setReloadKey((k) => k + 1), []);

  const runSync = useCallback(async () => {
    setSyncModalOpen(false);
    setSyncing(true);
    const started = Date.now();
    let record: SyncRecord;
    try {
      const ingested = await api.ingestFromSource();
      record = { at: started, fetched: ingested.length, durationMs: Date.now() - started, ok: true };
      toast(`Sync complete · ${ingested.length} roles fetched`);
      reloadJobs();
    } catch (err) {
      record = { at: started, fetched: 0, durationMs: Date.now() - started, ok: false };
      toast(`Sync failed: ${errorMessage(err)}`, 'error');
    }
    setSyncHistory((h) => {
      const next = [record, ...h].slice(0, 10);
      writeJson(HISTORY_KEY, next);
      return next;
    });
    setSyncing(false);
  }, [toast, reloadJobs]);

  const value = useMemo<WorkspaceContextValue>(() => ({
    jobs, jobsStatus, jobsError, reloadJobs,
    syncing, syncHistory,
    lastSync: syncHistory.find((r) => r.ok)?.at ?? null,
    runSync, syncModalOpen, setSyncModalOpen,
  }), [jobs, jobsStatus, jobsError, reloadJobs, syncing, syncHistory, runSync, syncModalOpen]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
