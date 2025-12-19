import type { AppSettings, Campaign, CampaignSourceType, Lead, LeadStatus, PublicPass, PublicSettings } from '../types/leadWallet';
import { DEFAULT_APP_SETTINGS } from './leadWallet.firebase';
import { generateMockId } from './mockDb';
import { slugify } from '../utils/slug';

type StoredTimestamp = string | null;

type StoredCampaign = Omit<Campaign, 'createdAt'> & { createdAt: StoredTimestamp };
type StoredLead = Omit<Lead, 'createdAt' | 'updatedAt' | 'contactedAt'> & {
  createdAt: StoredTimestamp;
  updatedAt: StoredTimestamp;
  contactedAt?: StoredTimestamp | null;
};
type StoredPass = Omit<PublicPass, 'leadId' | 'validUntil'> & { validUntil: StoredTimestamp };

type LeadWalletMockState = {
  version: 1;
  seededAt: string;
  appSettings: AppSettings;
  campaigns: StoredCampaign[];
  leads: StoredLead[];
  publicPasses: Record<string, StoredPass>;
};

const LEAD_WALLET_MOCK_KEY = 'lead_wallet_mock_v1';
const LEAD_WALLET_MOCK_EVENT = 'lead_wallet_mock_updated_v1';

let inMemoryState: LeadWalletMockState | null = null;

const isBrowser = (): boolean => typeof window !== 'undefined';
const hasLocalStorage = (): boolean => typeof localStorage !== 'undefined';

const safeJsonParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const seedState = (): LeadWalletMockState => {
  const now = new Date().toISOString();
  return {
    version: 1,
    seededAt: now,
    appSettings: DEFAULT_APP_SETTINGS,
    campaigns: [],
    leads: [],
    publicPasses: {},
  };
};

const isValidState = (value: unknown): value is LeadWalletMockState => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<LeadWalletMockState>;
  if (candidate.version !== 1) return false;
  if (typeof candidate.seededAt !== 'string') return false;
  if (!candidate.appSettings || typeof candidate.appSettings !== 'object') return false;
  if (!Array.isArray(candidate.campaigns)) return false;
  if (!Array.isArray(candidate.leads)) return false;
  if (!candidate.publicPasses || typeof candidate.publicPasses !== 'object') return false;
  return true;
};

const readState = (): LeadWalletMockState => {
  if (inMemoryState) return inMemoryState;

  if (!isBrowser() || !hasLocalStorage()) {
    inMemoryState = seedState();
    return inMemoryState;
  }

  const raw = localStorage.getItem(LEAD_WALLET_MOCK_KEY);
  if (!raw) {
    const seeded = seedState();
    localStorage.setItem(LEAD_WALLET_MOCK_KEY, JSON.stringify(seeded));
    inMemoryState = seeded;
    return seeded;
  }

  const parsed = safeJsonParse(raw);
  if (!isValidState(parsed)) {
    const seeded = seedState();
    localStorage.setItem(LEAD_WALLET_MOCK_KEY, JSON.stringify(seeded));
    inMemoryState = seeded;
    return seeded;
  }

  inMemoryState = parsed;
  return parsed;
};

const writeState = (next: LeadWalletMockState): void => {
  inMemoryState = next;
  if (!isBrowser() || !hasLocalStorage()) return;
  try {
    localStorage.setItem(LEAD_WALLET_MOCK_KEY, JSON.stringify(next));
  } catch {
    // Ignore persistence errors
  }
};

const notify = (): void => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(LEAD_WALLET_MOCK_EVENT));
};

const toTimestamp = (iso: StoredTimestamp | undefined): any => {
  if (!iso) return null;
  return {
    toDate: () => new Date(iso),
  };
};

const normalizeCampaign = (stored: StoredCampaign): Campaign => ({
  ...stored,
  createdAt: toTimestamp(stored.createdAt),
});

const normalizeLead = (stored: StoredLead): Lead => ({
  ...stored,
  createdAt: toTimestamp(stored.createdAt),
  updatedAt: toTimestamp(stored.updatedAt),
  contactedAt: toTimestamp(stored.contactedAt ?? null),
});

