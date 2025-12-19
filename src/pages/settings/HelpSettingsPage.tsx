import React, { useMemo, useState } from 'react';
import SettingsTopBar from './SettingsTopBar';

type HelpItem = {
  title: string;
  body: string;
};

const HelpSettingsPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = useMemo<HelpItem[]>(
    () => [
      {
        title: 'QR placement (vehicles & signage)',
        body: 'Place the QR on both rear windows or tailgate, eye-level. Make it big enough to scan (8–10cm+). Add a short CTA like “Scan to claim your offer”.',
      },
      {
        title: 'Flyers & expos',
        body: 'Repeat the link as text below the QR as a backup if scanning fails. Keep the QR high-contrast and avoid glossy glare.',
      },
      {
        title: 'Response time matters',
        body: 'Aim to respond in under 5 minutes. After ~1 hour, conversions typically drop fast. Use CONTACTED as soon as you message/call.',
      },
      {
        title: 'Suggested lead flow',
        body: 'NEW → CONTACTED → BOOKED → WON / LOST. Keep notes short and track what you tried so follow-ups feel personal.',
      },
      {
        title: 'Common reasons leads don’t convert',
        body: 'Slow replies, wrong numbers, generic messages, and no follow-up reminder. Tighten your template, then send a second follow-up the next day.',
      },
    ],
    []
  );

  return (
    <>
      <SettingsTopBar title="Help / How to use" showBack />
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-32 sm:px-6">
        <div className="space-y-6">
          <section>
            <div className="kicker px-1">Tips</div>
            <div className="mt-2 overflow-hidden rounded-[22px] border border-border-subtle bg-bg-card">
              {items.map((item, idx) => {
                const open = openIndex === idx;
                return (
                  <div key={item.title} className={idx === 0 ? '' : 'border-t border-border-subtle/70'}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : idx)}
                      className="w-full h-14 px-4 flex items-center justify-between gap-3 text-left focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                    >
                      <span className="text-[14px] leading-5 font-semibold text-text-primary">{item.title}</span>
                      <span className={`h-6 w-6 grid place-items-center text-text-secondary transition-transform ${open ? 'rotate-45' : 'rotate-0'}`} aria-hidden="true">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <path d="M12 6v12m-6-6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-64' : 'max-h-0'}`}>
                      <div className="px-4 pb-4 text-[13px] leading-5 text-text-secondary">{item.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default HelpSettingsPage;
