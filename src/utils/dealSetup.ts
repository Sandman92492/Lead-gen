/**
 * Deal Setup Utility
 * Helper function to bulk-add deals to Firestore
 * Use this to seed deals from your 3 vendors
 */

import { createDeal } from '../services/firestoreService';
import { Deal } from '../types';

/**
 * Onboard deals
 * Add your deal data and call this function
 */
export const onboardDeals = async (deals: Deal[]) => {
  const results = [];
  
  for (const deal of deals) {
    const result = await createDeal(deal);
    results.push({
      vendorId: deal.vendorId,
      name: deal.name,
      success: result.success,
      dealId: result.dealId,
      error: result.error,
    });
  }
  
  console.log('Deal onboarding complete:', results);
  return results;
};

/**
 * Template for deals
 * Fill in your actual vendor IDs and deal details
 * 
 * Example for your 3 vendors:
 * 
 * const deals = [
 *   // Vendor 1 Deal (Restaurant)
 *   {
 *     vendorId: 'VENDOR_ID_1',
 *     name: 'The Wharf Street Brew Pub',
 *     offer: '2-for-1 on all Main Meals',
 *     savings: 150,  // Numeric value, UI will display as "Save R150+"
 *     category: 'restaurant',
 *     city: 'Port Alfred',
 *     terms: 'Valid Mon-Thu. Excludes Dec 25-26. Dine-in only.',
 *   },
 *   // Vendor 2 Deal (Activity)
 *   {
 *     vendorId: 'VENDOR_ID_2',
 *     name: 'Kowie River Cruises',
 *     offer: 'R100 off per person on Sunset Cruise',
 *     savings: 400,  // For family of 4
 *     category: 'activity',
 *     city: 'Port Alfred',
 *     terms: 'Sunset cruise only. Minimum 2 people.',
 *   },
 *   // Vendor 3 Deal (Shopping)
 *   {
 *     vendorId: 'VENDOR_ID_3',
 *     name: 'Wave Action',
 *     offer: '20% off all branded apparel',
 *     savings: 100,  // Approximate savings
 *     category: 'shopping',
 *     city: 'Port Alfred',
 *     terms: 'Branded items only. Cannot be combined with other offers.',
 *   },
 * ];
 * 
 * await onboardDeals(deals);
 */
export const DEAL_ONBOARDING_TEMPLATE = (): Deal[] => [
  {
    vendorId: 'REPLACE_WITH_VENDOR_ID_1',
    name: 'Deal Name 1',
    offer: 'Deal offer description',
    savings: 150,
    category: 'restaurant',
    city: 'Port Alfred',
    terms: 'Optional terms and conditions',
  },
  {
    vendorId: 'REPLACE_WITH_VENDOR_ID_2',
    name: 'Deal Name 2',
    offer: 'Deal offer description',
    savings: 100,
    category: 'activity',
    city: 'Port Alfred',
    terms: 'Optional terms and conditions',
  },
  {
    vendorId: 'REPLACE_WITH_VENDOR_ID_3',
    name: 'Deal Name 3',
    offer: 'Deal offer description',
    savings: 75,
    category: 'shopping',
    city: 'Port Alfred',
    terms: 'Optional terms and conditions',
  },
];
