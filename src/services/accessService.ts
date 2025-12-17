import * as firebaseService from './accessService.firebase';
import * as mockService from './accessService.mock';

export type {
  CheckinDocument,
  CheckinResult,
  CheckpointDocument,
  CredentialDocument,
  CredentialStatus,
  CredentialType,
  NewCheckpointInput,
  NewCredentialInput,
  NewOrgInput,
  NewStaffInput,
  OrgDocument,
  StaffDocument,
  StaffRole,
} from '../types/access';

type AccessService = typeof firebaseService;

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;

const service: AccessService =
  mode === 'firebase' ? firebaseService : (mockService as unknown as AccessService);

export const getOrgById = service.getOrgById;
export const upsertOrg = service.upsertOrg;

export const getCredentialById = service.getCredentialById;
export const getCredentialsByOrgId = service.getCredentialsByOrgId;
export const getCredentialsByUserId = service.getCredentialsByUserId;
export const getGuestCredentialsByCreatorCredentialId = service.getGuestCredentialsByCreatorCredentialId;
export const createCredential = service.createCredential;
export const updateCredential = service.updateCredential;
export const deleteCredential = service.deleteCredential;

export const getCheckpointById = service.getCheckpointById;
export const getCheckpointsByOrgId = service.getCheckpointsByOrgId;
export const createCheckpoint = service.createCheckpoint;
export const updateCheckpoint = service.updateCheckpoint;
export const deleteCheckpoint = service.deleteCheckpoint;

export const getStaffById = service.getStaffById;
export const getStaffByOrgId = service.getStaffByOrgId;
export const getStaffByUserId = service.getStaffByUserId;
export const createStaff = service.createStaff;
export const updateStaff = service.updateStaff;
export const deleteStaff = service.deleteStaff;

export const getCheckinsByOrgId = service.getCheckinsByOrgId;
export const getCheckinsByCredentialId = service.getCheckinsByCredentialId;
export const getCheckinsByCheckpointId = service.getCheckinsByCheckpointId;
