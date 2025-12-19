import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ThemeMode } from './theme';
import { THEME_STORAGE_KEY, TOKENS } from './theme';

type ThemeOverride = ThemeMode | null;

type ThemeContextValue = {
  theme: ThemeMode;
  override: ThemeOverride;
  setOverride: (next: ThemeOverride) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readStoredOverride = (): ThemeOverride => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return null;
};

const writeStoredOverride = (next: ThemeOverride) => {
  try {
    if (!next) localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // ignore
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [override, setOverrideState] = useState<ThemeOverride>(() => {
    const stored = readStoredOverride();
    if (stored) return stored;
    try {
      const legacy = localStorage.getItem('theme');
      if (legacy === 'light' || legacy === 'dark') return legacy;
    } catch {
      // ignore
    }
    return null;
  });

  const [systemTheme, setSystemTheme] = useState<ThemeMode>(() => getSystemTheme());
  const hasOverride = Boolean(override);

  const theme = (override ?? systemTheme) as ThemeMode;

  const setOverride = useCallback((next: ThemeOverride) => {
    setOverrideState(next);
    writeStoredOverride(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const effective = (override ?? systemTheme) as ThemeMode;
    setOverride(effective === 'dark' ? 'light' : 'dark');
  }, [override, setOverride, systemTheme]);

  const systemThemeRef = useRef(systemTheme);
  useEffect(() => {
    systemThemeRef.current = systemTheme;
  }, [systemTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-color-scheme', theme);
    document.documentElement.setAttribute('data-theme', 'solar');

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute('content', TOKENS[theme].bg);

    if (!hasOverride) {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [hasOverride, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, override, setOverride, toggleTheme }),
    [override, setOverride, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
