import React, { useEffect, useMemo } from 'react';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';
import { copy } from '../copy';
import TopBar from './ui/TopBar';
import BottomNav from './ui/BottomNav';

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
  const hideTopBar = currentPath.startsWith('/settings');

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let rafId = 0;

    const updateNow = () => {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--keyboard-offset', `${Math.round(keyboard)}px`);
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateNow();
      });
    };

    scheduleUpdate();
    vv.addEventListener('resize', scheduleUpdate);
    vv.addEventListener('scroll', scheduleUpdate);
    return () => {
      vv.removeEventListener('resize', scheduleUpdate);
      vv.removeEventListener('scroll', scheduleUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
      document.documentElement.style.setProperty('--keyboard-offset', '0px');
    };
  }, []);

  const pageTitle = useMemo(() => {
    const fromPrimary = nav.find((item) => isActivePath(item.path, currentPath))?.label;
    if (fromPrimary) return fromPrimary;
    return secondaryNav.find((item) => isActivePath(item.path, currentPath))?.label || copy.productShortName;
  }, [currentPath, nav, secondaryNav]);

  const pageSubtitle = useMemo(() => {
    if (currentPath.startsWith('/leads')) return 'Inbox';
    if (currentPath.startsWith('/campaigns')) return 'Track sources';
    if (currentPath.startsWith('/settings')) return 'Business setup';
    return undefined;
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="md:flex md:min-h-screen">
        {/* Desktop side navigation */}
        <aside className="hidden md:flex md:flex-col md:w-72 md:shrink-0 md:border-r md:border-border-subtle md:bg-bg-card">
          <div className="px-6 pt-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <BrandMark className="h-11 w-11" />
              </div>
              <div className="leading-tight">
                <div className="text-xl font-display font-bold text-text-primary">{copy.productName}</div>
              </div>
            </div>
          </div>

          <nav className="px-3 space-y-1">
            {nav.map((item) => {
              const active = isActivePath(item.path, currentPath);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] ${active ? 'bg-bg-primary text-text-primary' : 'bg-transparent text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                    }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[12px] bg-bg-primary text-text-secondary transition ${active ? 'text-action-primary' : ''
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
                      className={`group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] ${active
                        ? 'bg-value-highlight text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.35)]'
                        : 'bg-bg-card/70 text-text-secondary hover:bg-bg-primary/60 hover:text-text-primary'
                        }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-[var(--r-lg)] border border-border-subtle transition ${active ? 'border-transparent text-slate-900' : 'border-border-subtle text-text-secondary'
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
            <div className="rounded-[var(--r-lg)] border border-border-subtle bg-bg-card p-4">
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
                  <div className="text-sm font-bold text-text-primary truncate">{userEmail || '—'}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <ThemeToggle />
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center justify-center rounded-[12px] border border-border-subtle bg-transparent px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-primary transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
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
          {!hideTopBar && (
            <TopBar
              title={pageTitle}
              subtitle={pageSubtitle}
              left={
                <div className="text-accent">
                  <BrandMark className="h-9 w-9" />
                </div>
              }
              right={
                <>
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={() => onNavigate('/settings')}
                    className="md:hidden relative h-10 w-10 overflow-hidden rounded-full border border-border-subtle bg-bg-card focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
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
                </>
              }
            />
          )}

          <div className="pb-24 md:pb-0">{children}</div>
        </div>
      </div>

      <BottomNav items={nav} currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};

export default AppShell;
