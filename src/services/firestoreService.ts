import { db } from '../firebase';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
} from 'firebase/firestore';
import { PassType, PassStatus, Vendor, Deal } from '../types';

// Pass document structure
export interface PassDocument {
    passId: string;
    passHolderName: string;
    email: string;
    passType: PassType;
    passStatus: PassStatus; // 'free' or 'paid'
    expiryDate: string;
    createdAt: string;
    userId: string;
    plusOneName?: string;
    plusOneAddedBy?: string; // Email of user who added the +1
    plusOneActivatedBy?: string; // Email of user who activated the +1 on another device
    paymentRef?: string; // Paystack payment reference
    paymentStatus?: 'pending' | 'completed' | 'failed'; // Payment status
    purchasePrice?: number; // Actual price paid in Rands (populated by Yoco webhook)
}

// Redemption document structure
export interface RedemptionDocument {
    passId: string;
    dealName: string;
    vendorId: string;
    redeemedAt: string;
    userId?: string;
}

// Create a new pass
export const createPass = async (pass: PassDocument) => {
    try {
        // Store by passId as the document ID
        await setDoc(doc(db, 'passes', pass.passId), {
            ...pass,
            createdAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error: any) {
        console.error('Error creating pass:', error);
        return { success: false, error: error.message };
    }
};

// Get pass by ID
export const getPassById = async (passId: string): Promise<PassDocument | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'passes', passId));
        if (docSnap.exists()) {
            return docSnap.data() as PassDocument;
        }
        return null;
    } catch (error: any) {
        console.error('Error getting pass:', error);
        return null;
    }
};

// Get passes by user ID
export const getPassesByUserId = async (userId: string): Promise<PassDocument[]> => {
    try {
        const q = query(collection(db, 'passes'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as PassDocument);
    } catch (error: any) {
        console.error('Error getting passes:', error);
        return [];
    }
};

// Get passes by email
export const getPassesByEmail = async (email: string): Promise<PassDocument[]> => {
    try {
        const q = query(collection(db, 'passes'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as PassDocument);
    } catch (error: any) {
        console.error('Error getting passes:', error);
        return [];
    }
};

// Update pass (e.g., add +1 person)
export const updatePass = async (passId: string, updates: Partial<PassDocument>) => {
    try {
        await updateDoc(doc(db, 'passes', passId), updates);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating pass:', error);
        return { success: false, error: error.message };
    }
};

// Record a deal redemption
export const recordRedemption = async (passId: string, dealName: string, vendorId: string, userId: string) => {
    try {
        await addDoc(collection(db, 'redemptions'), {
            passId,
            dealName,
            vendorId,
            redeemedAt: new Date().toISOString(),
            userId,
        } as RedemptionDocument);
        return { success: true };
    } catch (error: any) {
        console.error('Error recording redemption:', error);
        return { success: false, error: error.message };
    }
};

// Get redemptions for a pass
export const getRedemptionsByPass = async (passId: string): Promise<RedemptionDocument[]> => {
    try {
        const q = query(collection(db, 'redemptions'), where('passId', '==', passId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as RedemptionDocument);
    } catch (error: any) {
        console.error('Error getting redemptions:', error);
        return [];
    }
};

// Check if a deal has been redeemed on a pass
export const isDealRedeemed = async (passId: string, dealName: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, 'redemptions'),
            where('passId', '==', passId),
            where('dealName', '==', dealName)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size > 0;
    } catch (error: any) {
        console.error('Error checking redemption:', error);
        return false;
    }
};

// Get user profile data
export const getUserProfile = async (userId: string): Promise<{ photoURL?: string; displayName?: string } | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                photoURL: data.photoURL,
                displayName: data.displayName,
            };
        }
        return null;
    } catch (error: any) {
        console.error('Error getting user profile:', error);
        return null;
    }
};

// --- VENDOR OPERATIONS ---

