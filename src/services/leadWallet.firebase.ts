import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
  getCountFromServer,
  deleteDoc,
} from 'firebase/firestore';

import type { AppSettings, Campaign, CampaignSourceType, Lead, LeadStatus, PublicPass, PublicSettings } from '../types/leadWallet';
import { industryPresets } from '../config/industryPresets';
import { slugify } from '../utils/slug';

const isFirebaseMode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') === 'firebase';

const requireDb = () => {
  if (!isFirebaseMode || !db) throw new Error('Firebase mode is disabled.');
  return db;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  industryPreset: 'general',
  businessName: 'Lead Wallet',
  logoUrl: '',
  linkDisplayMode: 'classic',
  brandedPrefix: '',
  whatsappNumber: '27',
  defaultWhatsappTemplate: industryPresets.general.defaultWhatsappTemplate,
  offerTitle: industryPresets.general.offerTitle,
  offerBullets: industryPresets.general.offerBullets as any,
  passValidityDays: 7,

  budgetLabel: industryPresets.general.budgetLabel,
  budgetOptions: [...industryPresets.general.budgetOptions],
  timelineLabel: industryPresets.general.timelineLabel,
  timelineOptions: [...industryPresets.general.timelineOptions],

  serviceTypeEnabled: industryPresets.general.serviceTypeEnabled,
  serviceTypeLabel: industryPresets.general.serviceTypeLabel,
  serviceTypeOptions: [...industryPresets.general.serviceTypeOptions],
};

const pickString = (value: unknown, fallback: string): string => (typeof value === 'string' ? value : fallback);
const pickNumber = (value: unknown, fallback: number): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const pickBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);
const pickLinkDisplayMode = (value: unknown, fallback: AppSettings['linkDisplayMode']): AppSettings['linkDisplayMode'] =>
  value === 'classic' || value === 'branded' ? value : fallback;
const pickStringArray = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) return fallback;
  const next = value.filter((v) => typeof v === 'string') as string[];
  return next.length > 0 ? next : fallback;
};
const pickBullets = (value: unknown, fallback: [string, string, string]): [string, string, string] => {
  if (!Array.isArray(value)) return fallback;
  const a = typeof value[0] === 'string' ? value[0] : fallback[0];
  const b = typeof value[1] === 'string' ? value[1] : fallback[1];
  const c = typeof value[2] === 'string' ? value[2] : fallback[2];
  return [a, b, c];
};

export const normalizeAppSettings = (data: DocumentData | null | undefined): AppSettings => {
  const d = data || {};
  return {
    industryPreset: pickString(d.industryPreset, DEFAULT_APP_SETTINGS.industryPreset),
    businessName: pickString(d.businessName, DEFAULT_APP_SETTINGS.businessName),
    logoUrl: pickString(d.logoUrl, DEFAULT_APP_SETTINGS.logoUrl),
    linkDisplayMode: pickLinkDisplayMode(d.linkDisplayMode, DEFAULT_APP_SETTINGS.linkDisplayMode),
    brandedPrefix: pickString(d.brandedPrefix, DEFAULT_APP_SETTINGS.brandedPrefix),
    whatsappNumber: pickString(d.whatsappNumber, DEFAULT_APP_SETTINGS.whatsappNumber),
    defaultWhatsappTemplate: pickString(d.defaultWhatsappTemplate, DEFAULT_APP_SETTINGS.defaultWhatsappTemplate),
    offerTitle: pickString(d.offerTitle, DEFAULT_APP_SETTINGS.offerTitle),
    offerBullets: pickBullets(d.offerBullets, DEFAULT_APP_SETTINGS.offerBullets),
    passValidityDays: Math.max(1, Math.min(365, pickNumber(d.passValidityDays, DEFAULT_APP_SETTINGS.passValidityDays))),

    budgetLabel: pickString(d.budgetLabel, DEFAULT_APP_SETTINGS.budgetLabel),
    budgetOptions: pickStringArray(d.budgetOptions, DEFAULT_APP_SETTINGS.budgetOptions),
    timelineLabel: pickString(d.timelineLabel, DEFAULT_APP_SETTINGS.timelineLabel),
    timelineOptions: pickStringArray(d.timelineOptions, DEFAULT_APP_SETTINGS.timelineOptions),

    serviceTypeEnabled: pickBoolean(d.serviceTypeEnabled, DEFAULT_APP_SETTINGS.serviceTypeEnabled),
    serviceTypeLabel: pickString(d.serviceTypeLabel, DEFAULT_APP_SETTINGS.serviceTypeLabel),
    serviceTypeOptions: pickStringArray(d.serviceTypeOptions, DEFAULT_APP_SETTINGS.serviceTypeOptions),
  };
};

