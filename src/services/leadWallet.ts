import * as firebaseService from './leadWallet.firebase';
import * as mockService from './leadWallet.mock';

type LeadWalletService = typeof firebaseService;

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;
const service: LeadWalletService = mode === 'firebase' ? firebaseService : (mockService as unknown as LeadWalletService);

export const DEFAULT_APP_SETTINGS = firebaseService.DEFAULT_APP_SETTINGS;
export const normalizeAppSettings = firebaseService.normalizeAppSettings;
export const normalizePublicSettings = firebaseService.normalizePublicSettings;

export const getAppSettings = service.getAppSettings;
export const subscribeAppSettings = (service as any).subscribeAppSettings as typeof firebaseService.subscribeAppSettings;
export const saveAppSettings = service.saveAppSettings;
export const getPublicSettings = service.getPublicSettings;

export const subscribeCampaigns = service.subscribeCampaigns;
export const getCampaignById = service.getCampaignById;
export const getCampaignBySlug = service.getCampaignBySlug;
export const createCampaign = service.createCampaign;
export const getLeadCountByCampaignId = service.getLeadCountByCampaignId;
export const fetchLeads = service.fetchLeads;

export const subscribeLeads = service.subscribeLeads;
export const subscribeLead = service.subscribeLead;
export const updateLead = service.updateLead;
export const markLeadContacted = service.markLeadContacted;
export const setLeadStatus = service.setLeadStatus;

export const createLeadAndPublicPass = service.createLeadAndPublicPass;
export const getPublicPassByLeadId = service.getPublicPassByLeadId;
