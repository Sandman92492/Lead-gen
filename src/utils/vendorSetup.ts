/**
 * Vendor Setup Utility
 * Helper function to bulk-add vendors to Firestore
 * Use this to onboard your 3 initial vendors
 */

import { createVendor } from '../services/firestoreService';
import { Vendor } from '../types';

/**
 * Generate a simple UUID-like ID
 */
const generateVendorId = (): string => {
  return `vendor_${crypto.randomUUID()}`;
};

/**
 * Onboard initial vendors
 * Replace with your actual vendor data
 */
export const onboardVendors = async (vendors: Vendor[]) => {
  const results = [];
  
  for (const vendor of vendors) {
    const result = await createVendor(vendor);
    results.push({
      vendorId: vendor.vendorId,
      name: vendor.name,
      success: result.success,
      error: result.error,
    });
  }
  
  console.log('Vendor onboarding complete:', results);
  return results;
};

/**
 * Template for your 3 vendors
 * Fill in your actual vendor details, vendorIds are auto-generated
 */
export const VENDOR_ONBOARDING_TEMPLATE = (): Vendor[] => [
  {
    vendorId: generateVendorId(),
    name: 'Vendor Name 1',
    email: 'contact@vendor1.com',
    phone: '+27123456789',
    pin: '1234', // 4-digit PIN
    category: 'restaurant',
    city: 'Port Alfred',
    address: '123 Main Street, Port Alfred',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    vendorId: generateVendorId(),
    name: 'Vendor Name 2',
    email: 'contact@vendor2.com',
    phone: '+27123456789',
    pin: '5678',
    category: 'activity',
    city: 'Port Alfred',
    address: '456 Ocean Road, Port Alfred',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    vendorId: generateVendorId(),
    name: 'Vendor Name 3',
    email: 'contact@vendor3.com',
    phone: '+27123456789',
    pin: '9012',
    category: 'shopping',
    city: 'Port Alfred',
    address: '789 Market Street, Port Alfred',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];
