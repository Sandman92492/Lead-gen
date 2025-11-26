// This file simulates server-side validation logic using localStorage as a mock database.
// In a real application, this would be a serverless function connected to a database like Firestore.
import { PassType } from '../types.ts';

interface PassRecord {
  passId: string;
  primaryName: string; // The original purchaser's name, used for validation.
  email: string; // The purchaser's email.
  plusOneName?: string; // The +1 family member's name
  plusOneAddedBy?: string; // Email of user who added the +1
  plusOneActivatedBy?: string; // Email of user who activated the +1 on another device
  passType: PassType;
  expiryDate: string; // ISO 8601 string
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

  db.push({ passId, primaryName, email, passType, expiryDate });
  saveDatabase(db);
  return true;
};

/**
 * Validates a pass stored in the user's local storage on app load.
 */
export const validateExistingPass = async (passId: string, primaryName: string): Promise<boolean> => {
  await new Promise(res => setTimeout(res, 300));
  const db = getDatabase();
  const pass = db.find(p => p.passId === passId && p.primaryName.toLowerCase() === primaryName.toLowerCase());
  
  if (!pass) return false;

  // Check for expiry
  const isExpired = new Date() > new Date(pass.expiryDate);
  return !isExpired;
};


/**
 * Simulates activating a shared pass on a second device.
 * Requires email validation to prevent unauthorized sharing.
 */
export const activateSharedPass = async (passId: string, primaryName: string, userEmail: string): Promise<{ success: boolean; message: string; passData?: { passType: PassType; expiryDate: string; plusOneName?: string } }> => {
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

  // Validate that +1 can only be activated by the pass holder (email must match)
  if (!pass.plusOneName) {
    return { success: false, message: "This pass does not have a +1 to activate." };
  }

  if (pass.plusOneActivatedBy) {
    return { success: false, message: "This +1 has already been activated on another device." };
  }

  if (pass.plusOneAddedBy && pass.plusOneAddedBy.toLowerCase() !== userEmail.toLowerCase()) {
    return { success: false, message: "Only the pass holder who added the +1 can activate it on another device." };
  }

  // Mark as activated with email and save
  db[passIndex].plusOneActivatedBy = userEmail;
  saveDatabase(db);
  
  return { 
    success: true, 
    message: "Pass activated successfully!",
    passData: {
      passType: pass.passType,
      expiryDate: pass.expiryDate,
      plusOneName: pass.plusOneName
    }
  };
};
