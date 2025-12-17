import React, { useMemo } from 'react';
import StatusPill, { StatusTone } from './StatusPill';
import QrCode from './QrCode';
import TimerProgress from './TimerProgress';
import { copy } from '../copy';

type CredentialCardProps = {
  status: { label: string; tone: StatusTone };
  code: string | null;
  isLoading?: boolean;
  secondsRemaining?: number | null;
  rotationSeconds?: number | null;
  displayName: string;
  photoUrl?: string | null;
  tierLabel?: string | null;
  memberOrUnit?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  lastVerifiedAt?: string | null;
  variant?: 'member' | 'guest';
  layout?: 'default' | 'membership';
  className?: string;
};

const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).toUpperCase();
};

const stripClasses: Record<StatusTone, string> = {
  green: 'bg-success',
  yellow: 'bg-brand-yellow',
  red: 'bg-urgency-high',
  neutral: 'bg-border-subtle',
};

const glowClasses: Record<StatusTone, string> = {
  green: 'bg-success/30',
  yellow: 'bg-brand-yellow/34',
  red: 'bg-urgency-high/30',
  neutral: 'bg-border-subtle/28',
};

const tintClasses: Record<StatusTone, string> = {
  green: 'from-success/16 via-success/5',
  yellow: 'from-brand-yellow/18 via-brand-yellow/6',
  red: 'from-urgency-high/16 via-urgency-high/5',
  neutral: 'from-border-subtle/16 via-border-subtle/6',
};

const stripGradientClasses: Record<StatusTone, string> = {
  green: 'from-success via-success/70 to-success/0',
  yellow: 'from-brand-yellow via-brand-yellow/70 to-brand-yellow/0',
  red: 'from-urgency-high via-urgency-high/70 to-urgency-high/0',
  neutral: 'from-border-subtle via-border-subtle/70 to-border-subtle/0',
};

