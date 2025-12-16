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

type AccessMockState = {
  version: 1;
  seededAt: string;
  orgs: Record<string, OrgDocument>;
  credentials: Record<string, CredentialDocument>;
  checkpoints: Record<string, CheckpointDocument>;
  staff: Record<string, StaffDocument>;
  checkins: Record<string, CheckinDocument>;
};

const ACCESS_MOCK_KEY = 'access_mock_v1';

const isBrowser = (): boolean => typeof window !== 'undefined';
const hasLocalStorage = (): boolean => typeof localStorage !== 'undefined';

const generateId = (prefix: string): string => {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  return `${prefix}_${random}`;
};

const seedState = (): AccessMockState => {
  const now = new Date().toISOString();
  const orgId = 'mock_org_1';
  const credentialId = 'mock_cred_1';
  const checkpointId = 'mock_checkpoint_gate';
  const staffId = 'mock_staff_1';

  return {
    version: 1,
    seededAt: now,
    orgs: {
      [orgId]: {
        orgId,
        name: 'Mock Estate Access',
        logoUrl: '',
        theme: { primaryColor: '#0EA5E9', accentColor: '#22C55E' },
        settings: { codeRotationSeconds: 30 },
        createdAt: now,
      },
    },
    credentials: {
      [credentialId]: {
        credentialId,
        orgId,
        userId: 'mock_user_1',
        credentialType: 'member',
        status: 'active',
        validFrom: now,
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        memberNo: 'A-101',
        unitNo: 'Unit 101',
        displayName: 'Mock User',
        createdAt: now,
      },
    },
    checkpoints: {
      [checkpointId]: {
        checkpointId,
        orgId,
        name: 'Main Gate',
        allowedTypes: ['resident', 'member', 'guest'],
        isActive: true,
        createdAt: now,
      },
    },
    staff: {
      [staffId]: {
        staffId,
        orgId,
        userId: 'mock_user_1',
        pinHash: 'MOCK_PIN_HASH',
        role: 'admin',
        isActive: true,
        approvedDeviceIds: [],
        createdAt: now,
      },
    },
    checkins: {},
  };
};

const readState = (): AccessMockState => {
  if (!isBrowser() || !hasLocalStorage()) return seedState();
  try {
    const raw = localStorage.getItem(ACCESS_MOCK_KEY);
    if (!raw) {
      const seeded = seedState();
      localStorage.setItem(ACCESS_MOCK_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as AccessMockState;
    if (!parsed || parsed.version !== 1) {
      const seeded = seedState();
      localStorage.setItem(ACCESS_MOCK_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = seedState();
    try {
      localStorage.setItem(ACCESS_MOCK_KEY, JSON.stringify(seeded));
    } catch {
      // Ignore persistence errors
    }
    return seeded;
  }
};

const writeState = (state: AccessMockState) => {
  if (!isBrowser() || !hasLocalStorage()) return;
  try {
    localStorage.setItem(ACCESS_MOCK_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence errors
  }
};

export const getOrgById = async (orgId: string): Promise<OrgDocument | null> => {
  const state = readState();
  return state.orgs[orgId] ?? null;
};

export const upsertOrg = async (org: NewOrgInput): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  const payload: OrgDocument = {
    ...org,
    createdAt: org.createdAt ?? new Date().toISOString(),
  };
  state.orgs[org.orgId] = payload;
  writeState(state);
  return { success: true };
};

export const getCredentialById = async (credentialId: string): Promise<CredentialDocument | null> => {
  const state = readState();
  return state.credentials[credentialId] ?? null;
};

export const getCredentialsByOrgId = async (orgId: string): Promise<CredentialDocument[]> => {
  const state = readState();
  return Object.values(state.credentials).filter((c) => c.orgId === orgId);
};

export const getCredentialsByUserId = async (userId: string): Promise<CredentialDocument[]> => {
  const state = readState();
  return Object.values(state.credentials).filter((c) => c.userId === userId);
};

export const createCredential = async (
  credential: NewCredentialInput
): Promise<{ success: boolean; credentialId?: string; error?: string }> => {
  const state = readState();
  const credentialId = credential.credentialId ?? generateId('cred');
  const payload: CredentialDocument = {
    ...credential,
    credentialId,
    createdAt: credential.createdAt ?? new Date().toISOString(),
  };
  state.credentials[credentialId] = payload;
  writeState(state);
  return { success: true, credentialId };
};

export const updateCredential = async (
  credentialId: string,
  updates: Partial<CredentialDocument>
): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  const existing = state.credentials[credentialId];
  if (!existing) return { success: false, error: 'Not found' };
  state.credentials[credentialId] = { ...existing, ...updates };
  writeState(state);
  return { success: true };
};

export const deleteCredential = async (credentialId: string): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  delete state.credentials[credentialId];
  writeState(state);
  return { success: true };
};

export const getCheckpointById = async (checkpointId: string): Promise<CheckpointDocument | null> => {
  const state = readState();
  return state.checkpoints[checkpointId] ?? null;
};

export const getCheckpointsByOrgId = async (orgId: string): Promise<CheckpointDocument[]> => {
  const state = readState();
  return Object.values(state.checkpoints).filter((c) => c.orgId === orgId);
};

export const createCheckpoint = async (
  checkpoint: NewCheckpointInput
): Promise<{ success: boolean; checkpointId?: string; error?: string }> => {
  const state = readState();
  const checkpointId = checkpoint.checkpointId ?? generateId('checkpoint');
  const payload: CheckpointDocument = {
    ...checkpoint,
    checkpointId,
    createdAt: checkpoint.createdAt ?? new Date().toISOString(),
  };
  state.checkpoints[checkpointId] = payload;
  writeState(state);
  return { success: true, checkpointId };
};

export const updateCheckpoint = async (
  checkpointId: string,
  updates: Partial<CheckpointDocument>
): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  const existing = state.checkpoints[checkpointId];
  if (!existing) return { success: false, error: 'Not found' };
  state.checkpoints[checkpointId] = { ...existing, ...updates };
  writeState(state);
  return { success: true };
};

export const deleteCheckpoint = async (checkpointId: string): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  delete state.checkpoints[checkpointId];
  writeState(state);
  return { success: true };
};

