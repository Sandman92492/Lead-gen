import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { isPWAPromptAvailable, showPWAPrompt } from '../utils/pwaPrompt';
import { copy } from '../copy';
import { useToast } from '../context/ToastContext';

const ProfilePage: React.FC<{ userEmail?: string; userPhotoURL?: string; onSignOut: () => void }> = ({
  userEmail,
  userPhotoURL,
  onSignOut,
}) => {
  const { showToast } = useToast();
  const [pwaAvailable, setPwaAvailable] = useState(isPWAPromptAvailable());

  useEffect(() => {
    setPwaAvailable(isPWAPromptAvailable());
  }, []);

  const whatsappUrl = useMemo(() => `https://wa.me/${copy.support.whatsappNumberE164}`, []);
  const emailUrl = useMemo(() => `mailto:${copy.support.email}`, []);

  return (
    <main className="relative pb-24 pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-12 h-64 w-64 rounded-full bg-action-primary/50 blur-[120px]" />
        <div className="absolute -bottom-10 right-0 h-72 w-72 rounded-full bg-value-highlight/60 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 sm:px-6">
        <section className="gradient-panel p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-2xl border border-border-subtle bg-bg-primary">
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt={userEmail || 'User avatar'}
                  className="h-full w-full rounded-2xl object-cover"
                  onError={(event) => {
                    (event.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-action-primary/80 text-lg font-semibold text-white">
                  {(userEmail || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <p className="kicker">Account</p>
              <h1 className="text-2xl font-display font-black text-text-primary">Profile & Support</h1>
              <p className="text-sm text-text-secondary">Manage your access, device setup, and support routes.</p>
            </div>

            <button
              type="button"
              className="premium-icon rounded-full border border-border-subtle bg-bg-card text-text-secondary transition hover:border-action-primary hover:bg-action-primary hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
              aria-label="Account settings"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm0 10.5c-3.86 0-7-3.62-7-8s3.14-8 7-8 7 3.62 7 8-3.14 8-7 8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border-subtle bg-bg-primary p-4 text-sm text-text-secondary shadow-sm">
              <p className="kicker">Signed in as</p>
              <p className="mt-2 text-base font-semibold text-text-primary">{userEmail || '—'}</p>
              <p className="mt-1 text-xs font-medium text-text-secondary">Estate resident</p>
            </div>
            <div className="rounded-3xl border border-border-subtle bg-bg-primary p-4 text-sm text-text-secondary shadow-sm">
              <p className="kicker">Security</p>
              <p className="mt-2 text-base font-semibold text-text-primary">Protected login</p>
              <p className="mt-1 text-xs text-text-secondary">Codes refresh every 30 sec.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="flex-1 gap-2 text-sm sm:flex-initial"
              onClick={onSignOut}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 16h4a2 2 0 0 0 0-4H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 3v5M12 16v5M15 6l-3-3-3 3M15 18l-3 3-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {copy.help.signOut}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm sm:flex-initial"
              onClick={() => showToast('Security settings coming soon', 'info')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 6v2M12 16v2M8 12H6M18 12h-2M9.5 9.5l-1.5-1.5M16.5 16.5l-1.5-1.5M9.5 14.5l-1.5 1.5M16.5 7.5l-1.5 1.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              Security settings
            </Button>
          </div>
        </section>

        <section className="gradient-panel p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="kicker">Add to home screen</p>
              <h2 className="text-2xl font-display font-black text-text-primary">Stay ready</h2>
            </div>
            <span className="premium-icon">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-text-secondary">
            <p>{copy.help.installIos}</p>
            <p>{copy.help.installAndroid}</p>
          </div>
          {pwaAvailable ? (
            <div className="mt-6">
              <Button
                variant="primary"
                className="w-full gap-3 text-sm"
                onClick={async () => {
                  await showPWAPrompt();
                  setPwaAvailable(isPWAPromptAvailable());
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 5v10M8 11l4-4 4 4M6 17h12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {copy.help.installButton}
              </Button>
            </div>
          ) : (
            <p className="mt-6 text-sm font-medium text-text-secondary">
              Add to Home Screen not available
            </p>
          )}
        </section>

        <section className="gradient-panel p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="kicker">Support</p>
              <h2 className="text-2xl font-display font-black text-text-primary">Always-on help</h2>
            </div>
            <span className="premium-icon active">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2a10 10 0 0 0-10 10c0 4.2 2.8 7.8 6.5 9.3l.5.2v-3.1l-.4-.1A6.5 6.5 0 0 1 6 12 6 6 0 0 1 12 6a6 6 0 0 1 6 6c0 1.1-.3 2.1-.9 3l.3.9h2.9l.2-.9A10 10 0 0 0 12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 11v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="7" r="1" fill="currentColor" />
              </svg>
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={emailUrl}
              className="rounded-2xl border border-border-subtle bg-bg-primary px-4 py-3 text-sm font-semibold text-text-primary shadow-sm transition hover:border-action-primary hover:bg-bg-primary hover:text-text-primary"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 6h16v12H4z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M4 6l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copy.help.supportEmailLabel}
              </span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-transparent bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
                  <path
                    d="M16.5 14.5c-.2.6-1.2 1.4-2 1.1-.4-.2-.8-.3-1.1-.6-.2-.2-.4-.5-.6-.7-.2-.3-.4-.3-.7-.2-.4.1-.9.3-1.4.2-.4-.1-.7-.5-1-1s-.6-1.7-.9-2.3c-.3-.6-.1-.9.1-1.1.2-.2.4-.5.6-.8.2-.3.3-.4.4-.7.1-.3 0-.5-.1-.6-.1-.2-.9-2.3-1.2-2.5-.3-.2-.6-.2-.9-.2-.3 0-.6 0-.9 0-.3 0-.7.2-.9.6-.1.4-.5 1.1-.5 2s.6 1.9.7 2.1c.2.3.3.7.7 1.2.4.5 1.1 1.2 2.2 1.9.8.5 1.3.7 1.9.7.6 0 1.3-.3 1.6-.6.3-.3.6-.5.9-.4.3 0 .8.2 1.1.5.2.3.2.7.1.9Z"
                    fill="#ffffff"
                  />
                </svg>
                {copy.help.supportWhatsappLabel}
              </span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