export const getAppSettings = async (): Promise<AppSettings> => {
  const database = requireDb();
  const ref = doc(database, 'settings', 'app');
  const snap = await getDoc(ref);
  return normalizeAppSettings(snap.data());
};

export const subscribeAppSettings = (onValue: (settings: AppSettings) => void): Unsubscribe => {
  const database = requireDb();
  const ref = doc(database, 'settings', 'app');
  return onSnapshot(ref, (snap) => {
    onValue(normalizeAppSettings(snap.data()));
  });
};

export const saveAppSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  const database = requireDb();
  const appRef = doc(database, 'settings', 'app');
  const publicRef = doc(database, 'settings', 'public');

  const batch = writeBatch(database);
  batch.set(appRef, { ...settings, updatedAt: serverTimestamp() } as any, { merge: true });

  const publicSlice: Partial<PublicSettings> = {};
  if (typeof settings.businessName === 'string') publicSlice.businessName = settings.businessName;
  if (typeof settings.logoUrl === 'string') publicSlice.logoUrl = settings.logoUrl;
  if (typeof settings.whatsappNumber === 'string') publicSlice.whatsappNumber = settings.whatsappNumber;
  if (typeof settings.offerTitle === 'string') publicSlice.offerTitle = settings.offerTitle;
  if (Array.isArray(settings.offerBullets)) publicSlice.offerBullets = settings.offerBullets as any;
  if (typeof settings.passValidityDays === 'number') publicSlice.passValidityDays = settings.passValidityDays;
  if (typeof settings.budgetLabel === 'string') publicSlice.budgetLabel = settings.budgetLabel;
  if (Array.isArray(settings.budgetOptions)) publicSlice.budgetOptions = settings.budgetOptions as any;
  if (typeof settings.timelineLabel === 'string') publicSlice.timelineLabel = settings.timelineLabel;
  if (Array.isArray(settings.timelineOptions)) publicSlice.timelineOptions = settings.timelineOptions as any;
  if (typeof settings.serviceTypeEnabled === 'boolean') publicSlice.serviceTypeEnabled = settings.serviceTypeEnabled;
  if (typeof settings.serviceTypeLabel === 'string') publicSlice.serviceTypeLabel = settings.serviceTypeLabel;
  if (Array.isArray(settings.serviceTypeOptions)) publicSlice.serviceTypeOptions = settings.serviceTypeOptions as any;
  batch.set(publicRef, { ...publicSlice, updatedAt: serverTimestamp() } as any, { merge: true });

  await batch.commit();
};