export const getStaffById = async (staffId: string): Promise<StaffDocument | null> => {
  const state = readState();
  return state.staff[staffId] ?? null;
};

export const getStaffByOrgId = async (orgId: string): Promise<StaffDocument[]> => {
  const state = readState();
  return Object.values(state.staff).filter((s) => s.orgId === orgId);
};

export const getStaffByUserId = async (userId: string): Promise<StaffDocument | null> => {
  const state = readState();
  const record = Object.values(state.staff).find((s) => s.userId === userId);
  return record ?? null;
};

export const createStaff = async (
  staff: NewStaffInput
): Promise<{ success: boolean; staffId?: string; error?: string }> => {
  const state = readState();
  const staffId = staff.staffId ?? generateId('staff');
  const payload: StaffDocument = {
    ...staff,
    staffId,
    approvedDeviceIds: staff.approvedDeviceIds ?? [],
    createdAt: staff.createdAt ?? new Date().toISOString(),
  };
  state.staff[staffId] = payload;
  writeState(state);
  return { success: true, staffId };
};

export const updateStaff = async (
  staffId: string,
  updates: Partial<StaffDocument>
): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  const existing = state.staff[staffId];
  if (!existing) return { success: false, error: 'Not found' };
  state.staff[staffId] = { ...existing, ...updates };
  writeState(state);
  return { success: true };
};

export const deleteStaff = async (staffId: string): Promise<{ success: boolean; error?: string }> => {
  const state = readState();
  delete state.staff[staffId];
  writeState(state);
  return { success: true };
};

export const getCheckinsByOrgId = async (orgId: string): Promise<CheckinDocument[]> => {
  const state = readState();
  return Object.values(state.checkins).filter((c) => c.orgId === orgId);
};

export const getCheckinsByCredentialId = async (credentialId: string): Promise<CheckinDocument[]> => {
  const state = readState();
  return Object.values(state.checkins).filter((c) => c.credentialId === credentialId);
};

export const getCheckinsByCheckpointId = async (checkpointId: string): Promise<CheckinDocument[]> => {
  const state = readState();
  return Object.values(state.checkins).filter((c) => c.checkpointId === checkpointId);
};

