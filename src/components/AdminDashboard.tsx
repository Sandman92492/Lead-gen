import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from './Button';
import { copy } from '../copy';
import {
  getCheckinsByOrgId,
  getCheckpointsByOrgId,
  getCredentialsByOrgId,
  getOrgById,
  getStaffByOrgId,
} from '../services/accessService';
import type { CheckinDocument, CheckpointDocument, CredentialDocument, OrgDocument, StaffDocument } from '../types/access';

type AdminTab = 'credentials' | 'staff' | 'checkpoints' | 'logs';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;
const defaultOrgId = String(((import.meta as any).env.VITE_ORG_ID ?? 'mock_org_1') as string);

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('credentials');
  const [orgId, setOrgId] = useState(defaultOrgId);

  const [org, setOrg] = useState<OrgDocument | null>(null);
  const [credentials, setCredentials] = useState<CredentialDocument[]>([]);
  const [staff, setStaff] = useState<StaffDocument[]>([]);
  const [checkpoints, setCheckpoints] = useState<CheckpointDocument[]>([]);
  const [logs, setLogs] = useState<CheckinDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [csvFile, setCsvFile] = useState<File | null>(null);

  const loadAll = useCallback(async () => {
    if (!orgId) return;
    setError(null);
    setIsLoading(true);
    try {
      const [orgDoc, creds, staffRows, checkpointRows, logRows] = await Promise.all([
        getOrgById(orgId),
        getCredentialsByOrgId(orgId),
        getStaffByOrgId(orgId),
        getCheckpointsByOrgId(orgId),
        getCheckinsByOrgId(orgId),
      ]);
      setOrg(orgDoc);
      setCredentials(creds);
      setStaff(staffRows);
      setCheckpoints(checkpointRows);
      setLogs(logRows);
      setIsLoading(false);
    } catch {
      setError('Failed to load admin data.');
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const tabs = useMemo(
    () => [
      { id: 'credentials' as const, label: copy.admin.tabs.credentials },
      { id: 'staff' as const, label: copy.admin.tabs.staff },
      { id: 'checkpoints' as const, label: copy.admin.tabs.checkpoints },
      { id: 'logs' as const, label: copy.admin.tabs.logs },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-black text-text-primary">{copy.admin.title}</h1>
            <p className="text-text-secondary mt-1">
              {org?.name ? org.name : `Org: ${orgId}`} • Mode: <span className="font-mono">{mode}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadAll()} disabled={isLoading}>
            {isLoading ? 'Loading…' : 'Refresh'}
          </Button>
        </div>

        <div className="mt-6 bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Organisation</div>
          <input
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            placeholder="orgId"
            className="w-full rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          <p className="text-xs text-text-secondary mt-2">
            Tip: set <span className="font-mono">VITE_ORG_ID</span> to avoid entering this each time.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-action-primary/10 border-action-primary text-action-primary'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 bg-urgency-high/10 border border-urgency-high rounded-lg p-3">
            <p className="text-sm font-semibold text-urgency-high">{error}</p>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
              <h2 className="text-sm font-semibold text-text-primary">Members</h2>
              <p className="text-xs text-text-secondary mt-1">Credentials linked to residents, members, and guests.</p>

              <div className="mt-4 space-y-3">
                {credentials.length === 0 ? (
                  <div className="text-sm text-text-secondary">No credentials found.</div>
                ) : (
                  credentials.map((c) => (
                    <div key={c.credentialId} className="bg-bg-primary border border-border-subtle rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-text-primary truncate">{c.displayName}</div>
                          <div className="text-xs text-text-secondary mt-1">
                            {c.credentialType.toUpperCase()} • {c.status.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-text-secondary">Valid until</div>
                          <div className="text-xs font-semibold text-text-primary">{formatDate(c.validTo)}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-text-secondary font-mono break-all">{c.credentialId}</div>
                      {(c.memberNo || c.unitNo) && (
                        <div className="mt-2 text-xs text-text-secondary">
                          {c.memberNo ? `Member ${c.memberNo}` : ''}{c.memberNo && c.unitNo ? ' • ' : ''}
                          {c.unitNo ? `Unit ${c.unitNo}` : ''}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
              <h2 className="text-sm font-semibold text-text-primary">{copy.admin.importMembers.title}</h2>
              <p className="text-sm text-text-secondary mt-1">{copy.admin.importMembers.hint}</p>
              <p className="text-xs text-text-secondary mt-2">{copy.admin.importMembers.fieldHint}</p>

              <div className="mt-4">
                <label className="block text-xs text-text-secondary mb-1">{copy.admin.importMembers.action}</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 text-sm text-text-primary file:mr-4 file:rounded-lg file:border-0 file:bg-bg-card file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text-primary hover:file:bg-bg-card/90"
                />
                {csvFile && (
                  <div className="mt-3 text-xs text-text-secondary">
                    Selected: <span className="font-mono">{csvFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="mt-6 bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
            <h2 className="text-sm font-semibold text-text-primary">Staff</h2>
            <p className="text-xs text-text-secondary mt-1">Staff accounts that can unlock verifier mode.</p>

            <div className="mt-4 space-y-3">
              {staff.length === 0 ? (
                <div className="text-sm text-text-secondary">No staff found.</div>
              ) : (
                staff.map((s) => (
                  <div key={s.staffId} className="bg-bg-primary border border-border-subtle rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">{s.staffId}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {s.role.toUpperCase()} • {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-secondary">User</div>
                        <div className="text-xs font-semibold text-text-primary font-mono">{s.userId}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'checkpoints' && (
          <div className="mt-6 bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
            <h2 className="text-sm font-semibold text-text-primary">Checkpoints</h2>
            <p className="text-xs text-text-secondary mt-1">Locations where credentials can be validated.</p>

            <div className="mt-4 space-y-3">
              {checkpoints.length === 0 ? (
                <div className="text-sm text-text-secondary">No checkpoints found.</div>
              ) : (
                checkpoints.map((c) => (
                  <div key={c.checkpointId} className="bg-bg-primary border border-border-subtle rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">{c.name}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'} • Allowed: {c.allowedTypes.join(', ')}
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary font-mono">{c.checkpointId}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="mt-6 bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
            <h2 className="text-sm font-semibold text-text-primary">Logs</h2>
            <p className="text-xs text-text-secondary mt-1">Recent access checks (allowed/denied).</p>

            <div className="mt-4 space-y-3">
              {logs.length === 0 ? (
                <div className="text-sm text-text-secondary">No logs found.</div>
              ) : (
                logs.map((l) => (
                  <div key={l.checkinId} className="bg-bg-primary border border-border-subtle rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text-primary truncate">
                          {l.result.toUpperCase()} • {l.reason}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Credential: <span className="font-mono">{l.credentialId}</span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          Checkpoint: <span className="font-mono">{l.checkpointId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-secondary">Date</div>
                        <div className="text-xs font-semibold text-text-primary">{formatDate(l.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
