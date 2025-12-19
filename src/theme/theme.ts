export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'lw_theme';

export const COLORS = {
  primary: '#06B6B4', // More vibrant teal
  primaryDark: '#048A89',
  whatsapp: '#25D366',
  accent: '#F59E0B', // Warm amber for priorities
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const SHADOWS = {
  soft: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  medium: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  tactile: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgba(6, 182, 180, 0.3)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

export const ANIMATIONS = {
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
  smooth: { type: 'spring', stiffness: 260, damping: 20 },
  quick: { duration: 0.15 },
} as const;

export const TOKENS: Record<
  ThemeMode,
  { bg: string; surface: string; surface2: string; border: string; text: string; muted: string; card: string }
> = {
  light: {
    bg: '#F8FAFC',
    surface: '#F1F5F9',
    surface2: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    muted: '#64748B',
    card: '#FFFFFF',
  },
  dark: {
    bg: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surface2: '#0F172A',
    border: '#334155', // Slate 700
    text: '#F8FAFC',
    muted: '#94A3B8',
    card: '#1E293B',
  },
} as const;

