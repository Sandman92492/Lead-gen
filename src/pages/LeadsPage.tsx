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

import SetupChecklist from '../components/SetupChecklist';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { WhatsAppIcon } from '../components/ui/Icons';

type LeadFilter = 'NEW' | 'TODAY' | 'THIS_WEEK' | 'UNCONTACTED';


const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, removeToast } = useToast();
  const { isComplete: onboardingComplete, updateProgress } = useOnboardingProgress();
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

  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const filterLabel: Record<LeadFilter, string> = {
    UNCONTACTED: 'Uncontacted',
    NEW: 'New',
    TODAY: 'Today',
    THIS_WEEK: 'This week',
  };

  const optimisticallyMarkContacted = (lead: Lead): void => {
    const nowIso = new Date().toISOString();
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== lead.id) return l;
        const next: Lead = {
          ...l,
          status: l.status === 'NEW' ? 'CONTACTED' : l.status,
          contactedAt: l.contactedAt ?? ({ toDate: () => new Date(nowIso) } as any),
          updatedAt: ({ toDate: () => new Date(nowIso) } as any),
        };
        return next;
      })
    );
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
              <h2 className="text-lg font-bold text-action-primary flex items-center gap-2">
                <span className="text-xl">🔥</span> <span className="italic uppercase tracking-tighter font-black">Priority Leads</span>
              </h2>
              <div className="grid gap-3">
                {priorityLeads.map((lead) => (
                  <motion.button
                    key={`priority-${lead.id}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="bg-bg-card p-5 text-left rounded-[var(--r-lg)] border-2 border-slate-900 border-l-8 border-l-action-primary shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-lg text-text-primary truncate">{lead.fullName || '—'}</div>
                        <div className="text-sm text-text-secondary mt-1">
                          {lead.suburb} · {lead.timeline}
                        </div>
                      </div>
                      <span className="bg-action-primary/10 text-action-primary text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider mt-1">
                        URGENT
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="py-2">
            <h1 className="text-2xl font-black text-text-primary tracking-tighter uppercase italic px-1">
              {filterLabel[filter]} <span className="text-text-secondary font-medium tracking-normal normal-case italic">({filtered.length})</span>
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
                description="Create a campaign to start receiving leads."
                actionLabel="CREATE CAMPAIGN"
                onAction={() => navigate('/campaigns', { state: { openCreate: true } })}
              />
            ) : filter === 'UNCONTACTED' ? (
              <EmptyState
                title="No uncontacted leads"
                description="Create a campaign and share it to bring new leads into your inbox."
                actionLabel="CREATE CAMPAIGN"
                onAction={() => navigate('/campaigns', { state: { openCreate: true } })}
              />
            ) : (
              <EmptyState
                title="No leads for this filter"
                description="Try switching to Uncontacted or This week."
              />
            )
          ) : (
            <div className="lw-card overflow-hidden border-2 border-slate-900 shadow-xl bg-bg-card rounded-[var(--r-xl)]">
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
                        <Skeleton className="h-10 w-10 rounded-[var(--r-lg)]" />
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
                    const isExpanded = expandedLeadId === lead.id;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={lead.id}
                        className={`w-full overflow-hidden bg-bg-card transition-colors ${isExpanded ? 'bg-action-primary/5' : 'hover:bg-surface/5'
                          }`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setExpandedLeadId(isExpanded ? null : lead.id);
                            }
                          }}
                          className="px-4 py-4 flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:bg-surface/40"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`text-lg leading-tight font-bold text-text-primary truncate ${isExpanded ? 'text-action-primary' : ''}`}>
                                {lead.fullName || '—'}
                              </div>
                              {isNextUp && (
                                <span className="bg-action-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Up Next
                                </span>
                              )}
                              {lead.status === 'NEW' && !isNextUp && (
                                <div className="w-1.5 h-1.5 rounded-full bg-action-primary animate-pulse" />
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-text-secondary">
                              <span>{created ? formatTimeSince(created) : '—'}</span>
                              <span className="opacity-30">•</span>
                              <StatusPill status={lead.status} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <IconButton
                              variant="primary"
                              size="md"
                              disabled={!waLink}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!waLink) {
                                  showToast('Missing phone number', 'error');
                                  return;
                                }
                                window.open(waLink, '_blank', 'noopener,noreferrer');
                                const id = showToast('Mark as contacted?', 'info', 0, [
                                  {
                                    label: 'Mark',
                                    variant: 'primary',
                                    onClick: async () => {
                                      try {
                                        optimisticallyMarkContacted(lead);
                                        if (lead.status === 'NEW') await setLeadStatus(lead.id, 'CONTACTED');
                                        else if (!lead.contactedAt) await markLeadContacted(lead.id);
                                        await updateProgress({ firstLeadHandled: true });
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
                              <span className="text-white">
                                <WhatsAppIcon className="h-5 w-5" />
                              </span>
                            </IconButton>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              className="text-text-secondary/50 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </motion.div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                              <div className="px-4 pb-4 border-t border-border-subtle/30 pt-4 space-y-4 bg-action-primary/[0.02]">
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                  <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.1em] mb-1 opacity-60">Suburb</p>
                                    <p className="text-sm font-bold text-text-primary">{lead.suburb || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.1em] mb-1 opacity-60">Timeline</p>
                                    <p className="text-sm font-bold text-text-primary">{lead.timeline || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.1em] mb-1 opacity-60">Monthly Bill</p>
                                    <p className="text-sm font-bold text-text-primary">{lead.monthlyBillRange || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.1em] mb-1 opacity-60">Source</p>
                                    <Chip>{lead.sourceTypeSnapshot}</Chip>
                                  </div>
                                </div>

                                {(lead as any).serviceType && (
                                  <div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.1em] mb-1 opacity-60">Service Type</p>
                                    <p className="text-sm font-bold text-text-primary">{(lead as any).serviceType}</p>
                                  </div>
                                )}

                                <div className="pt-2 flex gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/leads/${lead.id}`);
                                    }}
                                    className="flex-1 h-11 rounded-[var(--r-lg)] border border-border-subtle bg-white text-sm font-bold text-text-primary hover:border-action-primary transition-all active:scale-[0.98]"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStatusSheetLead(lead);
                                    }}
                                    className="flex-1 h-11 rounded-[var(--r-lg)] border border-border-subtle bg-white text-sm font-bold text-text-primary hover:border-action-primary transition-all active:scale-[0.98]"
                                  >
                                    Update Status
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </AnimatePresence>


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
