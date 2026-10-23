import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeSetting = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeSetting;
  isDark: boolean;
  setTheme: (theme: ThemeSetting) => void;
}

const THEME_KEY = 'ji.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): ThemeSetting {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'dark' || t === 'system' ? t : 'light';
  } catch {
    return 'light';
  }
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSetting>(readTheme);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  useEffect(() => {
    const mq = darkQuery();
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    isDark,
    setTheme: (t) => {
      setThemeState(t);
      try {
        localStorage.setItem(THEME_KEY, t);
      } catch {
        // ignore
      }
    },
  }), [theme, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
