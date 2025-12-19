import React, { useMemo, useState } from 'react';
import type { AppSettings } from '../../types/leadWallet';
import SettingsTopBar from './SettingsTopBar';
import StickyActionBar from '../../components/ui/StickyActionBar';
import SettingsActionButton from '../../components/ui/SettingsActionButton';
import BottomSheet from '../../components/ui/BottomSheet';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';
import { getBrandedPrefixError, getDisplayLink, getShareUrl } from '../../utils/links';

type BrandingSettingsPageProps = {
  settings: AppSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings | null>>;
  canSave: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => Promise<void>;
  onDiscardChanges: () => void;
  statusText?: string;
  saveError: string | null;
  onRetrySave: () => Promise<void>;
  isLoadingSettings: boolean;
  loadError: string | null;
  onReloadSettings: () => Promise<void>;
};

const BrandingSettingsPage: React.FC<BrandingSettingsPageProps> = ({
  settings,
  setSettings,
  canSave,
  isSaving,
  isDirty,
  onSave,
  onDiscardChanges,
  statusText,
  saveError,
  onRetrySave,
  isLoadingSettings,
  loadError,
  onReloadSettings,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const inputClass =
    'w-full h-12 rounded-[var(--r-lg)] border border-border-subtle bg-bg-primary px-4 text-[13px] font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  const bannerButtonClass =
    'h-10 px-4 rounded-[var(--r-lg)] border border-border-subtle bg-bg-primary/50 text-[13px] font-semibold text-text-primary hover:bg-bg-primary/70 active:bg-bg-primary/80 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  const brandedPrefixError = useMemo(() => {
    if (!settings) return null;
    if (settings.linkDisplayMode !== 'branded') return null;
    return getBrandedPrefixError(settings.brandedPrefix);
  }, [settings]);

  const previewSlug = 'example';
  const previewDisplayLink = useMemo(() => {
    if (!settings) return null;
    return getDisplayLink({ slug: previewSlug, mode: settings.linkDisplayMode, brandedPrefix: settings.brandedPrefix });
  }, [settings]);

  const previewShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return getShareUrl({ origin: '', slug: previewSlug });
    return getShareUrl({ origin: window.location.origin, slug: previewSlug });
  }, []);

  return (
    <>
      <SettingsTopBar
        title="Branding"
        showBack
        statusText={statusText}
        onBack={() => {
          if (!isDirty) {
            navigate(-1);
            return;
          }
          setIsDiscardOpen(true);
        }}
      />
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-[calc(var(--sticky-bottom-offset)+6rem)] sm:px-6">
        <div className="space-y-4">
          {saveError && (
            <div className="rounded-[var(--r-section)] border border-border-subtle bg-bg-card p-4">
              <div className="text-[13px] leading-5 font-semibold text-alert">Save failed</div>
              <div className="mt-1 text-[12px] leading-4 text-text-secondary">{saveError}</div>
              <div className="mt-3">
                <button type="button" className={bannerButtonClass} onClick={() => void onRetrySave()}>
                  Retry save
                </button>
              </div>
            </div>
          )}

          {!isLoadingSettings && loadError && (
            <div className="rounded-[var(--r-section)] border border-border-subtle bg-bg-card p-4">
              <div className="text-[13px] leading-5 font-semibold text-alert">Couldn’t load settings</div>
              <div className="mt-1 text-[12px] leading-4 text-text-secondary">{loadError}</div>
              <div className="mt-3">
                <button type="button" className={bannerButtonClass} onClick={() => void onReloadSettings()}>
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoadingSettings || !settings ? (
          <div className="mt-4 space-y-6 animate-pulse">
            <section>
              <div className="h-3 w-16 rounded bg-border-subtle/60 mx-1" />
              <div className="mt-2 rounded-[var(--r-section)] border border-border-subtle bg-bg-card p-4">
                <div>
                  <div className="h-3 w-44 rounded bg-border-subtle/60" />
                  <div className="mt-2 h-12 rounded-[var(--r-lg)] bg-bg-primary/60" />
                </div>
                <div className="mt-4">
                  <div className="h-3 w-28 rounded bg-border-subtle/60" />
                  <div className="mt-2 h-20 rounded-[var(--r-lg)] bg-bg-primary/60" />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <section>
              <div className="kicker px-1">Links</div>
              <div className="mt-2 rounded-[var(--r-section)] border border-border-subtle bg-bg-card p-4">
                <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Link display style</label>
                <select
                  value={settings.linkDisplayMode}
                  onChange={(e) => setSettings({ ...settings, linkDisplayMode: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="classic">Classic</option>
                  <option value="branded">Branded</option>
                </select>

                <div className="mt-4">
                  <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Branded prefix</label>
                  <input
                    value={settings.brandedPrefix}
                    onChange={(e) => setSettings({ ...settings, brandedPrefix: e.target.value })}
                    placeholder="yourbrand"
                    className={inputClass}
                  />
                  <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">
                    Display only: <span className="font-semibold">{settings.brandedPrefix || 'yourbrand'}.leadwallet.app</span>
                  </div>
                  {brandedPrefixError && (
                    <div className="mt-2 text-[12px] leading-4 font-medium text-alert">{brandedPrefixError}</div>
                  )}
                </div>

                <div className="mt-5 rounded-[var(--r-lg)] border border-border-subtle bg-bg-primary px-4 py-3">
                  <div className="text-[12px] leading-4 font-semibold text-text-secondary">Preview</div>

                  <div className="mt-3">
                    <div className="text-[11px] leading-4 font-medium text-text-secondary/80">Displayed link</div>
                    <div className="mt-1 text-[13px] leading-5 font-semibold text-text-primary break-all">{previewDisplayLink}</div>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] leading-4 font-medium text-text-secondary/80">Copied / shared link</div>
                    <div className="mt-1 text-[13px] leading-5 font-semibold text-text-primary break-all">{previewShareUrl}</div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      className="h-12 w-full"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(previewShareUrl);
                          showToast('Link copied', 'success');
                        } catch {
                          showToast('Copy failed', 'error');
                        }
                      }}
                    >
                      Copy link
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="kicker px-1">Logo</div>
              <div className="mt-2 rounded-[var(--r-section)] border border-border-subtle bg-bg-card p-4">
                <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Logo URL (optional)</label>
                <input
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  placeholder="https://…"
                  className={inputClass}
                />
                <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">Shown on the lead capture page and pass.</div>
                {settings.logoUrl?.trim() && (
                  <div className="mt-4 rounded-[var(--r-lg)] border border-border-subtle bg-bg-primary px-4 py-3">
                    <div className="text-[12px] leading-4 font-semibold text-text-secondary">Preview</div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-[var(--r-lg)] border border-border-subtle bg-bg-card overflow-hidden">
                        <img
                          src={settings.logoUrl}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-[13px] leading-5 font-medium text-text-primary truncate">{settings.businessName || 'Your business'}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <StickyActionBar>
        <SettingsActionButton disabled={!isDirty || !canSave || isSaving} onClick={onSave}>
          {isSaving ? 'Saving…' : 'Save'}
        </SettingsActionButton>
      </StickyActionBar>

      <BottomSheet
        isOpen={isDiscardOpen}
        title="Discard changes?"
        onClose={() => setIsDiscardOpen(false)}
      >
        <div className="space-y-4">
          <div className="text-[13px] leading-5 text-text-secondary">
            You have unsaved changes. If you go back now, they’ll be lost.
          </div>
          <div className="grid gap-3">
            <SettingsActionButton variant="secondary" onClick={() => setIsDiscardOpen(false)}>
              Keep editing
            </SettingsActionButton>
            <SettingsActionButton
              variant="danger"
              onClick={() => {
                onDiscardChanges();
                setIsDiscardOpen(false);
                navigate(-1);
              }}
            >
              Discard changes
            </SettingsActionButton>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};

export default BrandingSettingsPage;
