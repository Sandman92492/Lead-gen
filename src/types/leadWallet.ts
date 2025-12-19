import type { Timestamp } from 'firebase/firestore';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'BOOKED' | 'QUOTED' | 'WON' | 'LOST';
export type CampaignSourceType =
  | 'Vehicle'
  | 'Flyer'
  | 'Expo'
  | 'Website'
  | 'GoogleBusiness'
  | 'Facebook'
  | 'Instagram'
  | 'Referral'
  | 'WhatsApp'
  | 'Other';

export type AppSettings = {
  industryPreset: string;
  businessName: string;
  logoUrl: string;
  linkDisplayMode: 'classic' | 'branded';
  brandedPrefix: string;
  whatsappNumber: string; // digits only, e.g. 27791234567
  defaultWhatsappTemplate: string;
  offerTitle: string;
  offerBullets: [string, string, string];
  passValidityDays: number;

  budgetLabel: string;
  budgetOptions: string[];
  timelineLabel: string;
  timelineOptions: string[];

  serviceTypeEnabled: boolean;
  serviceTypeLabel: string;
  serviceTypeOptions: string[];
};

export type PublicSettings = Pick<
  AppSettings,
  | 'businessName'
  | 'logoUrl'
  | 'whatsappNumber'
  | 'offerTitle'
  | 'offerBullets'
  | 'passValidityDays'
  | 'budgetLabel'
  | 'budgetOptions'
  | 'timelineLabel'
  | 'timelineOptions'
  | 'serviceTypeEnabled'
  | 'serviceTypeLabel'
  | 'serviceTypeOptions'
>;

export type Campaign = {
  id: string;
  name: string;
  slug: string;
  sourceType: CampaignSourceType;
  isLive: boolean;
  createdAt: Timestamp | null;
};

export type Lead = {
  id: string;
  campaignId: string;
  campaignSlugSnapshot: string;
  campaignNameSnapshot: string;
  sourceTypeSnapshot: CampaignSourceType;
  fullName: string;
  phone: string;
  suburb: string;
  monthlyBillRange: string;
  timeline: string;
  serviceType?: string | null;
  status: LeadStatus;
  notes: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  contactedAt?: Timestamp | null;
};

export type PublicPass = {
  leadId: string;
  offerTitle: string;
  offerBullets: [string, string, string];
  validUntil: Timestamp | null;
  whatsappNumber: string;
  businessName: string;
  logoUrl: string;
  firstName?: string;
  campaignName?: string;
};
