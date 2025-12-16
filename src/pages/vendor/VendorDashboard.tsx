import React, { useEffect, useMemo, useState } from 'react';
import Button from '../../components/Button';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { getVendorRedemptions, VendorRedemptionRow } from '../../services/vendorApi';

const toRangeIso = (dateValue: string, boundary: 'start' | 'end') => {
  if (!dateValue) return undefined;
  const time = boundary === 'start' ? 'T00:00:00' : 'T23:59:59';
  const d = new Date(`${dateValue}${time}`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

const isSameLocalDay = (date: Date, other: Date) =>
  date.getFullYear() === other.getFullYear() &&
  date.getMonth() === other.getMonth() &&
  date.getDate() === other.getDate();

const VendorDashboard: React.FC = () => {
  const { vendor, sessionId, logout } = useVendorAuth();
  const [redemptions, setRedemptions] = useState<VendorRedemptionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError('');

    const result = await getVendorRedemptions(sessionId, {
      from: toRangeIso(fromDate, 'start'),
      to: toRangeIso(toDate, 'end'),
      limit: 100,
    });

    if (!result.success) {
      if ((result.error || '').toLowerCase().includes('session')) {
        logout();
        return;
      }
      setError(result.error || 'Could not load redemptions');
      setIsLoading(false);
      return;
    }

    setRedemptions(result.redemptions || []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const summary = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let today = 0;
    let last7 = 0;

    redemptions.forEach((r) => {
      const d = new Date(r.redeemedAt);
      if (Number.isNaN(d.getTime())) return;
      if (isSameLocalDay(d, now)) today += 1;
      if (d.getTime() >= sevenDaysAgo.getTime()) last7 += 1;
    });

    return { today, last7, total: redemptions.length };
  }, [redemptions]);

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-black text-action-primary">Redemptions</h1>
            <p className="text-text-secondary mt-1">
              {vendor?.name ? `${vendor.name} • ` : ''}{vendor?.vendorId || ''}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={logout}>
              Log Out
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest">Today</p>
            <p className="text-3xl font-display font-black text-action-primary mt-2">{summary.today}</p>
          </div>
          <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest">Last 7 Days</p>
            <p className="text-3xl font-display font-black text-action-primary mt-2">{summary.last7}</p>
          </div>
          <div className="bg-bg-card rounded-xl border border-border-subtle p-4">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest">Loaded</p>
            <p className="text-3xl font-display font-black text-action-primary mt-2">{summary.total}</p>
          </div>
        </section>

        <section className="bg-bg-card rounded-2xl border border-border-subtle p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary border-2 border-accent-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-secondary transition text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary border-2 border-accent-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-secondary transition text-text-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button variant="primary" onClick={load} disabled={isLoading}>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-urgency-high/10 border border-urgency-high rounded-lg p-3">
              <p className="text-sm font-medium text-urgency-high">{error}</p>
            </div>
          )}
        </section>

        <section className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border-subtle flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Latest Redemptions</h2>
            <p className="text-xs text-text-secondary">Newest first</p>
          </div>

          {isLoading ? (
            <div className="p-6">
              <p className="text-text-secondary font-semibold">Loading...</p>
            </div>
          ) : redemptions.length === 0 ? (
            <div className="p-6">
              <p className="text-text-secondary">No redemptions found for this range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-bg-primary">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-widest">
                      Redeemed
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-widest">
                      Deal
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-widest">
                      Customer
                    </th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-widest">
                      Pass ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r, idx) => {
                    const redeemedAt = r.redeemedAt ? new Date(r.redeemedAt) : null;
                    const redeemedText = redeemedAt && !Number.isNaN(redeemedAt.getTime())
                      ? redeemedAt.toLocaleString()
                      : r.redeemedAt;

                    const name = r.customer?.name || 'Unknown';
                    const email = r.customer?.email || '';

                    return (
                      <tr key={`${r.passId}_${r.redeemedAt}_${idx}`} className="border-t border-border-subtle">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-primary">
                          {redeemedText}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-text-primary">
                          <p className="font-semibold">{r.dealName || '—'}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-text-primary">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            {r.customer?.photoURL ? (
                              <img
                                src={r.customer.photoURL}
                                alt={name}
                                className="w-9 h-9 rounded-full object-cover border border-border-subtle"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-action-primary/10 border border-border-subtle flex items-center justify-center text-action-primary font-bold">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{name}</p>
                              {email && <p className="text-xs text-text-secondary truncate">{email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary font-mono">
                          {r.passId || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default VendorDashboard;
