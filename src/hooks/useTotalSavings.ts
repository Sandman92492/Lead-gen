import { useEffect, useState } from 'react';
import { getAllDeals } from '../services/firestoreService';

/**
 * Calculate total savings from redeemed deals
 * @param redeemedDealNames - Array of deal names that have been redeemed
 * @returns Total savings amount in Rands
 */
export const useTotalSavings = (redeemedDealNames: string[]) => {
  const [totalSavings, setTotalSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateSavings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (redeemedDealNames.length === 0) {
          setTotalSavings(0);
          setIsLoading(false);
          return;
        }

        // Fetch all deals to get savings amounts
        const allDeals = await getAllDeals();
        console.log('📊 useTotalSavings - All deals from Firestore:', allDeals);
        console.log('📊 useTotalSavings - Redeemed deal names:', redeemedDealNames);

        // Calculate total savings from redeemed deals
        const savings = redeemedDealNames.reduce((total, dealName) => {
          const deal = allDeals.find(d => d.name === dealName);
          console.log(`📊 Looking for deal "${dealName}":`, deal);
          return total + (deal?.savings || 0);
        }, 0);

        console.log('📊 useTotalSavings - Total calculated:', savings);
        setTotalSavings(savings);
      } catch (err) {
        console.error('Error calculating total savings:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate savings');
      } finally {
        setIsLoading(false);
      }
    };

    calculateSavings();
  }, [redeemedDealNames]);

  return { totalSavings, isLoading, error };
};