const normalizePass = (leadId: string, stored: StoredPass): PublicPass => ({
  leadId,
  ...stored,
  validUntil: toTimestamp(stored.validUntil),
});

const sortByCreatedAtDesc = <T extends { createdAt: StoredTimestamp }>(items: T[]): T[] => {
  const toMs = (iso: StoredTimestamp): number => (iso ? new Date(iso).getTime() : 0);
  return [...items].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
};

const subscribeToState = (onChange: () => void): (() => void) => {
  onChange();
  if (!isBrowser()) return () => { };

  const onStorage = (e: StorageEvent) => {
    if (e.key !== LEAD_WALLET_MOCK_KEY) return;
    inMemoryState = null;
    onChange();
  };
  const onCustom = () => onChange();

  window.addEventListener('storage', onStorage);
  window.addEventListener(LEAD_WALLET_MOCK_EVENT, onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LEAD_WALLET_MOCK_EVENT, onCustom);
  };
};

export const getAppSettings = async (): Promise<AppSettings> => {
  const state = readState();
  return state.appSettings;
};

export const subscribeAppSettings = (onValue: (settings: AppSettings) => void) => {
  return subscribeToState(() => {
    const state = readState();
    onValue(state.appSettings);
  });
};

export const saveAppSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  const state = readState();
  writeState({ ...state, appSettings: { ...state.appSettings, ...settings } });
  notify();
};

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const state = readState();
  const s = state.appSettings;
  return {
    businessName: s.businessName,
    logoUrl: s.logoUrl,
    whatsappNumber: s.whatsappNumber,
    offerTitle: s.offerTitle,
    offerBullets: s.offerBullets,
    passValidityDays: s.passValidityDays,
    budgetLabel: s.budgetLabel,
    budgetOptions: s.budgetOptions,
    timelineLabel: s.timelineLabel,
    timelineOptions: s.timelineOptions,
    serviceTypeEnabled: s.serviceTypeEnabled,
    serviceTypeLabel: s.serviceTypeLabel,
    serviceTypeOptions: s.serviceTypeOptions,
  };
};

export const subscribeCampaigns = (onValue: (campaigns: Campaign[]) => void) => {
  return subscribeToState(() => {
    const state = readState();
    onValue(sortByCreatedAtDesc(state.campaigns).map(normalizeCampaign));
  });
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  const state = readState();
  const found = state.campaigns.find((c) => c.id === campaignId);
  return found ? normalizeCampaign(found) : null;
};

export const getCampaignBySlug = async (campaignSlug: string): Promise<Campaign | null> => {
  const state = readState();
  const found = state.campaigns.find((c) => c.slug === campaignSlug && c.isLive);
  return found ? normalizeCampaign(found) : null;
};

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

export const createCampaign = async (
  input: { name: string; sourceType: CampaignSourceType }
): Promise<{ campaignId: string; slug: string }> => {
  const state = readState();
  const now = new Date().toISOString();

  const base = slugify(input.name);
  const initial = base || `campaign-${randomSuffix()}`;

  let slug = initial;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (!state.campaigns.some((c) => c.slug === slug)) break;
    slug = `${initial}-${randomSuffix()}`;
  }

  const campaignId = generateMockId('campaign');
  const campaign: StoredCampaign = {
    id: campaignId,
    name: input.name.trim(),
    slug,
    sourceType: input.sourceType,
    isLive: true,
    createdAt: now,
  };

  writeState({ ...state, campaigns: [...state.campaigns, campaign] });
  notify();
  return { campaignId, slug };
};

export const subscribeLeads = (onValue: (leads: Lead[]) => void, opts?: { limit?: number }) => {
  return subscribeToState(() => {
    const state = readState();
    const sorted = sortByCreatedAtDesc(state.leads);
    const limited = sorted.slice(0, opts?.limit ?? 200);
    onValue(limited.map(normalizeLead));
  });
};

export const subscribeLead = (leadId: string, onValue: (lead: Lead | null) => void) => {
  return subscribeToState(() => {
    const state = readState();
    const found = state.leads.find((l) => l.id === leadId);
    onValue(found ? normalizeLead(found) : null);
  });
};

