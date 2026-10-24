import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { useAuth } from './AuthContext';

interface ReviewedContextValue {
  isReviewed: (id: number) => boolean;
  markReviewed: (id: number) => void;
  reviewedIds: number[];
}

const ReviewedContext = createContext<ReviewedContextValue | null>(null);
const LIMIT = 500;

/** Roles you have opened, kept on this device, so new ones stand out and the daily goal is real. Mount with key={username}. */
export function ReviewedProvider({ children }: { children: ReactNode }) {
  const { username } = useAuth();
  const key = `ji.reviewed.${username ?? 'anon'}`;
  const [ids, setIds] = useState<number[]>(() => readJson<number[]>(key, []));

  const markReviewed = useCallback((id: number) => {
    setIds((current) => {
      if (current.includes(id)) return current;
      const next = [id, ...current].slice(0, LIMIT);
      writeJson(key, next);
      return next;
    });
  }, [key]);

  const value = useMemo<ReviewedContextValue>(() => {
    const set = new Set(ids);
    return { reviewedIds: ids, isReviewed: (id) => set.has(id), markReviewed };
  }, [ids, markReviewed]);

  return <ReviewedContext.Provider value={value}>{children}</ReviewedContext.Provider>;
}

export function useReviewed() {
  const ctx = useContext(ReviewedContext);
  if (!ctx) throw new Error('useReviewed must be used inside ReviewedProvider');
  return ctx;
}
