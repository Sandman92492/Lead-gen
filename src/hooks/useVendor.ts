import { useQuery } from '@tanstack/react-query';
import { getVendorById } from '../services/firestoreService';
import { Vendor } from '../types';

/**
 * Custom hook for fetching a single vendor by ID with caching via TanStack Query
 * Used by: FeaturedDealCard, FullDealList's DealListItemWithVendor
 * Automatically caches results by vendorId - same vendor fetched once, reused everywhere
 */
export const useVendor = (vendorId: string | undefined) => {
  const { data: vendor = null, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => getVendorById(vendorId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!vendorId, // Only run if vendorId exists
  });

  return { vendor: vendor as Vendor | null, isLoading, error: error ? (error as Error).message : null, refreshVendor: refetch };
};
