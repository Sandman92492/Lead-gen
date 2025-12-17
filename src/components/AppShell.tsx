import React, { useMemo } from 'react';
import BrandMark from './BrandMark';
import { useTheme } from './ThemeContext';
import { copy } from '../copy';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
};

type AppShellProps = {
  nav: NavItem[];
  secondaryNav?: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  userEmail?: string;
  userPhotoURL?: string;
  onSignOut?: () => void;
  children: React.ReactNode;
};

const isActivePath = (itemPath: string, currentPath: string): boolean => {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

const ThemeToggleIconButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-bg-card/90 hover:bg-bg-card px-3 py-2 text-text-primary/70 hover:text-text-primary shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v2M12 19v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 13.2A7.5 7.5 0 0 1 10.8 3a6.9 6.9 0 1 0 10.2 10.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

const AppShell: React.FC<AppShellProps> = ({
  nav,
  secondaryNav = [],
  currentPath,
  onNavigate,
  userEmail,
  userPhotoURL,
  onSignOut,
  children,
}) => {
  const pageTitle = useMemo(() => {
    const fromPrimary = nav.find((item) => isActivePath(item.path, currentPath))?.label;
    if (fromPrimary) return fromPrimary;
    return secondaryNav.find((item) => isActivePath(item.path, currentPath))?.label || copy.productShortName;
  }, [currentPath, nav, secondaryNav]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="md:flex md:min-h-screen">
        {/* Desktop side navigation */}
        <aside className="hidden md:flex md:flex-col md:w-72 md:shrink-0 md:border-r md:border-border-subtle/80 md:bg-bg-card md:shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
          <div className="px-6 pt-7 pb-6">
            <div className="flex items-center gap-3">
              <div className="text-value-highlight">
                <BrandMark className="h-10 w-10" />
              </div>
              <div className="leading-tight">
                <div className="kicker">Estate</div>
                <div className="text-xl font-display font-black text-text-primary">{copy.productName}</div>
              </div>
            </div>
          </div>

          <nav className="px-3 space-y-2">
            {nav.map((item) => {
              const active = isActivePath(item.path, currentPath);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] ${
                    active
                      ? 'bg-action-primary text-white shadow-[0_12px_36px_rgba(15,23,42,0.28)]'
                      : 'bg-bg-card/70 text-text-secondary hover:bg-bg-primary/60 hover:text-text-primary'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle transition ${
                      active ? 'border-transparent text-white' : 'border-border-subtle text-text-secondary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {secondaryNav.length > 0 && (
            <div className="mt-6 px-3">
              <div className="px-4 kicker">Staff</div>
              <div className="mt-2 space-y-2">
                {secondaryNav.map((item) => {
                  const active = isActivePath(item.path, currentPath);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] ${
                        active
                          ? 'bg-value-highlight text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.35)]'
                          : 'bg-bg-card/70 text-text-secondary hover:bg-bg-primary/60 hover:text-text-primary'
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle transition ${
                          active ? 'border-transparent text-slate-900' : 'border-border-subtle text-text-secondary'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-auto p-4">
            <div className="rounded-[28px] border border-border-subtle bg-bg-card/80 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.2)]">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-bg-card">
                  {userPhotoURL ? (
                    <img
                      src={userPhotoURL}
                      alt={userEmail || 'Account'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-sm font-bold text-text-secondary">
                      {(userEmail || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="kicker">Signed in</div>
                  <div className="text-sm font-semibold text-text-primary truncate">{userEmail || '—'}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <ThemeToggleIconButton />
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-bg-primary px-4 py-2 text-sm font-semibold text-text-primary shadow-[0_10px_26px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-card shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:hidden">
                <div className="text-value-highlight">
                  <BrandMark className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <div className="kicker">Estate Pass</div>
                  <div className="text-sm font-semibold text-text-primary truncate">{pageTitle}</div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="text-sm font-semibold text-text-primary">{pageTitle}</div>
                <div className="text-xs text-text-secondary">Secure access • Guest invites • Verification</div>
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggleIconButton />
                <button
                  type="button"
                  onClick={() => onNavigate('/profile')}
                  className="relative h-10 w-10 overflow-hidden rounded-full border border-border-subtle bg-bg-card focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                  aria-label="Open account"
                >
                  {userPhotoURL ? (
                    <img
                      src={userPhotoURL}
                      alt={userEmail || 'Account'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-sm font-bold text-text-secondary">
                      {(userEmail || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </header>

          <div className="pb-[var(--bottom-ui-offset)] md:pb-0">{children}</div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden" aria-label="Primary">
        <div className="mx-auto max-w-md px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <div className="rounded-2xl border border-border-subtle/80 bg-bg-card shadow-[0_-12px_32px_rgba(15,23,42,0.10)]">
            <div className="grid grid-cols-4 gap-1 p-1.5">
              {nav.map((item) => {
                const active = isActivePath(item.path, currentPath);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`group relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 pb-3 pt-2.5 text-[11px] font-medium leading-tight tracking-[0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                      active
                        ? "font-semibold text-brand-accent after:content-[''] after:absolute after:bottom-1.5 after:h-1 after:w-1 after:rounded-full after:bg-brand-accent"
                        : 'text-text-secondary hover:bg-bg-primary/60 hover:text-text-primary'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                        active
                          ? 'bg-brand-accent/10 text-brand-accent'
                          : 'bg-transparent text-current group-hover:bg-bg-primary/60'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate max-w-[5.5rem]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
