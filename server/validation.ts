// This file simulates server-side validation logic using localStorage as a mock database.
// In a real application, this would be a serverless function connected to a database like Firestore.
import { PassType } from '../types.ts';

interface PassRecord {
  passId: string;
  primaryName: string; // The original purchaser's name, used for validation.
  email: string; // The purchaser's email.
  plusOneActivated: boolean; // Tracks if the single share has been used.
  passType: PassType;
  expiryDate: string; // ISO 8601 string
  redeemedDeals: string[]; // Array of redeemed deal names
}

const DB_KEY = 'pass_validation_database';

// Initialize the mock DB if it doesn't exist
const getDatabase = (): PassRecord[] => {
  try {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : [];
  } catch (e) {
    console.error("Failed to read mock database from localStorage", e);
    return [];
  }
};

const saveDatabase = (db: PassRecord[]) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save mock database to localStorage", e);
  }
};

/**
 * Simulates registering a new pass after a successful purchase.
 */
export const registerNewPass = async (passId: string, primaryName: string, email: string, passType: PassType, expiryDate: string): Promise<boolean> => {
  await new Promise(res => setTimeout(res, 500));
  const db = getDatabase();
  const existing = db.find(p => p.passId === passId);
  if (existing) {
    console.error("Attempted to register a duplicate pass ID.");
    return false;
  }

  db.push({ passId, primaryName, email, passType, expiryDate, plusOneActivated: false, redeemedDeals: [] });
  saveDatabase(db);
  return true;
};

/**
 * Validates a pass stored in the user's local storage on app load.
 * Now returns the full pass data including redeemedDeals.
 */
export const validateExistingPass = async (passId: string, primaryName: string): Promise<{ valid: boolean; redeemedDeals?: string[] }> => {
  await new Promise(res => setTimeout(res, 300));
  const db = getDatabase();
  const pass = db.find(p => p.passId === passId && p.primaryName.toLowerCase() === primaryName.toLowerCase());
  
  if (!pass) return { valid: false };

  // Check for expiry
  const isExpired = new Date() > new Date(pass.expiryDate);
  if (isExpired) return { valid: false };
  
  return { valid: true, redeemedDeals: pass.redeemedDeals || [] };
};


/**
 * Simulates activating a shared pass on a second device.
 */
export const activateSharedPass = async (passId: string, primaryName: string): Promise<{ success: boolean; message: string; passData?: { passType: PassType; expiryDate: string; redeemedDeals: string[] } }> => {
  await new Promise(res => setTimeout(res, 800));
  
  const db = getDatabase();
  const passIndex = db.findIndex(p => p.passId === passId && p.primaryName.toLowerCase() === primaryName.toLowerCase());

  if (passIndex === -1) {
    return { success: false, message: "Invalid Pass ID or Primary Name. Please check the details and try again." };
  }

  const pass = db[passIndex];

  // Check for expiry before activating
  const isExpired = new Date() > new Date(pass.expiryDate);
  if (isExpired) {
    return { success: false, message: "This pass has expired and can no longer be activated." };
  }

  if (pass.plusOneActivated) {
    return { success: false, message: "This pass has already been shared and activated on another device." };
  }

  // Mark as activated and save
  db[passIndex].plusOneActivated = true;
  saveDatabase(db);
  
  return { 
    success: true, 
    message: "Pass activated successfully!",
    passData: {
      passType: pass.passType,
      expiryDate: pass.expiryDate,
      redeemedDeals: pass.redeemedDeals || []
    }
  };
};

/**
 * Redeems a deal for a pass.
 * Adds the deal name to the pass's redeemedDeals array.
 */
export const redeemDeal = async (passId: string, dealName: string): Promise<{ success: boolean; redeemedDeals?: string[]; message?: string }> => {
  await new Promise(res => setTimeout(res, 400));
  
  const db = getDatabase();
  const passIndex = db.findIndex(p => p.passId === passId);

  if (passIndex === -1) {
    return { success: false, message: "Pass not found." };
  }

  const pass = db[passIndex];

  // Check for expiry
  const isExpired = new Date() > new Date(pass.expiryDate);
  if (isExpired) {
    return { success: false, message: "This pass has expired." };
  }

  // Check if deal was already redeemed
  if (pass.redeemedDeals.includes(dealName)) {
    return { success: false, message: "This deal has already been redeemed." };
  }

  // Add deal to redeemed deals
  pass.redeemedDeals.push(dealName);
  saveDatabase(db);

  return { success: true, redeemedDeals: pass.redeemedDeals };
};