// Create a new vendor
export const createVendor = async (vendor: Vendor) => {
    try {
        const vendorData = {
            ...vendor,
            createdAt: new Date().toISOString(),
        };
        
        // Remove undefined fields (Firestore doesn't allow undefined values)
        Object.keys(vendorData).forEach(key => {
            if (vendorData[key as keyof typeof vendorData] === undefined) {
                delete vendorData[key as keyof typeof vendorData];
            }
        });
        
        await setDoc(doc(db, 'vendors', vendor.vendorId), vendorData);
        return { success: true };
    } catch (error: any) {
        console.error('Error creating vendor:', error);
        return { success: false, error: error.message };
    }
};

// Get vendor by ID
export const getVendorById = async (vendorId: string): Promise<Vendor | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'vendors', vendorId));
        if (docSnap.exists()) {
            return docSnap.data() as Vendor;
        }
        return null;
    } catch (error: any) {
        console.error('Error getting vendor:', error);
        return null;
    }
};

// Get all vendors
export const getAllVendors = async (): Promise<Vendor[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'vendors'));
        return querySnapshot.docs.map((doc) => doc.data() as Vendor);
    } catch (error: any) {
        console.error('Error getting vendors:', error);
        return [];
    }
};

// Get vendors by city
export const getVendorsByCity = async (city: string): Promise<Vendor[]> => {
    try {
        const q = query(
            collection(db, 'vendors'),
            where('city', '==', city),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Vendor);
    } catch (error: any) {
        console.error('Error getting vendors by city:', error);
        return [];
    }
};

// Get vendors by category
export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
    try {
        const q = query(
            collection(db, 'vendors'),
            where('category', '==', category),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Vendor);
    } catch (error: any) {
        console.error('Error getting vendors by category:', error);
        return [];
    }
};

// Get vendors by city and category
export const getVendorsByCityAndCategory = async (city: string, category: string): Promise<Vendor[]> => {
    try {
        const q = query(
            collection(db, 'vendors'),
            where('city', '==', city),
            where('category', '==', category),
            where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Vendor);
    } catch (error: any) {
        console.error('Error getting vendors by city and category:', error);
        return [];
    }
};

// Verify vendor PIN
export const verifyVendorPin = async (vendorId: string, pin: string): Promise<boolean> => {
    try {
        const vendor = await getVendorById(vendorId);
        return vendor !== null && vendor.pin === pin;
    } catch (error: any) {
        console.error('Error verifying PIN:', error);
        return false;
    }
};

// Update vendor
export const updateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
    try {
        // Remove undefined fields (Firestore doesn't allow undefined values)
        const cleanedUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        await updateDoc(doc(db, 'vendors', vendorId), cleanedUpdates);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating vendor:', error);
        return { success: false, error: error.message };
    }
};

// Delete vendor
export const deleteVendor = async (vendorId: string) => {
    try {
        await deleteDoc(doc(db, 'vendors', vendorId));
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting vendor:', error);
        return { success: false, error: error.message };
    }
};

// --- DEAL OPERATIONS ---

// Create a new deal
export const createDeal = async (deal: Deal) => {
    try {
        const dealData = {
            ...deal,
            createdAt: new Date().toISOString(),
        };
        // Remove undefined fields (Firestore doesn't support undefined)
        Object.keys(dealData).forEach(key => {
            if (dealData[key as keyof typeof dealData] === undefined) {
                delete dealData[key as keyof typeof dealData];
            }
        });
        const docRef = await addDoc(collection(db, 'deals'), dealData);
        return { success: true, dealId: docRef.id };
    } catch (error: any) {
        console.error('Error creating deal:', error);
        return { success: false, error: error.message };
    }
};

// Get deal by ID
export const getDealById = async (dealId: string): Promise<Deal | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'deals', dealId));
        if (docSnap.exists()) {
            const deal = docSnap.data() as Deal;
            return { ...deal, id: docSnap.id };
        }
        return null;
    } catch (error: any) {
        console.error('Error getting deal:', error);
        return null;
    }
};

