import { db } from '../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type {
  CheckinDocument,
  CheckpointDocument,
  CredentialDocument,
  NewCheckpointInput,
  NewCredentialInput,
  NewOrgInput,
  NewStaffInput,
  OrgDocument,
  StaffDocument,
} from '../types/access';

const stripUndefined = <T extends object>(value: T): T => {
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === undefined) {
      delete (value as Record<string, unknown>)[key];
    }
  }
  return value;
};

const generateId = (prefix: string): string => {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  return `${prefix}_${random}`;
};

export const getOrgById = async (orgId: string): Promise<OrgDocument | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'orgs', orgId));
    return snapshot.exists() ? (snapshot.data() as OrgDocument) : null;
  } catch (error) {
    console.error('Error getting org:', error);
    return null;
  }
};

export const upsertOrg = async (org: NewOrgInput): Promise<{ success: boolean; error?: string }> => {
  try {
    const payload: OrgDocument = {
      ...org,
      createdAt: org.createdAt ?? new Date().toISOString(),
    };
    await setDoc(doc(db, 'orgs', org.orgId), stripUndefined(payload));
    return { success: true };
  } catch (error: any) {
    console.error('Error upserting org:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getCredentialById = async (credentialId: string): Promise<CredentialDocument | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'credentials', credentialId));
    return snapshot.exists() ? (snapshot.data() as CredentialDocument) : null;
  } catch (error) {
    console.error('Error getting credential:', error);
    return null;
  }
};

export const getCredentialsByOrgId = async (orgId: string): Promise<CredentialDocument[]> => {
  try {
    const q = query(collection(db, 'credentials'), where('orgId', '==', orgId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as CredentialDocument);
  } catch (error) {
    console.error('Error getting credentials by org:', error);
    return [];
  }
};

export const getCredentialsByUserId = async (userId: string): Promise<CredentialDocument[]> => {
  try {
    const q = query(collection(db, 'credentials'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as CredentialDocument);
  } catch (error) {
    console.error('Error getting credentials by user:', error);
    return [];
  }
};

export const createCredential = async (
  credential: NewCredentialInput
): Promise<{ success: boolean; credentialId?: string; error?: string }> => {
  try {
    const credentialId = credential.credentialId ?? generateId('cred');
    const payload: CredentialDocument = {
      ...credential,
      credentialId,
      createdAt: credential.createdAt ?? new Date().toISOString(),
    };
    await setDoc(doc(db, 'credentials', credentialId), stripUndefined(payload));
    return { success: true, credentialId };
  } catch (error: any) {
    console.error('Error creating credential:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const updateCredential = async (
  credentialId: string,
  updates: Partial<CredentialDocument>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'credentials', credentialId), stripUndefined({ ...updates }));
    return { success: true };
  } catch (error: any) {
    console.error('Error updating credential:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const deleteCredential = async (credentialId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, 'credentials', credentialId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting credential:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getCheckpointById = async (checkpointId: string): Promise<CheckpointDocument | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'checkpoints', checkpointId));
    return snapshot.exists() ? (snapshot.data() as CheckpointDocument) : null;
  } catch (error) {
    console.error('Error getting checkpoint:', error);
    return null;
  }
};

export const getCheckpointsByOrgId = async (orgId: string): Promise<CheckpointDocument[]> => {
  try {
    const q = query(collection(db, 'checkpoints'), where('orgId', '==', orgId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as CheckpointDocument);
  } catch (error) {
    console.error('Error getting checkpoints by org:', error);
    return [];
  }
};

export const createCheckpoint = async (
  checkpoint: NewCheckpointInput
): Promise<{ success: boolean; checkpointId?: string; error?: string }> => {
  try {
    const checkpointId = checkpoint.checkpointId ?? generateId('checkpoint');
    const payload: CheckpointDocument = {
      ...checkpoint,
      checkpointId,
      createdAt: checkpoint.createdAt ?? new Date().toISOString(),
    };
    await setDoc(doc(db, 'checkpoints', checkpointId), stripUndefined(payload));
    return { success: true, checkpointId };
  } catch (error: any) {
    console.error('Error creating checkpoint:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const updateCheckpoint = async (
  checkpointId: string,
  updates: Partial<CheckpointDocument>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'checkpoints', checkpointId), stripUndefined({ ...updates }));
    return { success: true };
  } catch (error: any) {
    console.error('Error updating checkpoint:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const deleteCheckpoint = async (checkpointId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, 'checkpoints', checkpointId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting checkpoint:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getStaffById = async (staffId: string): Promise<StaffDocument | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'staff', staffId));
    return snapshot.exists() ? (snapshot.data() as StaffDocument) : null;
  } catch (error) {
    console.error('Error getting staff:', error);
    return null;
  }
};

export const getStaffByOrgId = async (orgId: string): Promise<StaffDocument[]> => {
  try {
    const q = query(collection(db, 'staff'), where('orgId', '==', orgId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as StaffDocument);
  } catch (error) {
    console.error('Error getting staff by org:', error);
    return [];
  }
};

export const getStaffByUserId = async (userId: string): Promise<StaffDocument | null> => {
  try {
    const q = query(collection(db, 'staff'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as StaffDocument;
  } catch (error) {
    console.error('Error getting staff by user:', error);
    return null;
  }
};

export const createStaff = async (
  staff: NewStaffInput
): Promise<{ success: boolean; staffId?: string; error?: string }> => {
  try {
    const staffId = staff.staffId ?? generateId('staff');
    const payload: StaffDocument = {
      ...staff,
      staffId,
      approvedDeviceIds: staff.approvedDeviceIds ?? [],
      createdAt: staff.createdAt ?? new Date().toISOString(),
    };
    await setDoc(doc(db, 'staff', staffId), stripUndefined(payload));
    return { success: true, staffId };
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const updateStaff = async (
  staffId: string,
  updates: Partial<StaffDocument>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'staff', staffId), stripUndefined({ ...updates }));
    return { success: true };
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const deleteStaff = async (staffId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, 'staff', staffId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

export const getCheckinsByOrgId = async (orgId: string): Promise<CheckinDocument[]> => {
  try {
    const q = query(collection(db, 'checkins'), where('orgId', '==', orgId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as CheckinDocument), checkinId: docSnap.id }));
  } catch (error) {
    console.error('Error getting checkins by org:', error);
    return [];
  }
};

export const getCheckinsByCredentialId = async (credentialId: string): Promise<CheckinDocument[]> => {
  try {
    const q = query(collection(db, 'checkins'), where('credentialId', '==', credentialId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as CheckinDocument), checkinId: docSnap.id }));
  } catch (error) {
    console.error('Error getting checkins by credential:', error);
    return [];
  }
};

export const getCheckinsByCheckpointId = async (checkpointId: string): Promise<CheckinDocument[]> => {
  try {
    const q = query(collection(db, 'checkins'), where('checkpointId', '==', checkpointId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ ...(docSnap.data() as CheckinDocument), checkinId: docSnap.id }));
  } catch (error) {
    console.error('Error getting checkins by checkpoint:', error);
    return [];
  }
};

export const appendCheckin = async (checkin: Omit<CheckinDocument, 'checkinId'>): Promise<{ success: boolean; checkinId?: string; error?: string }> => {
  try {
    const docRef = await addDoc(collection(db, 'checkins'), stripUndefined({ ...checkin }));
    return { success: true, checkinId: docRef.id };
  } catch (error: any) {
    console.error('Error appending checkin:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};
