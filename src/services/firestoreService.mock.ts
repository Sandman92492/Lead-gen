import type { Deal, Vendor } from '../types';
import type { PassDocument, RedemptionDocument } from './firestoreService.firebase';
import { generateMockId, readMockDb, writeMockDb } from './mockDb';
import { createEntryLedgerItem } from './entryLedger';

const PAHP_CACHED_DEALS_KEY = 'pahp_cached_deals_v2';

const isNavigatorOffline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
};

const getCachedDeals = (): Deal[] | null => {
  try {
    const raw = localStorage.getItem(PAHP_CACHED_DEALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as any;
    const dealsCandidate = parsed?.data ? parsed.data : parsed;
    if (!Array.isArray(dealsCandidate)) return null;
    return dealsCandidate as Deal[];
  } catch {
    return null;
  }
};

const setCachedDeals = (deals: Deal[]) => {
  try {
    localStorage.setItem(
      PAHP_CACHED_DEALS_KEY,
      JSON.stringify({ cachedAt: new Date().toISOString(), data: deals })
    );
  } catch {
    // Ignore cache errors
  }
};

const isDeleteFieldSentinel = (value: unknown): value is { _methodName: string } => {
  return !!value && typeof value === 'object' && (value as any)._methodName === 'deleteField';
};

const applyUpdates = <T extends Record<string, any>>(existing: T, updates: Record<string, any>): T => {
  const next = { ...existing };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    if (isDeleteFieldSentinel(value)) {
      delete (next as any)[key];
      continue;
    }
    (next as any)[key] = value;
  }
  return next as T;
};

// Helper function to sort deals by featured status and sortOrder
const sortDeals = (deals: Deal[]): Deal[] => {
  return deals.sort((a, b) => {
    // Primary sort: isFeatured (true first)
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // Secondary sort: sortOrder (ascending)
    const aOrder = a.sortOrder || 999;
    const bOrder = b.sortOrder || 999;
    return aOrder - bOrder;
  });
};

const withCategoryFromVendor = (deal: Deal, vendors: Vendor[]): Deal => {
  if (deal.category || !deal.vendorId) return deal;
  const vendor = vendors.find((v) => v.vendorId === deal.vendorId);
  if (!vendor) return deal;
  return { ...deal, category: vendor.category };
};

// --- PASSES ---

