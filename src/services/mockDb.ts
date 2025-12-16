import type { Deal, Vendor } from '../types';
import type { PassDocument, RedemptionDocument } from './firestoreService.firebase';

export const MOCK_DB_STORAGE_KEY = 'raffle_mock_v1';

export type MockUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
};

export type MockDbState = {
  version: 1;
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
  if (candidate.version !== 1) return false;
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
      name: 'Riverside Primary School',
      email: 'riverside@example.com',
      phone: '+27 12 345 6789',
      pin: '1234',
      category: 'activity',
      city: 'Port Alfred',
      address: 'Port Alfred, South Africa',
      mapsUrl: 'https://maps.google.com/?q=Port+Alfred',
      imageUrl: '',
      images: [],
      createdAt: now,
      isActive: true,
    },
    {
      vendorId: 'mock_vendor_2',
      name: 'Seaside High Fundraiser',
      email: 'seaside@example.com',
      phone: '+27 98 765 4321',
      pin: '4321',
      category: 'shopping',
      city: 'Port Alfred',
      address: 'Port Alfred, South Africa',
      mapsUrl: 'https://maps.google.com/?q=Port+Alfred',
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
      name: 'Raffle: Sports Gear Hamper',
      offer: 'Win a sports hamper worth R2,000',
      description: 'Support the fundraiser and stand a chance to win.',
      savings: 2000,
      category: vendors[0].category,
      city: vendors[0].city,
      featured: true,
      sortOrder: 1,
      imageUrl: '',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_2',
      vendorId: vendors[0].vendorId,
      name: 'Raffle: Weekend Getaway',
      offer: 'Win a weekend stay for 2',
      description: 'Entries support school projects and activities.',
      savings: 3500,
      category: vendors[0].category,
      city: vendors[0].city,
      featured: true,
      sortOrder: 2,
      imageUrl: '',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_3',
      vendorId: vendors[1].vendorId,
      name: 'Raffle: Grocery Voucher',
      offer: 'Win a R1,000 grocery voucher',
      description: 'A simple raffle to support the fundraiser.',
      savings: 1000,
      category: vendors[1].category,
      city: vendors[1].city,
      featured: false,
      sortOrder: 10,
      imageUrl: '',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_4',
      vendorId: vendors[1].vendorId,
      name: 'Raffle: Tech Bundle',
      offer: 'Win a tech bundle worth R5,000',
      description: 'Support the fundraiser and stand a chance to win.',
      savings: 5000,
      category: vendors[1].category,
      city: vendors[1].city,
      featured: false,
      sortOrder: 11,
      imageUrl: '',
      images: [],
      createdAt: now,
    },
    {
      id: 'mock_deal_5',
      vendorId: vendors[0].vendorId,
      name: 'Raffle: Family Day Out',
      offer: 'Win a family day out package',
      description: 'Entries go towards school resources.',
      savings: 1500,
      category: vendors[0].category,
      city: vendors[0].city,
      featured: false,
      sortOrder: 12,
      imageUrl: '',
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
    version: 1,
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

