import React from 'react';
import { useNavigate } from 'react-router-dom';
import ListRow from '../../components/ui/ListRow';
import { haptics } from '../../utils/haptics';
import type { AppSettings } from '../../types/leadWallet';
import SettingsTopBar from './SettingsTopBar';

const IconBag: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 7h10l1 13H6L7 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconTicket: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 4h10a2 2 0 0 1 2 2v3a2.5 2.5 0 1 0 0 5v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4a2.5 2.5 0 1 0 0-5V6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconWhatsApp: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21a9 9 0 1 0-7.8-4.5L3 21l4.7-1.2A8.96 8.96 0 0 0 12 21Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9.2 9.1c.2-.5.5-.5.7-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2.1.5-.1.7l-.4.4c-.1.1-.2.4 0 .7.3.6.9 1.2 1.5 1.5.3.2.6.1.7 0l.4-.4c.2-.2.5-.2.7-.1l1.7.7c.3.1.4.3.4.5v.6c0 .2 0 .5-.5.7-.6.3-1.8.2-3.3-.4-1.8-.7-3.2-2.2-3.9-3.9-.6-1.5-.7-2.7-.4-3.3Z"
      fill="currentColor"
      opacity="0.12"
    />
  </svg>
);

const IconBrush: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 17c1.8 0 3-1.2 3-3V7l7-3 2 5-7 3v4c0 3.3-2.7 6-6 6H5v-2h2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const IconDownload: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconHelp: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21a9 9 0 1 0-7.8-4.5L3 21l4.7-1.2A8.96 8.96 0 0 0 12 21Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.8 2.2c-.8.5-1.3 1-1.3 1.8v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

const IconLogout: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SettingsHubPageProps = {
  settings: AppSettings | null;
  onSignOut: () => void;
  userEmail?: string;
  userPhotoURL?: string;
};

import { motion } from 'framer-motion';

const SettingsHubPage: React.FC<SettingsHubPageProps> = ({ settings, onSignOut, userEmail, userPhotoURL }) => {
  const navigate = useNavigate();

  return (
    <>
      <SettingsTopBar title="Account & Settings" />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lw-page-container"
      >
        <div className="space-y-6">
          <section>
            <div className="overflow-hidden rounded-[var(--r-section)] border border-border-subtle bg-bg-card">
              <div className="h-16 px-4 flex items-center gap-3">
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
                  <div className="text-[14px] leading-5 font-semibold text-text-primary truncate">{userEmail || '—'}</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="kicker px-1">Setup</div>
            <div className="mt-2 overflow-hidden rounded-[var(--r-section)] border border-border-subtle bg-bg-card divide-y divide-border-subtle/70">
              <ListRow
                title="Business setup"
                subtitle={settings?.businessName ? `Business: ${settings.businessName}` : 'Basics, lead form fields'}
                icon={<IconBag />}
                onClick={() => {
                  haptics.tap();
                  navigate('business');
                }}
              />
              <ListRow
                title="Offer & Pass"
                subtitle="Offer title, bullets, validity"
                icon={<IconTicket />}
                onClick={() => {
                  haptics.tap();
                  navigate('offer');
                }}
              />
              <ListRow
                title="WhatsApp Template"
                subtitle="Default follow-up message"
                icon={<IconWhatsApp />}
                onClick={() => {
                  haptics.tap();
                  navigate('whatsapp-template');
                }}
              />
              <ListRow
                title="Branding"
                subtitle="Logo and appearance"
                icon={<IconBrush />}
                onClick={() => {
                  haptics.tap();
                  navigate('branding');
                }}
              />
              <ListRow
                title="Data Export"
                subtitle="Download leads CSV"
                icon={<IconDownload />}
                onClick={() => {
                  haptics.tap();
                  navigate('export');
                }}
              />
            </div>
          </section>

          <section>
            <div className="kicker px-1">Support</div>
            <div className="mt-2 overflow-hidden rounded-[var(--r-section)] border border-border-subtle bg-bg-card divide-y divide-border-subtle/70">
              <ListRow
                title="Help / How to use"
                subtitle="Quick tips and best practices"
                icon={<IconHelp />}
                onClick={() => {
                  haptics.tap();
                  navigate('help');
                }}
              />
            </div>
          </section>

          <section>
            <div className="kicker px-1">Account</div>
            <div className="mt-2 overflow-hidden rounded-[var(--r-section)] border border-border-subtle bg-bg-card divide-y divide-border-subtle/70">
              <ListRow
                title="Logout"
                subtitle="Sign out of your account"
                icon={<IconLogout />}
                destructive
                onClick={() => {
                  haptics.tap();
                  onSignOut();
                }}
              />
            </div>
          </section>
        </div>
      </motion.main>
    </>
  );
};

export default SettingsHubPage;