export const normalizePublicSettings = (data: DocumentData | null | undefined): PublicSettings => {
  const d = data || {};
  return {
    businessName: pickString(d.businessName, DEFAULT_APP_SETTINGS.businessName),
    logoUrl: pickString(d.logoUrl, DEFAULT_APP_SETTINGS.logoUrl),
    whatsappNumber: pickString(d.whatsappNumber, DEFAULT_APP_SETTINGS.whatsappNumber),
    offerTitle: pickString(d.offerTitle, DEFAULT_APP_SETTINGS.offerTitle),
    offerBullets: pickBullets(d.offerBullets, DEFAULT_APP_SETTINGS.offerBullets),
    passValidityDays: Math.max(1, Math.min(365, pickNumber(d.passValidityDays, DEFAULT_APP_SETTINGS.passValidityDays))),

    budgetLabel: pickString(d.budgetLabel, DEFAULT_APP_SETTINGS.budgetLabel),
    budgetOptions: pickStringArray(d.budgetOptions, DEFAULT_APP_SETTINGS.budgetOptions),
    timelineLabel: pickString(d.timelineLabel, DEFAULT_APP_SETTINGS.timelineLabel),
    timelineOptions: pickStringArray(d.timelineOptions, DEFAULT_APP_SETTINGS.timelineOptions),

    serviceTypeEnabled: pickBoolean(d.serviceTypeEnabled, DEFAULT_APP_SETTINGS.serviceTypeEnabled),
    serviceTypeLabel: pickString(d.serviceTypeLabel, DEFAULT_APP_SETTINGS.serviceTypeLabel),
    serviceTypeOptions: pickStringArray(d.serviceTypeOptions, DEFAULT_APP_SETTINGS.serviceTypeOptions),
  };
};

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const database = requireDb();
  const ref = doc(database, 'settings', 'public');
  const snap = await getDoc(ref);
  return normalizePublicSettings(snap.data());
};

const normalizeCampaign = (id: string, data: DocumentData): Campaign => ({
  id,
  name: pickString(data.name, 'Untitled campaign'),
  slug: pickString(data.slug, id),
  sourceType: pickString(data.sourceType, 'Other') as CampaignSourceType,
  isLive: Boolean(data.isLive),
  createdAt: (data.createdAt ?? null) as any,
});

export const subscribeCampaigns = (onValue: (campaigns: Campaign[]) => void): Unsubscribe => {
  const database = requireDb();
  const q = query(collection(database, 'campaigns'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const next = snap.docs.map((d) => normalizeCampaign(d.id, d.data()));
    onValue(next);
  });
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  const database = requireDb();
  const ref = doc(database, 'campaigns', campaignId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeCampaign(snap.id, snap.data());
};

export const getCampaignBySlug = async (campaignSlug: string): Promise<Campaign | null> => {
  const database = requireDb();
  const q = query(
    collection(database, 'campaigns'),
    where('slug', '==', campaignSlug),
    where('isLive', '==', true),
    limit(1)
  );
  const snap = await getDocs(q);
  const docSnap = snap.docs[0];
  if (!docSnap) return null;
  return normalizeCampaign(docSnap.id, docSnap.data());
};

export const deleteCampaign = async (campaignId: string) => {
  const database = requireDb();
  const ref = doc(database, 'campaigns', campaignId);
  await deleteDoc(ref);
};

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

export const createCampaign = async (
  input: { name: string; sourceType: CampaignSourceType }
): Promise<{ campaignId: string; slug: string }> => {
  const database = requireDb();
  const base = slugify(input.name);
  const initial = base || `campaign-${randomSuffix()}`;

  let slug = initial;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const check = query(collection(database, 'campaigns'), where('slug', '==', slug), limit(1));
    const existing = await getDocs(check);
    if (existing.empty) break;
    slug = `${initial}-${randomSuffix()}`;
  }

  const ref = doc(collection(database, 'campaigns'));
  await setDoc(ref, {
    name: input.name.trim(),
    slug,
    sourceType: input.sourceType,
    isLive: true,
    createdAt: serverTimestamp(),
  });

  return { campaignId: ref.id, slug };
};

