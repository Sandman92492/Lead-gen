import type { Deal, Vendor } from '../types';
import type { PassDocument, RedemptionDocument } from './firestoreService.firebase';

export const MOCK_DB_STORAGE_KEY = 'estate_mock_v2';

export type MockUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
};

export type MockDbState = {
  version: 2;
  seededAt: string;
  passes: PassDocument[];
  redemptions: RedemptionDocument[];
  vendors: Vendor[];
  deals: Deal[];
  users: MockUser[];
};

let inMemoryState: MockDbState | null = null;

const isBrowser = (): boolean => typeof window !== 'undefined';
const hasLocalStorage = (): boolean => typeof localStorage !== 'undefined';

const safeJsonParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isValidState = (value: unknown): value is MockDbState => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MockDbState>;
  if (candidate.version !== 2) return false;
  if (typeof candidate.seededAt !== 'string') return false;
  if (!Array.isArray(candidate.passes)) return false;
  if (!Array.isArray(candidate.redemptions)) return false;
  if (!Array.isArray(candidate.vendors)) return false;
  if (!Array.isArray(candidate.deals)) return false;
  if (!Array.isArray(candidate.users)) return false;
  return true;
};

const addDays = (iso: string, days: number): string => {
  const base = new Date(iso);
  base.setDate(base.getDate() + days);
  return base.toISOString();
};

const seedState = (): MockDbState => {
  const now = new Date().toISOString();

  const vendors: Vendor[] = [
    {
      vendorId: 'mock_vendor_1',
      name: 'Estate Golf & Leisure',
      email: 'golf@example.com',
      phone: '+27 12 345 6789',
      pin: '1234',
      category: 'activity',
      city: 'Port Alfred',
      address: 'Estate Golf Club, Port Alfred, South Africa',
      mapsUrl: 'https://maps.google.com/?q=Estate+Golf+Club+Port+Alfred',
      imageUrl: '',
      images: [],
      createdAt: now,
      isActive: true,
    },
    {
      vendorId: 'mock_vendor_2',
      name: 'Estate Clubhouse',
      email: 'clubhouse@example.com',
      phone: '+27 98 765 4321',
      pin: '4321',
      category: 'restaurant',
      city: 'Port Alfred',
      address: 'Estate Clubhouse, Port Alfred, South Africa',
      mapsUrl: 'https://maps.google.com/?q=Estate+Clubhouse+Port+Alfred',
      imageUrl: '',
      images: [],
      createdAt: now,
      isActive: true,
    },
  ];

  const deals: Deal[] = [
    {
      id: 'mock_deal_1',
      vendorId: vendors[0].vendorId,
      name: 'Golf Course Access',
      offer: 'Member access to the 18‑hole course with priority tee times.',
      description: 'Book via the clubhouse and play at member rates. Great for regular rounds and weekend sessions.',
      terms: 'Subject to booking availability. Excludes cart hire and tournaments unless stated.',
      savings: 500,
      category: 'activity',
      city: vendors[0].city,
      featured: true,
      sortOrder: 1,
      imageUrl: '/Images/benefits/golf.svg',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_2',
      vendorId: vendors[0].vendorId,
      name: 'Tennis & Padel Courts',
      offer: 'Court bookings included with your membership (peak and off‑peak).',
      description: 'Reserve your slot and play. Equipment hire available at the clubhouse.',
      terms: 'Bookings required. No‑show policy may apply.',
      savings: 350,
      category: 'activity',
      city: vendors[0].city,
      featured: true,
      sortOrder: 2,
      imageUrl: '/Images/benefits/courts.svg',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_3',
      vendorId: vendors[1].vendorId,
      name: 'Clubhouse Dining Credit',
      offer: 'Get R250 off your clubhouse bill (food and non‑alcoholic drinks).',
      description: 'Use your member benefit when dining at the estate clubhouse.',
      terms: 'Valid once per member per month. Excludes alcohol and special events.',
      savings: 250,
      category: 'restaurant',
      city: vendors[1].city,
      featured: false,
      sortOrder: 10,
      imageUrl: '/Images/benefits/dining.svg',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_4',
      vendorId: vendors[1].vendorId,
      name: 'Pro Shop Member Discount',
      offer: 'Save R500 on pro shop purchases over R2,500.',
      description: 'Stock up on essentials and gear with a members‑only discount.',
      terms: 'One discount per purchase. Not valid on already discounted items.',
      savings: 500,
      category: 'shopping',
      city: vendors[1].city,
      featured: false,
      sortOrder: 11,
      imageUrl: '/Images/benefits/shop.svg',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_5',
      vendorId: vendors[0].vendorId,
      name: 'Wellness & Spa Access',
      offer: 'Save R400 on massages and wellness treatments.',
      description: 'Relax after a round or a workout with member‑rate treatments.',
      terms: 'Booking required. Subject to therapist availability.',
      savings: 400,
      category: 'lifestyle',
      city: vendors[0].city,
      featured: false,
      sortOrder: 12,
      imageUrl: '/Images/benefits/wellness.svg',
      images: [],
      createdAt: now,
    },
  ];

  const users: MockUser[] = [
    {
      uid: 'mock_user_1',
      email: 'mock.user@example.com',
      displayName: 'Mock User',
      createdAt: now,
    },
    {
      uid: 'mock_user_seed_1',
      email: 'seed.user@example.com',
      displayName: 'Seed User',
      createdAt: now,
    },
  ];

  const passes: PassDocument[] = [
    {
      passId: 'MOCKPASS-0001',
      passHolderName: 'Seed User',
      email: users[1].email,
      passType: 'holiday',
      passStatus: 'paid',
      expiryDate: addDays(now, 365),
      createdAt: now,
      userId: users[1].uid,
      paymentStatus: 'completed',
      purchasePrice: 199,
    },
  ];

  const redemptions: RedemptionDocument[] = [
    {
      passId: passes[0].passId,
      dealName: deals[0].name,
      vendorId: deals[0].vendorId,
      redeemedAt: now,
      userId: users[1].uid,
    },
  ];

  return {
    version: 2,
    seededAt: now,
    passes,
    redemptions,
    vendors,
    deals,
    users,
  };
};

export const readMockDb = (): MockDbState => {
  if (inMemoryState) return inMemoryState;

  if (!isBrowser() || !hasLocalStorage()) {
    inMemoryState = seedState();
    return inMemoryState;
  }

  const raw = localStorage.getItem(MOCK_DB_STORAGE_KEY);
  if (!raw) {
    const seeded = seedState();
    localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(seeded));
    inMemoryState = seeded;
    return seeded;
  }

  const parsed = safeJsonParse(raw);
  if (!isValidState(parsed)) {
    const seeded = seedState();
    localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(seeded));
    inMemoryState = seeded;
    return seeded;
  }

  inMemoryState = parsed;
  return parsed;
};

export const writeMockDb = (next: MockDbState): void => {
  inMemoryState = next;
  if (!isBrowser() || !hasLocalStorage()) return;
  try {
    localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore persistence errors
  }
};

export const generateMockId = (prefix: string): string => {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  return `${prefix}_${randomPart}`;
};
