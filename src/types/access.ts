export type CredentialType = 'resident' | 'member' | 'guest' | 'staff';
export type CredentialStatus = 'active' | 'expired' | 'suspended';

export type StaffRole = 'staff' | 'admin';
export type CheckinResult = 'allowed' | 'denied';

export type OrgTheme = {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
};

export type OrgSettings = {
  codeRotationSeconds?: number;
  guestLinkTtlDays?: number;
};

export interface OrgDocument {
  orgId: string;
  name: string;
  logoUrl?: string;
  theme?: OrgTheme;
  settings?: OrgSettings;
  createdAt: string;
}

export interface CredentialDocument {
  credentialId: string;
  orgId: string;
  userId?: string | null;
  credentialType: CredentialType;
  status: CredentialStatus;
  validFrom: string;
  validTo: string;
  memberNo?: string;
  unitNo?: string;
  displayName: string;
  createdAt: string;
  createdByUserId?: string | null;
  createdByCredentialId?: string | null;
  guestToken?: string | null;
  suspendedReason?: string;
  currentCode?: string;
  currentCodeIssuedAt?: string;
  currentCodeExpiresAt?: string;
}

export interface CheckpointDocument {
  checkpointId: string;
  orgId: string;
  name: string;
  allowedTypes: CredentialType[];
  isActive: boolean;
  createdAt: string;
}

export interface StaffDocument {
  staffId: string;
  orgId: string;
  userId: string;
  pinHash: string;
  role: StaffRole;
  isActive: boolean;
  approvedDeviceIds: string[];
  createdAt: string;
}

export interface CheckinDocument {
  checkinId: string;
  orgId: string;
  credentialId: string;
  checkpointId: string;
  staffId: string;
  deviceId: string;
  result: CheckinResult;
  reason: string;
  createdAt: string;
}

export type NewOrgInput = Omit<OrgDocument, 'createdAt'> & { createdAt?: string };
export type NewCredentialInput = Omit<CredentialDocument, 'credentialId' | 'createdAt'> & {
  credentialId?: string;
  createdAt?: string;
};
export type NewCheckpointInput = Omit<CheckpointDocument, 'checkpointId' | 'createdAt'> & {
  checkpointId?: string;
  createdAt?: string;
};
export type NewStaffInput = Omit<StaffDocument, 'staffId' | 'createdAt' | 'approvedDeviceIds'> & {
  staffId?: string;
  createdAt?: string;
  approvedDeviceIds?: string[];
};
