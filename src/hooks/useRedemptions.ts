import { useQuery } from '@tanstack/react-query';
import { getRedemptionsByPass } from '../services/firestoreService';

/**
 * Custom hook for fetching redemptions for a specific pass with caching via TanStack Query
 * Used by: components that need to check which deals have been redeemed
 * Automatically caches results by passId - background refetch after staleTime
 */
export const useRedemptions = (passId: string | undefined) => {
  const { data: redemptions = [], isLoading, error } = useQuery({
    queryKey: ['redemptions', passId],
    queryFn: () => getRedemptionsByPass(passId!),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for redemptions since they change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!passId, // Only run if passId exists
  });

  return { redemptions, isLoading, error: error ? (error as Error).message : null };
};
