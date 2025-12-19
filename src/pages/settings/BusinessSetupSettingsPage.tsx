import React, { useMemo, useState } from 'react';
import type { AppSettings } from '../../types/leadWallet';
import { industryPresets, type IndustryPresetKey } from '../../config/industryPresets';
import SettingsTopBar from './SettingsTopBar';
import StickyActionBar from '../../components/ui/StickyActionBar';
import SettingsActionButton from '../../components/ui/SettingsActionButton';
import { useToast } from '../../context/ToastContext';
import BottomSheet from '../../components/ui/BottomSheet';
import { useNavigate } from 'react-router-dom';

type BusinessSetupSettingsPageProps = {
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

const BusinessSetupSettingsPage: React.FC<BusinessSetupSettingsPageProps> = ({
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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const inputClass =
    'w-full h-12 rounded-[14px] border border-border-subtle bg-bg-primary px-4 text-[13px] font-medium text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  const textareaClass =
    'w-full rounded-[18px] border border-border-subtle bg-bg-primary px-4 py-3 text-[13px] leading-5 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  const presetOptions = useMemo(() => Object.keys(industryPresets) as IndustryPresetKey[], []);
  const selectedPresetKey = (settings?.industryPreset || 'general') as IndustryPresetKey;

  const bannerButtonClass =
    'h-10 px-4 rounded-[14px] border border-border-subtle bg-bg-primary/50 text-[13px] font-semibold text-text-primary hover:bg-bg-primary/70 active:bg-bg-primary/80 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]';

  return (
    <>
      <SettingsTopBar
        title="Business setup"
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
                <div className="h-4 w-36 rounded bg-border-subtle/60" />
                <div className="mt-2 h-3 w-72 rounded bg-border-subtle/50" />
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="h-12 rounded-[14px] bg-bg-primary/60" />
                  <div className="h-12 rounded-[18px] bg-bg-primary/60" />
                </div>
              </div>
            </section>

            <section>
              <div className="h-3 w-20 rounded bg-border-subtle/60 mx-1" />
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="grid gap-4">
                  <div>
                    <div className="h-3 w-28 rounded bg-border-subtle/60" />
                    <div className="mt-2 h-12 rounded-[14px] bg-bg-primary/60" />
                  </div>
                  <div>
                    <div className="h-3 w-40 rounded bg-border-subtle/60" />
                    <div className="mt-2 h-12 rounded-[14px] bg-bg-primary/60" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="h-3 w-40 rounded bg-border-subtle/60 mx-1" />
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="grid gap-4">
                  <div>
                    <div className="h-3 w-28 rounded bg-border-subtle/60" />
                    <div className="mt-2 h-12 rounded-[14px] bg-bg-primary/60" />
                  </div>
                  <div>
                    <div className="h-3 w-44 rounded bg-border-subtle/60" />
                    <div className="mt-2 h-24 rounded-[18px] bg-bg-primary/60" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <section>
              <div className="kicker px-1">Preset</div>
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="text-[12px] leading-4 font-medium text-text-secondary">Industry preset</div>
                <div className="mt-1 text-[12px] leading-4 text-text-secondary/80">
                  Apply a preset to update your offer, WhatsApp template, and form fields.
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Preset</label>
                    <select
                      value={selectedPresetKey}
                      onChange={(e) => setSettings({ ...settings, industryPreset: e.target.value })}
                      className={inputClass}
                    >
                      {presetOptions.map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </div>

                  <SettingsActionButton
                    variant="secondary"
                    className="sm:w-auto"
                    onClick={() => {
                      const preset =
                        industryPresets[(settings.industryPreset || 'general') as IndustryPresetKey] || industryPresets.general;
                      setSettings({
                        ...settings,
                        offerTitle: preset.offerTitle,
                        offerBullets: preset.offerBullets as any,
                        defaultWhatsappTemplate: preset.defaultWhatsappTemplate,
                        budgetLabel: preset.budgetLabel,
                        budgetOptions: [...preset.budgetOptions],
                        timelineLabel: preset.timelineLabel,
                        timelineOptions: [...preset.timelineOptions],
                        serviceTypeEnabled: preset.serviceTypeEnabled,
                        serviceTypeLabel: preset.serviceTypeLabel,
                        serviceTypeOptions: [...preset.serviceTypeOptions],
                      });
                      showToast('Preset applied', 'success');
                    }}
                  >
                    Apply preset
                  </SettingsActionButton>
                </div>
              </div>
            </section>

            <section>
              <div className="kicker px-1">Business</div>
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Business name</label>
                    <input
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className={inputClass}
                    />
                    <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">Shown on your lead capture page.</div>
                  </div>

                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">WhatsApp number (digits only)</label>
                    <input
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      placeholder="e.g. 27791234567"
                      className={inputClass}
                    />
                    <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">Used when you open chats from leads.</div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="kicker px-1">Capture form fields</div>
              <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Budget label</label>
                    <input value={settings.budgetLabel} onChange={(e) => setSettings({ ...settings, budgetLabel: e.target.value })} className={inputClass} />
                    <div className="mt-2 text-[12px] leading-4 text-text-secondary/80">Appears on your public capture form.</div>
                  </div>

                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Budget options (one per line)</label>
                    <textarea
                      value={(settings.budgetOptions || []).join('\n')}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          budgetOptions: e.target.value
                            .split('\n')
                            .map((v) => v.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={4}
                      className={textareaClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Timeline label</label>
                    <input value={settings.timelineLabel} onChange={(e) => setSettings({ ...settings, timelineLabel: e.target.value })} className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Timeline options (one per line)</label>
                    <textarea
                      value={(settings.timelineOptions || []).join('\n')}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          timelineOptions: e.target.value
                            .split('\n')
                            .map((v) => v.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={4}
                      className={textareaClass}
                    />
                  </div>

                  <div className="rounded-[18px] border border-border-subtle bg-bg-primary px-4 py-4">
                    <label className="flex items-center justify-between gap-3 text-[13px] leading-5 font-semibold text-text-primary">
                      <span>Enable service type field</span>
                      <input
                        type="checkbox"
                        checked={Boolean(settings.serviceTypeEnabled)}
                        onChange={(e) => setSettings({ ...settings, serviceTypeEnabled: e.target.checked })}
                        className="h-5 w-5"
                      />
                    </label>
                    <div className="mt-3 grid gap-4">
                      <div>
                        <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Service type label</label>
                        <input
                          value={settings.serviceTypeLabel}
                          onChange={(e) => setSettings({ ...settings, serviceTypeLabel: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] leading-4 font-medium text-text-secondary mb-2">Service type options (one per line)</label>
                        <textarea
                          value={(settings.serviceTypeOptions || []).join('\n')}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              serviceTypeOptions: e.target.value
                                .split('\n')
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                          rows={4}
                          className={textareaClass}
                        />
                      </div>
                    </div>
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

export default BusinessSetupSettingsPage;