const normalizeLead = (id: string, data: DocumentData): Lead => ({
  id,
  campaignId: pickString(data.campaignId, ''),
  campaignSlugSnapshot: pickString(data.campaignSlugSnapshot, ''),
  campaignNameSnapshot: pickString(data.campaignNameSnapshot, ''),
  sourceTypeSnapshot: pickString(data.sourceTypeSnapshot, 'Other') as CampaignSourceType,
  fullName: pickString(data.fullName, ''),
  phone: pickString(data.phone, ''),
  suburb: pickString(data.suburb, ''),
  monthlyBillRange: pickString(data.monthlyBillRange, 'Not sure'),
  timeline: pickString(data.timeline, 'Just checking'),
  serviceType: typeof data.serviceType === 'string' ? data.serviceType : data.serviceType === null ? null : undefined,
  status: pickString(data.status, 'NEW') as LeadStatus,
  notes: pickString(data.notes, ''),
  createdAt: (data.createdAt ?? null) as any,
  updatedAt: (data.updatedAt ?? null) as any,
  contactedAt: (data.contactedAt ?? null) as any,
});

export const subscribeLeads = (onValue: (leads: Lead[]) => void, opts?: { limit?: number }): Unsubscribe => {
  const database = requireDb();
  const q = query(collection(database, 'leads'), orderBy('createdAt', 'desc'), limit(opts?.limit ?? 200));
  return onSnapshot(q, (snap) => {
    onValue(snap.docs.map((d) => normalizeLead(d.id, d.data({ serverTimestamps: 'estimate' }))));
  });
};

export const subscribeLead = (leadId: string, onValue: (lead: Lead | null) => void): Unsubscribe => {
  const database = requireDb();
  const ref = doc(database, 'leads', leadId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) onValue(null);
    else onValue(normalizeLead(snap.id, snap.data({ serverTimestamps: 'estimate' })));
  });
};

export const updateLead = async (leadId: string, patch: Partial<Pick<Lead, 'status' | 'notes'>>): Promise<void> => {
  const database = requireDb();
  const ref = doc(database, 'leads', leadId);
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  });
};

export const markLeadContacted = async (leadId: string): Promise<void> => {
  const database = requireDb();
  const ref = doc(database, 'leads', leadId);
  await updateDoc(ref, {
    contactedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const setLeadStatus = async (leadId: string, status: LeadStatus): Promise<void> => {
  const database = requireDb();
  const ref = doc(database, 'leads', leadId);
  const update: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (status === 'CONTACTED') update.contactedAt = serverTimestamp();
  await updateDoc(ref, update);
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
  const database = requireDb();

  const leadRef = doc(collection(database, 'leads'));
  const passRef = doc(database, 'publicPasses', leadRef.id);

  const batch = writeBatch(database);

  batch.set(leadRef, {
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    contactedAt: null,
  });

  const firstName = input.fullName.trim().split(/\s+/).filter(Boolean)[0] || undefined;
  const now = new Date();
  const validUntilDate = new Date(now.getTime() + input.settings.passValidityDays * 24 * 60 * 60 * 1000);

  const pass: Omit<PublicPass, 'leadId'> = {
    offerTitle: input.settings.offerTitle,
    offerBullets: input.settings.offerBullets,
    validUntil: Timestamp.fromDate(validUntilDate),
    whatsappNumber: input.settings.whatsappNumber,
    businessName: input.settings.businessName,
    logoUrl: input.settings.logoUrl,
    ...(firstName ? { firstName } : {}),
    ...(input.campaign.name ? { campaignName: input.campaign.name } : {}),
  };

  batch.set(passRef, pass);
  await batch.commit();
  return { leadId: leadRef.id };
};

export const getPublicPassByLeadId = async (leadId: string): Promise<PublicPass | null> => {
  const database = requireDb();
  const ref = doc(database, 'publicPasses', leadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { leadId, ...(snap.data() as Omit<PublicPass, 'leadId'>) };
};

export const getLeadCountByCampaignId = async (campaignId: string): Promise<number> => {
  const database = requireDb();
  const q = query(collection(database, 'leads'), where('campaignId', '==', campaignId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
};

export const fetchLeads = async (opts?: { limit?: number }): Promise<Lead[]> => {
  const database = requireDb();
  const q = query(collection(database, 'leads'), orderBy('createdAt', 'desc'), limit(opts?.limit ?? 5000));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeLead(d.id, d.data()));
};
