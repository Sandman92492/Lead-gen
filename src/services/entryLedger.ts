import type { RedemptionDocument } from './firestoreService.firebase';

export type EntryLedgerAdapter = {
  appendEntry: (entry: RedemptionDocument) => Promise<void>;
  getEntriesByPass?: (passId: string) => Promise<RedemptionDocument[]>;
};

export type CreateEntryLedgerItemArgs = {
  passId: string;
  dealName: string;
  vendorId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
};

export type CreateEntryLedgerItemResult =
  | { success: true }
  | { success: false; error: string };

export type CreateEntryLedgerItemCallbacks = {
  onFirstEntry?: (ctx: CreateEntryLedgerItemArgs & { entry: RedemptionDocument }) => void | Promise<void>;
};

export const createEntryLedgerItem = async (
  adapter: EntryLedgerAdapter,
  args: CreateEntryLedgerItemArgs,
  callbacks?: CreateEntryLedgerItemCallbacks
): Promise<CreateEntryLedgerItemResult> => {
  try {
    const getEntriesByPass = adapter.getEntriesByPass;
    const existingEntries = getEntriesByPass ? await getEntriesByPass(args.passId) : [];
    const isFirstEntry = !!getEntriesByPass && existingEntries.length === 0;

    const entry: RedemptionDocument = {
      passId: args.passId,
      dealName: args.dealName,
      vendorId: args.vendorId,
      redeemedAt: new Date().toISOString(),
      userId: args.userId,
    };

    await adapter.appendEntry(entry);

    if (isFirstEntry && callbacks?.onFirstEntry) {
      void Promise.resolve(callbacks.onFirstEntry({ ...args, entry })).catch(() => {
        // Fire-and-forget: don't block entry creation on notifications.
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error creating entry ledger item:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};
