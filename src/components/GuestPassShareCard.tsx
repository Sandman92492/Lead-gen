import React, { useCallback, useMemo, useState } from 'react';
import Button from './Button';
import { copy } from '../copy';

type GuestPassShareCardProps = {
  link: string;
};

const GuestPassShareCard: React.FC<GuestPassShareCardProps> = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const fullLink = useMemo(() => {
    if (!link) return '';
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    if (typeof window === 'undefined') return link;
    const normalized = link.startsWith('/') ? link : `/${link}`;
    return `${window.location.origin}${normalized}`;
  }, [link]);

  const whatsappHref = useMemo(() => {
    const text = `Guest Pass: ${fullLink}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [fullLink]);

  const handleCopy = useCallback(async () => {
    if (!fullLink) return;
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback is silent; clipboard may be blocked.
    }
  }, [fullLink]);

  return (
    <div className="gradient-panel relative overflow-hidden p-6 sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-10 h-56 w-56 rounded-full bg-action-primary/18 blur-[110px]" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="kicker">{copy.guests.share.title}</p>
            <p className="text-lg font-semibold text-text-primary">Share instantly</p>
          </div>
          <span className="premium-icon active">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 13l4 4 10-10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-primary/80 px-4 py-3 font-mono text-[13px] text-text-primary break-words shadow-sm">
          {fullLink}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" className="gap-2" onClick={handleCopy}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8 7h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 11h2a1 1 0 0 1 1 1v6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {copied ? copy.guests.share.copied : copy.guests.share.copy}
          </Button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3a9 9 0 0 0-8.48 11.83L3 21l6.24-1.68A9 9 0 1 0 12 3Z" fill="currentColor" />
              <path
                d="M8.35 8.84c.21-.06.47-.1.75-.1.29 0 .62.03.96.2.31.16 1.92.92 2.23 1.04.3.13.52.1.71-.06.2-.16.77-.7.95-.84.17-.14.33-.12.53-.03.21.09 1.28.6 1.5.71.21.12.35.29.4.55.05.26.05.5-.02.73a6.42 6.42 0 0 1-1.33 2.5c-.44.5-.96 1.1-1.36 1.34-.4.25-.7.32-1.02.18-.33-.14-2.01-.92-2.34-1.02-.33-.1-.55-.15-.78.15-.22.3-.84.9-1.02 1.08-.18.18-.34.2-.63.07-.3-.14-1.27-.47-2.42-1.48a9.05 9.05 0 0 1-1.62-2.04c-.18-.31.18-.5.43-.67.22-.15.47-.39.71-.58.24-.19.44-.29.66-.43.22-.15.35-.17.56-.09Z"
                fill="#FFFFFF"
              />
            </svg>
            {copy.guests.share.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GuestPassShareCard;
