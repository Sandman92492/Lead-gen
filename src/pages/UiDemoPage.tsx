import React, { useState } from 'react';
import Button from '../components/Button';
import BottomSheet from '../components/ui/BottomSheet';
import Card from '../components/ui/Card';
import GlassCard from '../components/ui/GlassCard';
import FilterChips from '../components/ui/FilterChips';
import StatusPill from '../components/ui/StatusPill';
import { Skeleton } from '../components/ui/Skeleton';
import type { LeadStatus } from '../types/leadWallet';

const UiDemoPage: React.FC = () => {
  const [filter, setFilter] = useState<'UNCONTACTED' | 'NEW' | 'TODAY' | 'THIS_WEEK'>('UNCONTACTED');
  const [sheetOpen, setSheetOpen] = useState(false);

  const statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'BOOKED', 'QUOTED', 'WON', 'LOST'];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-4 pb-32 sm:px-6">
      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="text-[18px] leading-6 font-semibold text-text-primary">UI demo</div>
          <div className="mt-2 text-[13px] leading-5 text-text-secondary">
            Quick reference for tokens + components (Solar Nightfall).
          </div>
        </GlassCard>

        <Card className="p-5">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Buttons</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Button variant="primary" className="w-full">
              Primary
            </Button>
            <Button variant="secondary" className="w-full">
              Secondary
            </Button>
            <Button variant="whatsapp" className="w-full">
              WhatsApp
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Filter chips</div>
          <div className="mt-3">
            <FilterChips
              value={filter}
              onChange={setFilter}
              items={[
                { id: 'UNCONTACTED', label: 'Uncontacted' },
                { id: 'NEW', label: 'New' },
                { id: 'TODAY', label: 'Today' },
                { id: 'THIS_WEEK', label: 'This week' },
              ]}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Status pills</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <StatusPill key={s} status={s} />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Skeleton</div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-72" />
            <Skeleton className="h-3 w-56" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[15px] leading-6 font-semibold text-text-primary">Bottom sheet</div>
          <div className="mt-4">
            <Button variant="secondary" className="w-full" onClick={() => setSheetOpen(true)}>
              Open sheet
            </Button>
          </div>
        </Card>
      </div>

      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Bottom sheet">
        <div className="space-y-3">
          <div className="text-[13px] leading-5 text-text-secondary">
            Use for lead detail + quick status changes.
          </div>
          <Button variant="primary" className="w-full" onClick={() => setSheetOpen(false)}>
            Done
          </Button>
        </div>
      </BottomSheet>
    </main>
  );
};

export default UiDemoPage;

