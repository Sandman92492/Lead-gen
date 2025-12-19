import React, { useState } from 'react';
import type { AppSettings } from '../../types/leadWallet';
import SettingsTopBar from './SettingsTopBar';
import StickyActionBar from '../../components/ui/StickyActionBar';
import SettingsActionButton from '../../components/ui/SettingsActionButton';
import BottomSheet from '../../components/ui/BottomSheet';
import { useNavigate } from 'react-router-dom';

type OfferSettingsPageProps = {
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

const OfferSettingsPage: React.FC<OfferSettingsPageProps> = ({
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
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const inputClass =
    'w-full h-12 rounded-[14px] border border-border-subtle bg-bg-primary px-4 text-[13px] font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  const bannerButtonClass =
    'h-10 px-4 rounded-[14px] border border-border-subtle bg-bg-primary/50 text-[13px] font-semibold text-text-primary hover:bg-bg-primary/70 active:bg-bg-primary/80 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  return (
    <>
      <SettingsTopBar
        title="Offer & Pass"
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
            <div className="rounded-[22px] border border-border-subtle bg-bg-card p-4">
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
            <div className="rounded-[22px] border border-border-subtle bg-bg-card p-4">
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
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="grid gap-4">
                  <div>
                    <div className="h-3 w-28 rounded bg-border-subtle/60" />
                    <div className="mt-2 h-12 rounded-[14px] bg-bg-primary/60" />
                  </div>
                  <div>
                    <div className="h-3 w-56 rounded bg-border-subtle/60" />
                    <div className="mt-2 grid gap-3">
                      <div className="h-12 rounded-[14px] bg-bg-primary/60" />
                      <div className="h-12 rounded-[14px] bg-bg-primary/60" />
                      <div className="h-12 rounded-[14px] bg-bg-primary/60" />
                    </div>
                  </div>
                  <div>
                    <div className="h-3 w-44 rounded bg-border-subtle/60" />
                    <div className="mt-2 h-12 rounded-[14px] bg-bg-primary/60" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <section>
              <div className="kicker px-1">Offer</div>
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Offer title</label>
                    <input value={settings.offerTitle} onChange={(e) => setSettings({ ...settings, offerTitle: e.target.value })} className={inputClass} />
                    <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">Shown after a lead submits.</div>
                  </div>

                  <div className="grid gap-3">
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary">What happens next (3 bullets)</label>
                    {settings.offerBullets.map((bullet, idx) => (
                      <input
                        key={idx}
                        value={bullet}
                        onChange={(e) => {
                          const next = [...settings.offerBullets] as AppSettings['offerBullets'];
                          next[idx] = e.target.value;
                          setSettings({ ...settings, offerBullets: next });
                        }}
                        className={inputClass}
                      />
                    ))}
                    <div className="text-[12px] leading-4 text-text-secondary/80">Keep them short and clear.</div>
                  </div>

                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Pass validity (days)</label>
                    <input
                      value={String(settings.passValidityDays)}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          passValidityDays: Number.parseInt(e.target.value, 10) || settings.passValidityDays,
                        })
                      }
                      inputMode="numeric"
                      className={inputClass}
                    />
                    <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">How long a lead can claim the offer.</div>
                  </div>
                </div>
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

export default OfferSettingsPage;