const CredentialCard: React.FC<CredentialCardProps> = ({
  status,
  code,
  isLoading = false,
  secondsRemaining = null,
  rotationSeconds = 30,
  displayName,
  photoUrl = null,
  tierLabel = null,
  memberOrUnit = null,
  validFrom = null,
  validTo = null,
  lastVerifiedAt = null,
  variant = 'member',
  layout = 'default',
  className = '',
}) => {
  const normalizedCode = useMemo(() => String(code || '').replace(/\D/g, '').slice(0, 4), [code]);
  const canShowCode = !isLoading && normalizedCode.length === 4;
  const groupedCode = useMemo(() => (canShowCode ? `${normalizedCode.slice(0, 2)} ${normalizedCode.slice(2)}` : '— —'), [canShowCode, normalizedCode]);
  const cadence = useMemo(() => Math.max(20, Math.min(60, rotationSeconds ?? 30)), [rotationSeconds]);
  const showTimer = secondsRemaining !== null;

  if (layout === 'membership') {
    return (
      <div className={`relative ${className}`}>
        <section
          className="relative overflow-hidden rounded-[28px] bg-bg-card text-text-primary shadow-[0_22px_70px_rgba(15,23,42,0.14)] ring-1 ring-border-subtle/70"
          aria-label={variant === 'guest' ? copy.credential.guestTitle : copy.nav.credential}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-transparent to-transparent"
            aria-hidden="true"
          />
          <div className={`h-1 w-full bg-gradient-to-r ${stripGradientClasses[status.tone]}`} />

          <div className="relative flex flex-col px-6 pb-6 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary shadow-sm">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={displayName || 'Member'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-sm font-bold text-text-secondary">
                      {(displayName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xl font-display font-extrabold leading-tight tracking-tight truncate">{displayName || '—'}</div>
                  <div className="mt-0.5 text-sm font-medium text-text-secondary truncate">
                    {variant === 'member' ? memberOrUnit || copy.productShortName : tierLabel || copy.credential.guestTitle}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <StatusPill label={status.label} tone={status.tone} />
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-bg-primary p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-border-subtle/70">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-text-secondary">Scan</span>
                <span className="text-[11px] font-semibold text-text-secondary tabular-nums">
                  {showTimer ? `Refresh ${secondsRemaining}s` : `Every ${cadence}s`}
                </span>
              </div>

              <div className="mt-4 grid place-items-center">
                {canShowCode ? (
                  <div className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-black/10">
                    <QrCode value={normalizedCode} sizePx={176} className="h-44 w-44 sm:h-48 sm:w-48" label="Access QR code" />
                  </div>
                ) : (
                  <div className="h-44 w-44 sm:h-48 sm:w-48 rounded-3xl bg-black/10 dark:bg-white/10 animate-pulse" aria-label="QR code loading" />
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">{copy.credential.codeLabel}</div>
                <div className="mt-2 font-mono text-5xl font-extrabold tracking-[0.12em] text-text-primary tabular-nums">
                  {isLoading ? '• • • •' : groupedCode}
                </div>
              </div>

              <div className="mt-3">
                <TimerProgress secondsRemaining={secondsRemaining} rotationSeconds={cadence} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              {validTo && (
                <div className="rounded-2xl bg-bg-primary px-4 py-3 ring-1 ring-border-subtle/70">
                  <div className="text-text-secondary font-medium">{copy.credential.validToLabel}</div>
                  <div className="mt-1 font-semibold text-text-primary">{formatDateTime(validTo)}</div>
                </div>
              )}
              {variant === 'member' && (
                <div className="rounded-2xl bg-bg-primary px-4 py-3 ring-1 ring-border-subtle/70">
                  <div className="text-text-secondary font-medium">{copy.credential.memberLabel}</div>
                  <div className="mt-1 font-semibold text-text-primary tabular-nums">{memberOrUnit || '—'}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`pointer-events-none absolute -inset-12 rounded-[36px] blur-3xl ${glowClasses[status.tone]}`}
        aria-hidden="true"
      />

      <section className="relative overflow-hidden rounded-[28px] border border-border-subtle shadow-2xl text-[var(--credential-card-ink)]">
        <div className="absolute inset-0 bg-[var(--credential-card-bg)]" />

        <div className="relative">
          <div className={`h-2.5 w-full ${stripClasses[status.tone]}`} />
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${tintClasses[status.tone]} to-transparent`}
            aria-hidden="true"
          />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div />

              <StatusPill label={status.label} tone={status.tone} />
            </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-start">
            <div>
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] backdrop-blur-sm">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={displayName || 'Member'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-lg font-bold text-[var(--credential-card-muted)]">
                      {(displayName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xl font-display font-black leading-tight truncate">{displayName || '—'}</div>
                  {variant === 'member' && (
                    <div className="mt-1 text-sm text-[var(--credential-card-muted)] truncate">
                      {memberOrUnit || copy.productShortName}
                    </div>
                  )}
                  {variant === 'member' && tierLabel && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] px-3 py-1 text-xs font-semibold text-[var(--credential-card-ink)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                      <span>{tierLabel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-medium tracking-[0.12em] text-[var(--credential-card-muted)]">
                    {copy.credential.codeLabel}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--credential-card-muted)]">
                    <span
                      className={`h-2 w-2 rounded-full ${status.tone === 'green' ? 'bg-success' : status.tone === 'red' ? 'bg-urgency-high' : 'bg-brand-yellow'} ${canShowCode ? 'animate-live-pulse' : ''}`}
                      aria-hidden="true"
                    />
                    <span className="tabular-nums">{secondsRemaining !== null ? `${secondsRemaining}s` : `Every ${cadence}s`}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div className="font-mono text-5xl sm:text-6xl font-black tracking-[0.12em] whitespace-pre">
                    {isLoading ? '• • • •' : groupedCode}
                  </div>
                  <div className="text-right text-xs text-[var(--credential-card-muted)]">
                    <div className="font-semibold text-[var(--credential-card-ink)]">
                      Scan at gate <span className="font-normal text-[var(--credential-card-muted)]">• every {cadence}s</span>
                    </div>
                  </div>
                </div>

                {!canShowCode && !isLoading && (
                  <div className="mt-3 text-xs text-[var(--credential-card-muted)]">
                    Code unavailable for this pass status.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--credential-card-panel-strong)] p-4 border border-[var(--credential-card-border-strong)] shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-medium tracking-[0.12em] text-[var(--credential-card-muted)]">
                  QR code
                </div>
                <div className="text-[11px] font-semibold text-[var(--credential-card-ink)] tabular-nums">
                  {secondsRemaining !== null ? `Refresh ${secondsRemaining}s` : 'Live'}
                </div>
              </div>

              <div className="mt-3 grid place-items-center">
                {canShowCode ? (
                  <QrCode value={normalizedCode} sizePx={176} className="h-44 w-44" label="Access QR code" />
                ) : (
                  <div className="h-44 w-44 rounded-2xl bg-black/10 dark:bg-white/10 animate-pulse" aria-label="QR code loading" />
                )}
              </div>

              <div className="mt-3 hidden sm:block text-center text-xs text-[var(--credential-card-muted)]">Show this to staff</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--credential-card-border-strong)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {validFrom && (
              <div className="hidden sm:flex items-center justify-between gap-3 rounded-2xl border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] px-4 py-3">
                <span className="text-[var(--credential-card-muted)] font-medium">{copy.credential.validFromLabel}</span>
                <span className="font-semibold text-[var(--credential-card-ink)]">{formatDateTime(validFrom)}</span>
              </div>
            )}
            {validTo && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] px-4 py-3">
                <span className="text-[var(--credential-card-muted)] font-medium">{copy.credential.validToLabel}</span>
                <span className="font-semibold text-[var(--credential-card-ink)]">{formatDateTime(validTo)}</span>
              </div>
            )}
            {variant === 'member' && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] px-4 py-3">
                <span className="text-[var(--credential-card-muted)] font-medium">{copy.credential.memberLabel}</span>
                <span className="font-semibold text-[var(--accent)]">{memberOrUnit || '—'}</span>
              </div>
            )}
            {lastVerifiedAt && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--credential-card-border-strong)] bg-[var(--credential-card-panel)] px-4 py-3">
                <span className="text-[var(--credential-card-muted)] font-medium">{copy.credential.lastVerifiedLabel}</span>
                <span className="font-semibold text-[var(--credential-card-ink)]">{formatDateTime(lastVerifiedAt)}</span>
              </div>
            )}
          </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CredentialCard;
