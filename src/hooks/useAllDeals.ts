import { useQuery } from '@tanstack/react-query';
import { getAllDeals } from '../services/firestoreService';

/**
 * Custom hook for fetching all deals with caching via TanStack Query
 * Used by multiple components: DealsShowcase, FeaturedDealsPreview, FeaturedDealsPage, FullDealList
 * Automatically caches results and only refetches after staleTime (5 minutes)
 */
export const useAllDeals = () => {
  const { data: deals = [], isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: () => getAllDeals(),
    staleTime: 5 * 1000, // 5 seconds (dev mode for testing)
    gcTime: 10 * 1000, // 10 seconds (dev mode for testing)
  });

  return { deals, isLoading, error: error ? (error as Error).message : null };
};
