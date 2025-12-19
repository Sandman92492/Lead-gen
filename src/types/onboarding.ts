export type OnboardingProgress = {
  businessSetupComplete: boolean;
  offerSetupComplete: boolean;
  whatsappTemplateComplete: boolean;
  firstCampaignCreated: boolean;
  firstShareComplete: boolean;
  firstLeadHandled: boolean;
};

export type OnboardingStep = 
  | 'welcome'
  | 'business'
  | 'offer'
  | 'whatsapp'
  | 'campaign'
  | 'share'
  | 'complete';

export const DEFAULT_ONBOARDING_PROGRESS: OnboardingProgress = {
  businessSetupComplete: false,
  offerSetupComplete: false,
  whatsappTemplateComplete: false,
  firstCampaignCreated: false,
  firstShareComplete: false,
  firstLeadHandled: false,
};

export const ONBOARDING_STEPS: { id: keyof OnboardingProgress; label: string; description: string }[] = [
  { id: 'businessSetupComplete', label: 'Add business info', description: 'Name, WhatsApp number, logo' },
  { id: 'offerSetupComplete', label: 'Create your offer', description: 'What you\'re offering leads' },
  { id: 'whatsappTemplateComplete', label: 'Set WhatsApp template', description: 'Your instant follow-up message' },
  { id: 'firstCampaignCreated', label: 'Create first campaign', description: 'Get a QR code to share' },
  { id: 'firstShareComplete', label: 'Share your link', description: 'Put it in the real world' },
  { id: 'firstLeadHandled', label: 'Handle your first lead', description: 'Contact and track a lead' },
];
