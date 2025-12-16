import * as firebaseService from './firestoreService.firebase';
import * as mockService from './firestoreService.mock';

export type { PassDocument, RedemptionDocument } from './firestoreService.firebase';

type FirestoreService = typeof firebaseService;

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;

const service: FirestoreService =
    mode === 'firebase' ? firebaseService : (mockService as unknown as FirestoreService);

export const createPass = service.createPass;
export const getPassById = service.getPassById;
export const getPassesByUserId = service.getPassesByUserId;
export const getPassesByEmail = service.getPassesByEmail;
export const updatePass = service.updatePass;

export const recordRedemption = service.recordRedemption;
export const getRedemptionsByPass = service.getRedemptionsByPass;
export const isDealRedeemed = service.isDealRedeemed;

export const getUserProfile = service.getUserProfile;

export const createVendor = service.createVendor;
export const getVendorById = service.getVendorById;
export const getAllVendors = service.getAllVendors;
export const getVendorsByCity = service.getVendorsByCity;
export const getVendorsByCategory = service.getVendorsByCategory;
export const getVendorsByCityAndCategory = service.getVendorsByCityAndCategory;
export const verifyVendorPin = service.verifyVendorPin;
export const updateVendor = service.updateVendor;
export const getDealCountByVendor = service.getDealCountByVendor;
export const deleteVendor = service.deleteVendor;

export const createDeal = service.createDeal;
export const getDealById = service.getDealById;
export const getAllDeals = service.getAllDeals;
export const getDealsByCity = service.getDealsByCity;
export const getDealsByCategory = service.getDealsByCategory;
export const getDealsByCityAndCategory = service.getDealsByCityAndCategory;
export const getDealsByVendor = service.getDealsByVendor;
export const updateDeal = service.updateDeal;
export const deleteDeal = service.deleteDeal;

export const getAllPasses = service.getAllPasses;
export const getAllRedemptions = service.getAllRedemptions;
export const getRedemptionCountByPass = service.getRedemptionCountByPass;
export const deletePass = service.deletePass;
export const getRedemptionsByDeal = service.getRedemptionsByDeal;
