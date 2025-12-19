import { useEffect, useState } from 'react';
import type { AppSettings } from '../types/leadWallet';
import { DEFAULT_APP_SETTINGS, subscribeAppSettings } from '../services/leadWallet';

export const useAppSettings = (): { settings: AppSettings; isLoading: boolean; error: string | null } => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const unsub = subscribeAppSettings((next) => {
        setSettings(next);
        setIsLoading(false);
      });
      return () => {
        unsub();
      };
    } catch {
      setError('Failed to load settings.');
      setIsLoading(false);
      return;
    }
  }, []);

  return { settings, isLoading, error };
};
