import React, { useState } from 'react';
import SettingsTopBar from './SettingsTopBar';
import StickyActionBar from '../../components/ui/StickyActionBar';
import SettingsActionButton from '../../components/ui/SettingsActionButton';
import { useToast } from '../../context/ToastContext';
import { fetchLeads } from '../../services/leadWallet';
import type { Lead } from '../../types/leadWallet';
import { downloadText } from '../../utils/download';

const csvEscape = (value: unknown): string => {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const tsToIso = (t: any): string => {
  if (!t?.toDate) return '';
  try {
    return t.toDate().toISOString();
  } catch {
    return '';
  }
};

const buildLeadsCsv = (leads: Lead[]): string => {
  const headers = [
    'leadId',
    'createdAt',
    'updatedAt',
    'contactedAt',
    'status',
    'fullName',
    'phone',
    'suburb',
    'monthlyBillRange',
    'timeline',
    'serviceType',
    'campaignId',
    'campaignName',
    'campaignSlug',
    'campaignSourceType',
    'notes',
  ];

  const rows = leads.map((l) => [
    l.id,
    tsToIso(l.createdAt),
    tsToIso(l.updatedAt),
    tsToIso(l.contactedAt),
    l.status,
    l.fullName,
    l.phone,
    l.suburb,
    l.monthlyBillRange,
    l.timeline,
    (l as any).serviceType ?? '',
    l.campaignId,
    l.campaignNameSnapshot,
    l.campaignSlugSnapshot,
    l.sourceTypeSnapshot,
    l.notes,
  ]);

  return [headers.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\n');
};

const ExportSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  return (
    <>
      <SettingsTopBar title="Data Export" showBack />
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-[calc(var(--sticky-bottom-offset)+6rem)] sm:px-6">
        <div className="space-y-6">
          <section>
            <div className="kicker px-1">Export</div>
            <div className="mt-2 rounded-[22px] border border-border-subtle bg-bg-card p-4">
              <div className="text-[13px] leading-5 text-text-primary font-semibold">Leads CSV</div>
              <div className="mt-1 text-[12px] leading-4 text-text-secondary/80">Download your latest leads for Google Sheets or Excel.</div>
              <div className="mt-3 text-[12px] leading-4 text-text-secondary/80">This exports up to 5,000 leads.</div>
            </div>
          </section>
        </div>
      </main>

      <StickyActionBar>
        <SettingsActionButton
          variant="secondary"
          disabled={isExporting}
          onClick={async () => {
            setIsExporting(true);
            try {
              const leads = await fetchLeads({ limit: 5000 });
              const csv = buildLeadsCsv(leads);
              const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
              downloadText(csv, filename, 'text/csv;charset=utf-8');
              showToast('CSV downloaded', 'success');
            } catch {
              showToast('Export failed', 'error');
            } finally {
              setIsExporting(false);
            }
          }}
        >
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </SettingsActionButton>
      </StickyActionBar>
    </>
  );
};

export default ExportSettingsPage;