export const createPass = async (pass: PassDocument) => {
  try {
    const state = readMockDb();
    const createdAt = new Date().toISOString();
    const nextPass: PassDocument = { ...pass, createdAt };

    const existingIndex = state.passes.findIndex((p) => p.passId === pass.passId);
    const nextPasses =
      existingIndex >= 0
        ? state.passes.map((p, i) => (i === existingIndex ? nextPass : p))
        : [...state.passes, nextPass];

    writeMockDb({ ...state, passes: nextPasses });
    return { success: true };
  } catch (error: any) {
    console.error('Error creating pass (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getPassById = async (passId: string): Promise<PassDocument | null> => {
  try {
    const state = readMockDb();
    return state.passes.find((p) => p.passId === passId) || null;
  } catch (error: any) {
    console.error('Error getting pass (mock):', error);
    return null;
  }
};

export const getPassesByUserId = async (userId: string): Promise<PassDocument[]> => {
  try {
    const state = readMockDb();
    return state.passes.filter((p) => p.userId === userId);
  } catch (error: any) {
    console.error('Error getting passes (mock):', error);
    return [];
  }
};

export const getPassesByEmail = async (email: string): Promise<PassDocument[]> => {
  try {
    const state = readMockDb();
    return state.passes.filter((p) => p.email === email);
  } catch (error: any) {
    console.error('Error getting passes by email (mock):', error);
    return [];
  }
};

export const updatePass = async (passId: string, updates: Partial<PassDocument>) => {
  try {
    const state = readMockDb();
    const existing = state.passes.find((p) => p.passId === passId);
    if (!existing) return { success: false, error: 'Pass not found' };

    const nextPass = applyUpdates(existing, updates as Record<string, any>);
    const nextPasses = state.passes.map((p) => (p.passId === passId ? nextPass : p));

    writeMockDb({ ...state, passes: nextPasses });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating pass (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

// --- REDEMPTIONS (ENTRIES LEDGER) ---

export const recordRedemption = async (
  passId: string,
  dealName: string,
  vendorId: string,
  userId: string,
  userEmail?: string,
  userName?: string
) => {
  return createEntryLedgerItem(
    {
      appendEntry: async (entry: RedemptionDocument) => {
        const state = readMockDb();
        writeMockDb({ ...state, redemptions: [...state.redemptions, entry] });
      },
    },
    { passId, dealName, vendorId, userId, userEmail, userName }
  );
};

export const getRedemptionsByPass = async (passId: string): Promise<RedemptionDocument[]> => {
  try {
    const state = readMockDb();
    return state.redemptions.filter((r) => r.passId === passId);
  } catch (error: any) {
    console.error('Error getting redemptions (mock):', error);
    return [];
  }
};

export const isDealRedeemed = async (passId: string, dealName: string): Promise<boolean> => {
  try {
    const state = readMockDb();
    return state.redemptions.some((r) => r.passId === passId && r.dealName === dealName);
  } catch (error: any) {
    console.error('Error checking redemption (mock):', error);
    return false;
  }
};

// --- USERS ---

export const getUserProfile = async (
  userId: string
): Promise<{ photoURL?: string; displayName?: string } | null> => {
  try {
    const state = readMockDb();
    const user = state.users.find((u) => u.uid === userId);
    if (!user) return null;
    return { photoURL: user.photoURL, displayName: user.displayName };
  } catch (error: any) {
    console.error('Error getting user profile (mock):', error);
    return null;
  }
};

// --- VENDOR OPERATIONS ---

export const createVendor = async (vendor: Vendor) => {
  try {
    const state = readMockDb();
    const vendorData: Vendor = { ...vendor, createdAt: new Date().toISOString() };

    const existingIndex = state.vendors.findIndex((v) => v.vendorId === vendor.vendorId);
    const nextVendors =
      existingIndex >= 0
        ? state.vendors.map((v, i) => (i === existingIndex ? vendorData : v))
        : [...state.vendors, vendorData];

    writeMockDb({ ...state, vendors: nextVendors });
    return { success: true };
  } catch (error: any) {
    console.error('Error creating vendor (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getVendorById = async (vendorId: string): Promise<Vendor | null> => {
  try {
    const state = readMockDb();
    return state.vendors.find((v) => v.vendorId === vendorId) || null;
  } catch (error: any) {
    console.error('Error getting vendor (mock):', error);
    return null;
  }
};

export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    const state = readMockDb();
    return state.vendors;
  } catch (error: any) {
    console.error('Error getting vendors (mock):', error);
    return [];
  }
};

export const getVendorsByCity = async (city: string): Promise<Vendor[]> => {
  try {
    const state = readMockDb();
    return state.vendors.filter((v) => v.city === city && v.isActive === true);
  } catch (error: any) {
    console.error('Error getting vendors by city (mock):', error);
    return [];
  }
};

export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
  try {
    const state = readMockDb();
    return state.vendors.filter((v) => v.category === category && v.isActive === true);
  } catch (error: any) {
    console.error('Error getting vendors by category (mock):', error);
    return [];
  }
};

export const getVendorsByCityAndCategory = async (city: string, category: string): Promise<Vendor[]> => {
  try {
    const state = readMockDb();
    return state.vendors.filter((v) => v.city === city && v.category === category && v.isActive === true);
  } catch (error: any) {
    console.error('Error getting vendors by city and category (mock):', error);
    return [];
  }
};

export const verifyVendorPin = async (vendorId: string, pin: string): Promise<boolean> => {
  try {
    const vendor = await getVendorById(vendorId);
    return vendor !== null && vendor.pin === pin;
  } catch (error: any) {
    console.error('Error verifying PIN (mock):', error);
    return false;
  }
};

export const updateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
  try {
    const state = readMockDb();
    const existing = state.vendors.find((v) => v.vendorId === vendorId);
    if (!existing) return { success: false, error: 'Vendor not found' };

    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    ) as Record<string, any>;

    const nextVendor = applyUpdates(existing, cleanedUpdates);
    const nextVendors = state.vendors.map((v) => (v.vendorId === vendorId ? nextVendor : v));

    writeMockDb({ ...state, vendors: nextVendors });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating vendor (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getDealCountByVendor = async (vendorId: string): Promise<number> => {
  try {
    const state = readMockDb();
    return state.deals.filter((d) => d.vendorId === vendorId).length;
  } catch (error: any) {
    console.error('Error getting deal count (mock):', error);
    return 0;
  }
};

export const deleteVendor = async (vendorId: string, cascadeDeleteDeals: boolean = true) => {
  try {
    const state = readMockDb();
    const nextDeals = cascadeDeleteDeals ? state.deals.filter((d) => d.vendorId !== vendorId) : state.deals;
    const nextVendors = state.vendors.filter((v) => v.vendorId !== vendorId);

    writeMockDb({ ...state, deals: nextDeals, vendors: nextVendors });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting vendor (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

// --- DEAL OPERATIONS ---

export const createDeal = async (deal: Deal) => {
  try {
    const state = readMockDb();
    const id = deal.id || generateMockId('deal');
    const dealData: Deal = {
      ...deal,
      id,
      createdAt: new Date().toISOString(),
    };

    const cleaned = Object.fromEntries(Object.entries(dealData).filter(([, value]) => value !== undefined)) as Deal;
    writeMockDb({ ...state, deals: [...state.deals, cleaned] });
    return { success: true, dealId: id };
  } catch (error: any) {
    console.error('Error creating deal (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getDealById = async (dealId: string): Promise<Deal | null> => {
  try {
    const state = readMockDb();
    const deal = state.deals.find((d) => d.id === dealId);
    if (!deal) return null;
    return deal;
  } catch (error: any) {
    console.error('Error getting deal (mock):', error);
    return null;
  }
};

export const getAllDeals = async (): Promise<Deal[]> => {
  try {
    const state = readMockDb();
    const deals = sortDeals(state.deals.map((d) => withCategoryFromVendor(d, state.vendors)));
    if (deals.length > 0) {
      setCachedDeals(deals);
      return deals;
    }

    if (isNavigatorOffline()) {
      const cached = getCachedDeals();
      if (cached) return sortDeals(cached);
    }

    return deals;
  } catch (error: any) {
    console.error('Error getting deals (mock):', error);
    const cached = getCachedDeals();
    if (cached) return sortDeals(cached);
    return [];
  }
};

export const getDealsByCity = async (city: string): Promise<Deal[]> => {
  try {
    const state = readMockDb();
    const deals = state.deals
      .map((d) => withCategoryFromVendor(d, state.vendors))
      .filter((d) => d.city === city);
    return sortDeals(deals);
  } catch (error: any) {
    console.error('Error getting deals by city (mock):', error);
    return [];
  }
};

export const getDealsByCategory = async (category: string): Promise<Deal[]> => {
  try {
    const state = readMockDb();
    const deals = state.deals
      .map((d) => withCategoryFromVendor(d, state.vendors))
      .filter((d) => d.category === category);
    return sortDeals(deals);
  } catch (error: any) {
    console.error('Error getting deals by category (mock):', error);
    return [];
  }
};

export const getDealsByCityAndCategory = async (city: string, category: string): Promise<Deal[]> => {
  try {
    const state = readMockDb();
    const deals = state.deals
      .map((d) => withCategoryFromVendor(d, state.vendors))
      .filter((d) => d.city === city && d.category === category);
    return sortDeals(deals);
  } catch (error: any) {
    console.error('Error getting deals by city and category (mock):', error);
    return [];
  }
};

export const getDealsByVendor = async (vendorId: string): Promise<Deal[]> => {
  try {
    const state = readMockDb();
    const deals = state.deals
      .map((d) => withCategoryFromVendor(d, state.vendors))
      .filter((d) => d.vendorId === vendorId);
    return sortDeals(deals);
  } catch (error: any) {
    console.error('Error getting deals by vendor (mock):', error);
    return [];
  }
};

export const updateDeal = async (dealId: string, updates: any) => {
  try {
    const state = readMockDb();
    const existing = state.deals.find((d) => d.id === dealId);
    if (!existing) return { success: false, error: 'Deal not found' };

    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    ) as Record<string, any>;

    const nextDeal = applyUpdates(existing as Record<string, any>, cleanedUpdates) as Deal;
    const nextDeals = state.deals.map((d) => (d.id === dealId ? nextDeal : d));

    writeMockDb({ ...state, deals: nextDeals });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating deal (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const deleteDeal = async (dealId: string) => {
  try {
    const state = readMockDb();
    writeMockDb({ ...state, deals: state.deals.filter((d) => d.id !== dealId) });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting deal (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

// --- ANALYTICS OPERATIONS (READ-ONLY) ---

export const getAllPasses = async (): Promise<PassDocument[]> => {
  try {
    const state = readMockDb();
    return state.passes;
  } catch (error: any) {
    console.error('Error getting all passes (mock):', error);
    return [];
  }
};

export const getAllRedemptions = async (): Promise<RedemptionDocument[]> => {
  try {
    const state = readMockDb();
    return state.redemptions;
  } catch (error: any) {
    console.error('Error getting all redemptions (mock):', error);
    return [];
  }
};

export const getRedemptionCountByPass = async (passId: string): Promise<number> => {
  try {
    const state = readMockDb();
    return state.redemptions.filter((r) => r.passId === passId).length;
  } catch (error: any) {
    console.error('Error getting redemption count (mock):', error);
    return 0;
  }
};

export const deletePass = async (passId: string) => {
  try {
    const state = readMockDb();
    const nextRedemptions = state.redemptions.filter((r) => r.passId !== passId);
    const nextPasses = state.passes.filter((p) => p.passId !== passId);

    writeMockDb({ ...state, redemptions: nextRedemptions, passes: nextPasses });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting pass (mock):', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getRedemptionsByDeal = async (dealId: string): Promise<number> => {
  try {
    const state = readMockDb();
    return state.redemptions.filter((r) => r.dealName === dealId).length;
  } catch (error: any) {
    console.error('Error getting redemptions by deal (mock):', error);
    return 0;
  }
};
