import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getAppSettings, markLeadContacted, setLeadStatus, subscribeLeads } from '../services/leadWallet';
import type { AppSettings, Lead, LeadStatus } from '../types/leadWallet';
import { buildWaMeLink, renderWhatsappTemplate } from '../utils/whatsapp';
import BottomSheet from '../components/ui/BottomSheet';
import EmptyState from '../components/ui/EmptyState';
import FilterChips from '../components/ui/FilterChips';
import StatusPill from '../components/ui/StatusPill';
import { Skeleton } from '../components/ui/Skeleton';
import Section from '../components/ui/Section';
import Chip from '../components/ui/Chip';
import IconButton from '../components/ui/IconButton';
import Row from '../components/ui/Row';
import { formatTimeSince, toDateMaybe } from '../utils/time';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATIONS } from '../theme/theme';
import SetupChecklist from '../components/SetupChecklist';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';

type LeadFilter = 'NEW' | 'TODAY' | 'THIS_WEEK' | 'UNCONTACTED';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
      <path
        d="M16.5 14.5c-.2.6-1.2 1.4-2 1.1-.4-.2-.8-.3-1.1-.6-.2-.2-.4-.5-.6-.7-.2-.3-.4-.3-.7-.2-.4.1-.9.3-1.4.2-.4-.1-.7-.5-1-1s-.6-1.7-.9-2.3c-.3-.6-.1-.9.1-1.1.2-.2.4-.5.6-.8.2-.3.3-.4.4-.7.1-.3 0-.5-.1-.6-.1-.2-.9-2.3-1.2-2.5-.3-.2-.6-.2-.9-.2-.3 0-.6 0-.9 0-.3 0-.7.2-.9.6-.1.4-.5 1.1-.5 2s.6 1.9.7 2.1c.2.3.3.7.7 1.2.4.5 1.1 1.2 2.2 1.9.8.5 1.3.7 1.9.7.6 0 1.3-.3 1.6-.6.3-.3.6-.5.9-.4.3 0 .8.2 1.1.5.2.3.2.7.1.9Z"
        fill="#ffffff"
      />
    </svg>
  );
};

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, removeToast } = useToast();
  const { isComplete: onboardingComplete } = useOnboardingProgress();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<LeadFilter>('UNCONTACTED');
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const [statusSheetLead, setStatusSheetLead] = useState<Lead | null>(null);

  useEffect(() => {
    const unsub = subscribeLeads((next) => {
      setLeads(next);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const next = await getAppSettings();
        if (mounted) setSettings(next);
      } catch {
        if (mounted) setSettings(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const buildWhatsAppLinkForLead = useMemo(() => {
    const template =
      settings?.defaultWhatsappTemplate ||
      "Hi {name}, thanks for your request. I see you’re in {suburb}. When can we call you today?";
    return (lead: Lead): string | null => {
      if (!lead.phone) return null;
      const message = renderWhatsappTemplate(template, {
        name: lead.fullName || 'there',
        suburb: lead.suburb || 'your area',
        campaign: lead.campaignNameSnapshot || 'our campaign',
        serviceType: (lead as any).serviceType ?? '',
      });
      if (!message) return null;
      return buildWaMeLink(lead.phone, message);
    };
  }, [settings?.defaultWhatsappTemplate]);

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday=0
    const startOfWeek = startOfDay - dayOfWeek * 24 * 60 * 60 * 1000;

    return leads.filter((lead) => {
      if (filter === 'NEW') return lead.status === 'NEW';
      if (filter === 'UNCONTACTED') return lead.status === 'NEW' || !lead.contactedAt;
      const created = toDateMaybe(lead.createdAt);
      if (!created) return false;
      const createdMs = created.getTime();
      if (filter === 'TODAY') return createdMs >= startOfDay;
      if (filter === 'THIS_WEEK') return createdMs >= startOfWeek;
      return true;
    });
  }, [filter, leads]);

  // Smart Priority: Leads that are NEW and have ASAP timeline or are created very recently
  const priorityLeads = useMemo(() => {
    return leads.filter(l =>
      l.status === 'NEW' &&
      (l.timeline?.toLowerCase().includes('asap') || (l as any).urgency === 'HIGH')
    ).slice(0, 3);
  }, [leads]);

  const filterLabel: Record<LeadFilter, string> = {
    UNCONTACTED: 'Uncontacted',
    NEW: 'New',
    TODAY: 'Today',
    THIS_WEEK: 'This week',
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lw-page-container relative"
    >
      <AnimatePresence>
        <div className="space-y-4">
          {/* Setup Checklist for new users */}
          {!onboardingComplete && (
            <SetupChecklist
              onCreateCampaign={() => navigate('/campaigns', { state: { openCreate: true } })}
              className="mb-4"
            />
          )}

          {/* Smart Priority Section (Adaptive UI) */}
          {filter === 'UNCONTACTED' && priorityLeads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mb-2"
            >
              <h2 className="text-lg font-bold text-accent flex items-center gap-2">
                <span className="text-xl">🔥</span> Priority Leads
              </h2>
              <div className="grid gap-3">
                {priorityLeads.map((lead) => (
                  <motion.button
                    key={`priority-${lead.id}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="bg-bg-card p-5 text-left rounded-[var(--r-lg)] border-l-4 border-l-accent shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xl text-text-primary truncate">{lead.fullName || '—'}</div>
                        <div className="text-base text-text-secondary mt-2">
                          {lead.suburb} · {lead.timeline}
                        </div>
                      </div>
                      <span className="bg-accent text-white text-xs px-3 py-1.5 rounded-full font-bold">
                        ASAP
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="py-3">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {filterLabel[filter]} <span className="text-text-secondary font-medium">({filtered.length})</span>
            </h1>
          </div>

          <FilterChips
            value={filter}
            onChange={setFilter}
            items={[
              { id: 'UNCONTACTED', label: 'Uncontacted' },
              { id: 'NEW', label: 'New' },
              { id: 'TODAY', label: 'Today' },
              { id: 'THIS_WEEK', label: 'This week' },
            ]}
          />

          {!isLoading && filtered.length === 0 ? (
            leads.length === 0 ? (
              <EmptyState
                title="No leads yet"
                description="Create a campaign QR to start receiving leads."
                actionLabel="Create a campaign QR"
                onAction={() => navigate('/campaigns', { state: { openCreate: true } })}
              />
            ) : filter === 'UNCONTACTED' ? (
              <EmptyState
                title="No uncontacted leads"
                description="Create a campaign QR and share it to bring new leads into your inbox."
                actionLabel="Create a campaign QR"
                onAction={() => navigate('/campaigns', { state: { openCreate: true } })}
              />
            ) : (
              <EmptyState
                title="No leads for this filter"
                description="Try switching to Uncontacted or This week."
              />
            )
          ) : (
            <Section padded={false} className="lw-tactile-card overflow-hidden border-none shadow-tactile">

              {isLoading ? (
                <div className="divide-y divide-border-subtle">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-4 w-40 rounded-md" />
                          <Skeleton className="h-3 w-64 rounded-md" />
                          <Skeleton className="h-3 w-44 rounded-md" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-[var(--r-lg)]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {filtered.map((lead, idx) => {
                    const created = toDateMaybe(lead.createdAt);
                    const waLink = buildWhatsAppLinkForLead(lead);
                    const isNextUp = idx === 0 && filter === 'UNCONTACTED';

                    return (
                      <motion.button
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={lead.id}
                        type="button"
                        className="w-full px-4 py-4 text-left bg-bg-card hover:bg-surface/20 transition-colors focus:outline-none focus-visible:bg-surface/40 active:bg-surface/60"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-lg leading-tight font-bold text-text-primary truncate">
                                {lead.fullName || '—'}
                              </div>
                              {isNextUp && (
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                                  Next
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-base leading-5 text-text-secondary truncate">
                              {lead.suburb || '—'} · {lead.monthlyBillRange} · {lead.timeline}
                              {(lead as any).serviceType ? ` · ${(lead as any).serviceType}` : ''}
                            </div>
                          </div>

                          <IconButton
                            variant="primary"
                            size="md"
                            disabled={!waLink}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!waLink) {
                                showToast('Missing phone number for this lead', 'error');
                                return;
                              }
                              window.open(waLink, '_blank', 'noopener,noreferrer');
                              const id = showToast('Mark as contacted?', 'info', 0, [
                                {
                                  label: 'Mark',
                                  variant: 'primary',
                                  onClick: async () => {
                                    try {
                                      if (lead.status === 'NEW') await setLeadStatus(lead.id, 'CONTACTED');
                                      else if (!lead.contactedAt) await markLeadContacted(lead.id);
                                    } finally {
                                      removeToast(id);
                                    }
                                  },
                                },
                                { label: 'Dismiss', onClick: () => removeToast(id) },
                              ]);
                            }}
                            aria-label="WhatsApp"
                          >
                            <span className="text-whatsapp">
                              <WhatsAppIcon className="h-5 w-5" />
                            </span>
                          </IconButton>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="min-w-0 flex items-center gap-3">
                            <Chip>{lead.sourceTypeSnapshot}</Chip>
                            <span className="text-sm font-medium text-text-secondary truncate">
                              {created ? formatTimeSince(created) : '—'}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusSheetLead(lead);
                            }}
                            aria-label="Change status"
                          >
                            <StatusPill status={lead.status} />
                          </button>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </Section>
          )}
        </div>
      </AnimatePresence>

      {/* Floating Action Button - Thumb-First Design */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={ANIMATIONS.bounce}
        onClick={() => navigate('/campaigns', { state: { openCreate: true } })}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg lw-glow-primary flex items-center justify-center z-50"
        aria-label="Create Campaign"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      <BottomSheet
        isOpen={Boolean(statusSheetLead)}
        onClose={() => setStatusSheetLead(null)}
        title={statusSheetLead?.fullName ? `Status • ${statusSheetLead.fullName}` : 'Update status'}
      >
        <div className="space-y-3">
          <div className="text-[13px] leading-5 text-text-secondary">
            Track outcome: <span className="font-medium text-text-primary">New → Contacted → Booked → Won/Lost</span>
          </div>
          <Section padded={false}>
            {(['NEW', 'CONTACTED', 'BOOKED', 'QUOTED', 'WON', 'LOST'] as LeadStatus[]).map((s, idx, arr) => (
              <Row
                key={s}
                title={s}
                right={<StatusPill status={s} />}
                divider={idx !== arr.length - 1}
                onClick={async () => {
                  if (!statusSheetLead) return;
                  try {
                    await setLeadStatus(statusSheetLead.id, s);
                    showToast('Status updated', 'success');
                    setStatusSheetLead(null);
                  } catch {
                    showToast('Failed to update status', 'error');
                  }
                }}
              />
            ))}
          </Section>
        </div>
      </BottomSheet>
    </motion.main>
  );
};

export default LeadsPage;
