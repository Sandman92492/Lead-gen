

export type PassType = 'holiday';
export type PassStatus = 'free' | 'paid';

// --- VENDOR & LOCATION TYPES ---

export interface Vendor {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  pin: string; // 4-digit PIN (stored as string)
  category: 'restaurant' | 'activity' | 'shopping';
  city: string; // e.g. "Port Alfred", "Cape Town", "Durban"
  address?: string; // Full address for Google Maps
  mapsUrl?: string; // Google Maps directions link
  imageUrl?: string; // Vendor logo/image
  images?: string[]; // Array of additional images
  createdAt: string;
  isActive: boolean;
}

export interface Deal {
  id?: string; // Firestore doc ID
  vendorId: string; // Reference to vendor
  name: string;
  offer: string;
  description?: string; // Marketing copy (fallback: empty string)
  savings?: number; // Numeric savings amount (e.g. 150 for "Save R150+")
  gmapsQuery?: string; // Fallback: if no vendor address, use this for directions
  terms?: string;
  category?: 'restaurant' | 'activity' | 'shopping'; // For filtering
  city?: string; // City where deal is available
  featured?: boolean; // Mark as featured (shows in hero section)
  imageUrl?: string; // Image URL (from vendor or deal)
  images?: string[]; // Array of additional images
  createdAt?: string;
}

export interface AnchorDeal extends Deal {
  imageUrl: string;
  logoUrl?: string; // Optional logo for anchor partners
}

export interface DealCategory {
  category: string;
  deals: Deal[];
}

export interface Testimonial {
  quote: string;
  author: string;
  imageUrl: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PassFeatures {
  description: string;
  feature1: string;
  feature2: string;
  feature3: string;
  venueCount: number;
}
