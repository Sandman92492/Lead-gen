import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getAppSettings, saveAppSettings } from '../services/leadWallet';
import type { AppSettings } from '../types/leadWallet';
import { getBrandedPrefixError } from '../utils/links';
import SettingsHubPage from './settings/SettingsHubPage';
import BusinessSetupSettingsPage from './settings/BusinessSetupSettingsPage';
import OfferSettingsPage from './settings/OfferSettingsPage';
import WhatsappTemplateSettingsPage from './settings/WhatsappTemplateSettingsPage';
import BrandingSettingsPage from './settings/BrandingSettingsPage';
import ExportSettingsPage from './settings/ExportSettingsPage';
import HelpSettingsPage from './settings/HelpSettingsPage';

const SettingsPage: React.FC<{ userEmail?: string; userPhotoURL?: string; onSignOut: () => void }> = ({
  userEmail,
  userPhotoURL,
  onSignOut,
}) => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const initialSnapshot = useRef<string | null>(null);
  const savedStatusTimeoutRef = useRef<number | null>(null);

  const loadSettings = async () => {
    setIsLoadingSettings(true);
    setLoadError(null);
    try {
      const s = await getAppSettings();
      setSettings(s);
      initialSnapshot.current = JSON.stringify(s);
    } catch {
      setSettings(null);
      setLoadError('Failed to load settings.');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    void loadSettings();
    return () => {
      if (savedStatusTimeoutRef.current) {
        window.clearTimeout(savedStatusTimeoutRef.current);
        savedStatusTimeoutRef.current = null;
      }
    };
  }, []);

  const canSave = useMemo(() => {
    if (!settings) return false;
    if (!settings.businessName.trim()) return false;
    if (!settings.whatsappNumber.trim()) return false;
    if (!settings.offerTitle.trim()) return false;
    if (settings.linkDisplayMode === 'branded' && getBrandedPrefixError(settings.brandedPrefix)) return false;
    return true;
  }, [settings]);

  const isDirty = useMemo(() => {
    if (!settings) return false;
    if (!initialSnapshot.current) return false;
    return JSON.stringify(settings) !== initialSnapshot.current;
  }, [settings]);

  const discardChanges = () => {
    if (!initialSnapshot.current) return;
    try {
      const next = JSON.parse(initialSnapshot.current) as AppSettings;
      setSettings(next);
    } catch {
      return;
    }
  };

  const onSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveAppSettings(settings);
      initialSnapshot.current = JSON.stringify(settings);
      showToast('Settings saved', 'success');

      setSavedStatus('Saved just now');
      if (savedStatusTimeoutRef.current) {
        window.clearTimeout(savedStatusTimeoutRef.current);
      }
      savedStatusTimeoutRef.current = window.setTimeout(() => {
        setSavedStatus(null);
        savedStatusTimeoutRef.current = null;
      }, 4000);
    } catch {
      showToast('Failed to save settings', 'error');
      setSaveError('Could not save settings. Check your connection/permissions and try again.');
      setSavedStatus(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Routes>
      <Route index element={<SettingsHubPage settings={settings} onSignOut={onSignOut} userEmail={userEmail} userPhotoURL={userPhotoURL} />} />
      <Route
        path="business"
        element={
          <BusinessSetupSettingsPage
            settings={settings}
            setSettings={setSettings}
            canSave={canSave}
            isSaving={isSaving}
            isDirty={isDirty}
            onSave={onSave}
            onDiscardChanges={discardChanges}
            statusText={savedStatus || undefined}
            saveError={saveError}
            onRetrySave={onSave}
            isLoadingSettings={isLoadingSettings}
            loadError={loadError}
            onReloadSettings={loadSettings}
          />
        }
      />
      <Route
        path="offer"
        element={
          <OfferSettingsPage
            settings={settings}
            setSettings={setSettings}
            canSave={canSave}
            isSaving={isSaving}
            isDirty={isDirty}
            onSave={onSave}
            onDiscardChanges={discardChanges}
            statusText={savedStatus || undefined}
            saveError={saveError}
            onRetrySave={onSave}
            isLoadingSettings={isLoadingSettings}
            loadError={loadError}
            onReloadSettings={loadSettings}
          />
        }
      />
      <Route
        path="whatsapp-template"
        element={
          <WhatsappTemplateSettingsPage
            settings={settings}
            setSettings={setSettings}
            canSave={canSave}
            isSaving={isSaving}
            isDirty={isDirty}
            onSave={onSave}
            onDiscardChanges={discardChanges}
            statusText={savedStatus || undefined}
            saveError={saveError}
            onRetrySave={onSave}
            isLoadingSettings={isLoadingSettings}
            loadError={loadError}
            onReloadSettings={loadSettings}
          />
        }
      />
      <Route
        path="branding"
        element={
          <BrandingSettingsPage
            settings={settings}
            setSettings={setSettings}
            canSave={canSave}
            isSaving={isSaving}
            isDirty={isDirty}
            onSave={onSave}
            onDiscardChanges={discardChanges}
            statusText={savedStatus || undefined}
            saveError={saveError}
            onRetrySave={onSave}
            isLoadingSettings={isLoadingSettings}
            loadError={loadError}
            onReloadSettings={loadSettings}
          />
        }
      />
      <Route path="export" element={<ExportSettingsPage />} />
      <Route path="help" element={<HelpSettingsPage />} />
      <Route path="*" element={<Navigate to="/settings" replace />} />
    </Routes>
  );
};

export default SettingsPage;
