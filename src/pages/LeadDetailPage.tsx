import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import BottomSheet from '../components/ui/BottomSheet';
import Card from '../components/ui/Card';
import StatusPill from '../components/ui/StatusPill';
import { useToast } from '../context/ToastContext';
import { getAppSettings, markLeadContacted, setLeadStatus, subscribeLead, updateLead } from '../services/leadWallet';
import type { AppSettings, Lead, LeadStatus } from '../types/leadWallet';
import { buildWaMeLink, renderWhatsappTemplate } from '../utils/whatsapp';
import { formatHumanDateTime, formatTimeSince, toDateMaybe } from '../utils/time';
import { motion } from 'framer-motion';

const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const { showToast, removeToast } = useToast();

  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesState, setNotesState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const notesDirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!leadId) return;
    const unsub = subscribeLead(leadId, (next) => {
      setLead(next);
      if (!notesDirtyRef.current) setNotesDraft(next?.notes ?? '');
    });
    return () => unsub();
  }, [leadId]);

  useEffect(() => {
    if (!lead) return;
    if ((lead.notes ?? '') === notesDraft) {
      notesDirtyRef.current = false;
      if (notesState === 'saving') setNotesState('saved');
    }
  }, [lead?.notes, lead?.id, notesDraft, notesState]);

  useEffect(() => {
    if (!lead) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    const remote = lead.notes ?? '';
    if (notesDraft === remote) return;

    setNotesState('saving');
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await updateLead(lead.id, { notes: notesDraft });
        setNotesState('saved');
      } catch {
        setNotesState('error');
      }
    }, 750);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [lead?.id, lead?.notes, notesDraft]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const s = await getAppSettings();
        if (mounted) setSettings(s);
      } catch {
        if (mounted) setSettings(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const whatsappMessage = useMemo(() => {
    if (!lead) return '';
    const template =
      settings?.defaultWhatsappTemplate ||
      "Hi {name}, thanks for your request. I see you’re in {suburb}. When can we call you today?";
    return renderWhatsappTemplate(template, {
      name: lead.fullName || 'there',
      suburb: lead.suburb || 'your area',
      campaign: lead.campaignNameSnapshot || 'our campaign',
      serviceType: (lead as any).serviceType ?? '',
    });
  }, [lead, settings?.defaultWhatsappTemplate]);

  const whatsappLink = useMemo(() => {
    const number = lead?.phone || '';
    if (!number || !whatsappMessage) return null;
    return buildWaMeLink(number, whatsappMessage);
  }, [lead?.phone, whatsappMessage]);

  const createdDate = useMemo(() => (lead ? toDateMaybe(lead.createdAt) : null), [lead?.createdAt, lead]);
  const updatedDate = useMemo(() => (lead ? toDateMaybe(lead.updatedAt) : null), [lead?.updatedAt, lead]);
  const contactedDate = useMemo(() => (lead ? toDateMaybe(lead.contactedAt) : null), [lead?.contactedAt, lead]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNotesDraft((prev) => (prev ? `${prev}\n${transcript}` : transcript));
        notesDirtyRef.current = true;
        setIsListening(false);
        showToast('Voice note added', 'success');
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        showToast('Speech recognition failed', 'error');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        showToast('Speech recognition not supported in this browser', 'error');
        return;
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  if (!leadId) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lw-page-container"
      >
        <Card className="p-5 lw-tactile-card">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Missing lead ID</div>
          <div className="mt-2 text-[13px] leading-5 text-text-secondary">Go back and open a lead again.</div>
        </Card>
      </motion.main>
    );
  }

  const statusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'BOOKED', 'QUOTED', 'WON', 'LOST'];

  return (
    <BottomSheet
      isOpen
      onClose={() => navigate('/leads')}
      title={lead && lead.fullName ? lead.fullName : lead === undefined ? 'Loading…' : 'Lead details'}
    >
      {lead === undefined && (
        <Card className="p-5 lw-tactile-card overflow-hidden">
          <div className="lw-skeleton h-4 w-40 rounded-[12px]" />
          <div className="mt-3 lw-skeleton h-3 w-56 rounded-[12px]" />
          <div className="mt-2 lw-skeleton h-3 w-44 rounded-[12px]" />
        </Card>
      )}

      {lead === null && (
        <Card className="p-5 lw-tactile-card">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Lead not found</div>
          <div className="mt-2 text-[13px] leading-5 text-text-secondary">This lead link may be expired or removed.</div>
          <div className="mt-4">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/leads')}>
              Back to leads
            </Button>
          </div>
        </Card>
      )}

      {lead && (
        <div className="space-y-4">
          <Card className="p-5 lw-tactile-card border-none shadow-tactile border-l-4 border-l-primary/40">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] leading-5 text-text-secondary">
                  {lead.suburb || '—'} • {lead.monthlyBillRange} • {lead.timeline}
                  {(lead as any).serviceType ? ` • ${(lead as any).serviceType}` : ''}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusPill status={lead.status} />
                  <span className="lw-status-pill lw-status--contacted">{lead.sourceTypeSnapshot}</span>
                </div>
                <div className="mt-2 text-[12px] leading-4 font-medium text-text-secondary truncate uppercase tracking-wider">
                  {lead.campaignNameSnapshot || 'Campaign'}
                </div>
              </div>

              <div className="w-[12.5rem] max-w-[45%]">
                <label className="block text-[12px] leading-4 font-bold text-text-secondary mb-2 uppercase tracking-wide">Status</label>
                <select
                  value={lead.status}
                  onChange={async (e) => {
                    const next = e.target.value as LeadStatus;
                    try {
                      await setLeadStatus(lead.id, next);
                      showToast('Status updated', 'success');
                    } catch {
                      showToast('Failed to update status', 'error');
                    }
                  }}
                  className="w-full h-12 rounded-[14px] border border-border-subtle bg-surface/30 px-3 text-[13px] font-semibold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <Button
                variant="whatsapp"
                className="w-full h-14 rounded-2xl shadow-lg shadow-whatsapp/20 font-bold"
                disabled={!whatsappLink}
                onClick={async () => {
                  if (!lead || !whatsappLink) return;
                  window.open(whatsappLink, '_blank', 'noopener,noreferrer');
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
              >
                <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
                  <path
                    d="M16.5 14.5c-.2.6-1.2 1.4-2 1.1-.4-.2-.8-.3-1.1-.6-.2-.2-.4-.5-.6-.7-.2-.3-.4-.3-.7-.2-.4.1-.9.3-1.4.2-.4-.1-.7-.5-1-1s-.6-1.7-.9-2.3c-.3-.6-.1-.9.1-1.1.2-.2.4-.5.6-.8.2-.3.3-.4.4-.7.1-.3 0-.5-.1-.6-.1-.2-.9-2.3-1.2-2.5-.3-.2-.6-.2-.9-.2-.3 0-.6 0-.9 0-.3 0-.7.2-.9.6-.1.4-.5 1.1-.5 2s.6 1.9.7 2.1c.2.3.3.7.7 1.2.4.5 1.1 1.2 2.2 1.9.8.5 1.3.7 1.9.7.6 0 1.3-.3 1.6-.6.3-.3.6-.5.9-.4.3 0 .8.2 1.1.5.2.3.2.7.1.9Z"
                    fill="#ffffff"
                  />
                </svg>
                WhatsApp Lead
              </Button>

              <Button
                variant="secondary"
                className="w-full h-14 rounded-2xl bg-surface/40 border-none"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(lead.phone || '');
                    showToast('Phone copied', 'success');
                  } catch {
                    showToast('Copy failed', 'error');
                  }
                }}
              >
                Copy phone
              </Button>
            </div>
          </Card>

          <Card className="p-5 lw-tactile-card border-none bg-surface/10">
            <div className="text-[18px] leading-6 font-bold text-text-primary uppercase tracking-tight">Details</div>
            <dl className="mt-4 grid grid-cols-2 gap-6">
              <div>
                <dt className="text-[12px] leading-4 font-bold text-text-secondary uppercase tracking-widest">Phone</dt>
                <dd className="mt-1 text-[13px] leading-5 font-semibold text-text-primary break-words">{lead.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-[12px] leading-4 font-bold text-text-secondary uppercase tracking-widest">Created</dt>
                <dd className="mt-1 text-[13px] leading-5 font-semibold text-text-primary">
                  {createdDate ? formatHumanDateTime(createdDate) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] leading-4 font-bold text-text-secondary uppercase tracking-widest">Contacted</dt>
                <dd className="mt-1 text-[13px] leading-5 font-semibold text-text-primary">
                  {contactedDate ? formatHumanDateTime(contactedDate) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] leading-4 font-bold text-text-secondary uppercase tracking-widest">Updated</dt>
                <dd className="mt-1 text-[13px] leading-5 font-semibold text-text-primary">
                  {updatedDate ? formatTimeSince(updatedDate) : '—'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5 lw-tactile-card border-none">
            <div className="flex items-center justify-between">
              <div className="text-[18px] leading-6 font-bold text-text-primary uppercase tracking-tight">Notes</div>
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-surface/50 text-text-secondary hover:bg-surface/80'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                {isListening ? 'Listening...' : 'Dictate'}
              </button>
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => {
                notesDirtyRef.current = true;
                if (notesState !== 'saving') setNotesState('idle');
                setNotesDraft(e.target.value);
              }}
              placeholder="Add a note…"
              rows={5}
              className="mt-4 w-full rounded-[20px] border border-border-subtle bg-surface/20 px-4 py-3 text-[14px] leading-relaxed text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
            />

            <div className="mt-3 flex items-center justify-between text-[11px] leading-4 font-bold uppercase tracking-wider">
              <div className="text-text-secondary">
                {notesState === 'saving' ? (
                  <span className="text-primary animate-pulse">Saving…</span>
                ) : notesState === 'saved' ? (
                  <span className="text-success">Saved</span>
                ) : notesState === 'error' ? (
                  <span className="text-error">Save failed</span>
                ) : (
                  ''
                )}
              </div>
              <div className="text-text-secondary">{notesDraft.length > 0 ? `${notesDraft.length} chars` : ''}</div>
            </div>
          </Card>
        </div>
      )}
    </BottomSheet>
  );
};

export default LeadDetailPage;