export const updateLead = async (leadId: string, patch: Partial<Pick<Lead, 'status' | 'notes'>>): Promise<void> => {
  const state = readState();
  const now = new Date().toISOString();
  const nextLeads = state.leads.map((lead) => {
    if (lead.id !== leadId) return lead;
    return {
      ...lead,
      ...(patch.status ? { status: patch.status } : {}),
      ...(typeof patch.notes === 'string' ? { notes: patch.notes } : {}),
      updatedAt: now,
    };
  });
  writeState({ ...state, leads: nextLeads });
  notify();
};

export const markLeadContacted = async (leadId: string): Promise<void> => {
  const state = readState();
  const now = new Date().toISOString();
  const nextLeads = state.leads.map((lead) => {
    if (lead.id !== leadId) return lead;
    return { ...lead, contactedAt: now, updatedAt: now };
  });
  writeState({ ...state, leads: nextLeads });
  notify();
};

export const setLeadStatus = async (leadId: string, status: LeadStatus): Promise<void> => {
  const state = readState();
  const now = new Date().toISOString();
  const nextLeads = state.leads.map((lead) => {
    if (lead.id !== leadId) return lead;
    const next: StoredLead = { ...lead, status, updatedAt: now };
    if (status === 'CONTACTED' && !next.contactedAt) next.contactedAt = now;
    return next;
  });
  writeState({ ...state, leads: nextLeads });
  notify();
};

export const createLeadAndPublicPass = async (input: {
  campaign: Campaign;
  settings: PublicSettings;
  fullName: string;
  phone: string;
  suburb: string;
  monthlyBillRange: Lead['monthlyBillRange'];
  timeline: Lead['timeline'];
  serviceType?: string | null;
}): Promise<{ leadId: string }> => {
  const state = readState();
  const now = new Date().toISOString();
  const leadId = generateMockId('lead');

  const lead: StoredLead = {
    id: leadId,
    campaignId: input.campaign.id,
    campaignSlugSnapshot: input.campaign.slug,
    campaignNameSnapshot: input.campaign.name,
    sourceTypeSnapshot: input.campaign.sourceType,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    suburb: input.suburb.trim(),
    monthlyBillRange: input.monthlyBillRange,
    timeline: input.timeline,
    ...(typeof input.serviceType === 'string' ? { serviceType: input.serviceType } : input.serviceType === null ? { serviceType: null } : {}),
    status: 'NEW',
    notes: '',
    createdAt: now,
    updatedAt: now,
    contactedAt: null,
  };

  const firstName = lead.fullName.trim().split(/\s+/).filter(Boolean)[0] || undefined;
  const validUntil = new Date(Date.now() + input.settings.passValidityDays * 24 * 60 * 60 * 1000).toISOString();

  const pass: StoredPass = {
    offerTitle: input.settings.offerTitle,
    offerBullets: input.settings.offerBullets,
    validUntil,
    whatsappNumber: input.settings.whatsappNumber,
    businessName: input.settings.businessName,
    logoUrl: input.settings.logoUrl,
    ...(firstName ? { firstName } : {}),
    ...(input.campaign.name ? { campaignName: input.campaign.name } : {}),
  };

  writeState({
    ...state,
    leads: [...state.leads, lead],
    publicPasses: { ...state.publicPasses, [leadId]: pass },
  });
  notify();
  return { leadId };
};

export const getPublicPassByLeadId = async (leadId: string): Promise<PublicPass | null> => {
  const state = readState();
  const stored = state.publicPasses[leadId];
  return stored ? normalizePass(leadId, stored) : null;
};

export const getLeadCountByCampaignId = async (campaignId: string): Promise<number> => {
  const state = readState();
  return state.leads.filter((lead) => lead.campaignId === campaignId).length;
};

export const fetchLeads = async (opts?: { limit?: number }): Promise<Lead[]> => {
  const state = readState();
  const sorted = sortByCreatedAtDesc(state.leads);
  return sorted.slice(0, opts?.limit ?? 5000).map(normalizeLead);
};

// Delete a campaign by ID
export const deleteCampaign = async (campaignId: string) => {
  const state = readState();
  const updated = state.campaigns.filter((c) => c.id !== campaignId);
  writeState({ ...state, campaigns: updated });
  notify();
};