// Get all deals
export const getAllDeals = async (): Promise<Deal[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'deals'));
        const deals = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const deal = doc.data() as Deal;
            
            // If category is not set, fetch from vendor
            if (!deal.category && deal.vendorId) {
                const vendor = await getVendorById(deal.vendorId);
                if (vendor) {
                    deal.category = vendor.category;
                }
            }
            
            return { ...deal, id: doc.id };
        }));
        return deals;
    } catch (error: any) {
        console.error('Error getting deals:', error);
        return [];
    }
};

// Get deals by city
export const getDealsByCity = async (city: string): Promise<Deal[]> => {
    try {
        const q = query(collection(db, 'deals'), where('city', '==', city));
        const querySnapshot = await getDocs(q);
        const deals = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const deal = doc.data() as Deal;
            
            // If category is not set, fetch from vendor
            if (!deal.category && deal.vendorId) {
                const vendor = await getVendorById(deal.vendorId);
                if (vendor) {
                    deal.category = vendor.category;
                }
            }
            
            return { ...deal, id: doc.id };
        }));
        return deals;
    } catch (error: any) {
        console.error('Error getting deals by city:', error);
        return [];
    }
};

// Get deals by category
export const getDealsByCategory = async (category: string): Promise<Deal[]> => {
    try {
        const q = query(collection(db, 'deals'), where('category', '==', category));
        const querySnapshot = await getDocs(q);
        const deals = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const deal = doc.data() as Deal;
            
            // If category is not set, fetch from vendor
            if (!deal.category && deal.vendorId) {
                const vendor = await getVendorById(deal.vendorId);
                if (vendor) {
                    deal.category = vendor.category;
                }
            }
            
            return { ...deal, id: doc.id };
        }));
        return deals;
    } catch (error: any) {
        console.error('Error getting deals by category:', error);
        return [];
    }
};

// Get deals by city and category
export const getDealsByCityAndCategory = async (city: string, category: string): Promise<Deal[]> => {
    try {
        const q = query(
            collection(db, 'deals'),
            where('city', '==', city),
            where('category', '==', category)
        );
        const querySnapshot = await getDocs(q);
        const deals = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const deal = doc.data() as Deal;
            
            // If category is not set, fetch from vendor
            if (!deal.category && deal.vendorId) {
                const vendor = await getVendorById(deal.vendorId);
                if (vendor) {
                    deal.category = vendor.category;
                }
            }
            
            return { ...deal, id: doc.id };
        }));
        return deals;
    } catch (error: any) {
        console.error('Error getting deals by city and category:', error);
        return [];
    }
};

// Get deals by vendor
export const getDealsByVendor = async (vendorId: string): Promise<Deal[]> => {
    try {
        const q = query(collection(db, 'deals'), where('vendorId', '==', vendorId));
        const querySnapshot = await getDocs(q);
        const deals = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const deal = doc.data() as Deal;
            
            // If category is not set, fetch from vendor
            if (!deal.category && deal.vendorId) {
                const vendor = await getVendorById(deal.vendorId);
                if (vendor) {
                    deal.category = vendor.category;
                }
            }
            
            return { ...deal, id: doc.id };
        }));
        return deals;
    } catch (error: any) {
        console.error('Error getting deals by vendor:', error);
        return [];
    }
};

// Update deal
export const updateDeal = async (dealId: string, updates: Partial<Deal>) => {
    try {
        // Remove undefined fields (Firestore doesn't allow undefined values)
        const cleanedUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        await updateDoc(doc(db, 'deals', dealId), cleanedUpdates);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating deal:', error);
        return { success: false, error: error.message };
    }
};

// Delete deal
export const deleteDeal = async (dealId: string) => {
    try {
        await deleteDoc(doc(db, 'deals', dealId));
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting deal:', error);
        return { success: false, error: error.message };
    }
};
