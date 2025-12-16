import React, { useState } from 'react';
import { Deal } from '../types';
import { updateDeal } from '../services/firestoreService';

interface DealReorderPanelProps {
  deals: Deal[];
  onReorderComplete: () => void;
}

const DealReorderPanel: React.FC<DealReorderPanelProps> = ({ deals, onReorderComplete }) => {
  const [reorderingDealId, setReorderingDealId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isInitializingAll, setIsInitializingAll] = useState(false);

  // Fix deals stuck at sortOrder 999 or without sortOrder
  const initializeAllSortOrders = async () => {
    if (!window.confirm('This will assign sortOrder to all deals. Continue?')) {
      return;
    }
    setIsInitializingAll(true);
    try {
      for (let i = 0; i < deals.length; i++) {
        const deal = deals[i];
        // Assign sequential sortOrder (1, 2, 3, etc)
        await updateDeal(deal.id || '', { sortOrder: i + 1 });
      }
      setSuccessMessage('All deals initialized with proper sort order');
      setTimeout(() => setSuccessMessage(''), 2000);
      await new Promise(resolve => setTimeout(resolve, 300));
      onReorderComplete();
    } catch (error) {
      console.error('Error initializing sort orders:', error);
    } finally {
      setIsInitializingAll(false);
    }
  };

  const handleMoveUp = async (dealId: string, currentIndex: number) => {
    if (currentIndex === 0) return;
    setReorderingDealId(dealId);
    
    try {
      const currentDeal = deals[currentIndex];
      const prevDeal = deals[currentIndex - 1];
      
      // Initialize sortOrder for ALL deals if not already set (only do this once)
      const needsInit = deals.some(d => d.sortOrder === undefined);
      if (needsInit) {
        for (let i = 0; i < deals.length; i++) {
          if (deals[i].sortOrder === undefined) {
            await updateDeal(deals[i].id || '', { sortOrder: i + 1 });
          }
        }
        // Wait for all updates to propagate
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Now swap current and previous
      const currentOrder = currentDeal.sortOrder || currentIndex + 1;
      const prevOrder = prevDeal.sortOrder || currentIndex;
      
      await updateDeal(currentDeal.id || '', { sortOrder: prevOrder });
      await updateDeal(prevDeal.id || '', { sortOrder: currentOrder });
      
      setSuccessMessage(`Moved "${currentDeal.name}" up`);
      setTimeout(() => setSuccessMessage(''), 2000);
      
      // Reload deals from Firestore to reflect changes
      await new Promise(resolve => setTimeout(resolve, 200));
      onReorderComplete();
    } catch (error) {
      console.error('Error reordering deals:', error);
    } finally {
      setReorderingDealId(null);
    }
  };

  const handleMoveDown = async (dealId: string, currentIndex: number) => {
    if (currentIndex === deals.length - 1) return;
    setReorderingDealId(dealId);
    
    try {
      const currentDeal = deals[currentIndex];
      const nextDeal = deals[currentIndex + 1];
      
      // Initialize sortOrder for ALL deals if not already set (only do this once)
      const needsInit = deals.some(d => d.sortOrder === undefined);
      if (needsInit) {
        for (let i = 0; i < deals.length; i++) {
          if (deals[i].sortOrder === undefined) {
            await updateDeal(deals[i].id || '', { sortOrder: i + 1 });
          }
        }
        // Wait for all updates to propagate
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Now swap current and next
      const currentOrder = currentDeal.sortOrder || currentIndex + 1;
      const nextOrder = nextDeal.sortOrder || currentIndex + 2;
      
      await updateDeal(currentDeal.id || '', { sortOrder: nextOrder });
      await updateDeal(nextDeal.id || '', { sortOrder: currentOrder });
      
      setSuccessMessage(`Moved "${currentDeal.name}" down`);
      setTimeout(() => setSuccessMessage(''), 2000);
      
      // Reload deals from Firestore to reflect changes
      await new Promise(resolve => setTimeout(resolve, 200));
      onReorderComplete();
    } catch (error) {
      console.error('Error reordering deals:', error);
    } finally {
      setReorderingDealId(null);
    }
  };

  const handleSetFeatured = async (dealId: string, featured: boolean) => {
    setReorderingDealId(dealId);
    try {
      // Initialize sortOrder for ALL deals if not already set
      const needsInit = deals.some(d => d.sortOrder === undefined);
      if (needsInit) {
        for (let i = 0; i < deals.length; i++) {
          if (deals[i].sortOrder === undefined) {
            await updateDeal(deals[i].id || '', { sortOrder: i + 1 });
          }
        }
        // Wait for all updates to propagate
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await updateDeal(dealId, { featured });
      setSuccessMessage(featured ? 'Deal marked as featured' : 'Deal unmarked as featured');
      setTimeout(() => setSuccessMessage(''), 2000);
      
      // Reload deals from Firestore to reflect changes
      await new Promise(resolve => setTimeout(resolve, 200));
      onReorderComplete();
    } catch (error) {
      console.error('Error updating deal:', error);
    } finally {
      setReorderingDealId(null);
    }
  };

  // Sort deals by featured first, then by sortOrder
  const sortedDeals = [...deals].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    const aOrder = a.sortOrder || 999;
    const bOrder = b.sortOrder || 999;
    return aOrder - bOrder;
  });

  // Check if any deals are stuck at 999 or missing sortOrder
  const hasUnorderedDeals = deals.some(d => d.sortOrder === undefined || d.sortOrder === 999);

  return (
    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🔄 Reorder Prizes
        </h2>
        {successMessage && (
          <span className="text-sm text-value-highlight font-semibold">{successMessage}</span>
        )}
      </div>

      {hasUnorderedDeals && (
        <div className="mb-4 p-3 bg-urgency-high/10 border border-urgency-high rounded-lg">
          <p className="text-xs text-urgency-high font-medium mb-2">⚠️ Some prizes are missing sort order</p>
          <button
            onClick={initializeAllSortOrders}
            disabled={isInitializingAll}
            className="text-xs px-3 py-1.5 bg-urgency-high text-white hover:bg-urgency-high/80 rounded font-medium disabled:opacity-50 transition-colors"
          >
            {isInitializingAll ? 'Initializing...' : 'Fix All Prizes'}
          </button>
        </div>
      )}

      {deals.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No prizes to reorder</p>
      ) : (
        <div className="space-y-2">
          {sortedDeals.map((deal, index) => (
            <div
              key={deal.id}
              className={`flex items-center justify-between gap-3 p-3 bg-bg-primary rounded-lg border border-border-subtle transition-opacity ${
                reorderingDealId === deal.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {index + 1}. {deal.name}
                  </span>
                  {deal.featured && (
                    <span className="text-xs bg-value-highlight/30 text-value-highlight px-1.5 py-0.5 rounded font-bold">
                      ⭐ Featured
                    </span>
                  )}
                  {deal.sortOrder && (
                    <span className="text-xs bg-action-primary/30 text-action-primary px-1.5 py-0.5 rounded">
                      Order: {deal.sortOrder}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Featured toggle */}
                <button
                  onClick={() => handleSetFeatured(deal.id || '', !deal.featured)}
                  disabled={reorderingDealId === deal.id}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                    deal.featured
                      ? 'bg-value-highlight/20 text-value-highlight'
                      : 'bg-border-subtle text-text-secondary hover:bg-border-subtle/70'
                  } disabled:opacity-50`}
                  title={deal.featured ? 'Click to unfeature' : 'Click to feature'}
                >
                  {deal.featured ? '⭐' : '☆'}
                </button>

                {/* Move up button */}
                <button
                  onClick={() => handleMoveUp(deal.id || '', index)}
                  disabled={index === 0 || reorderingDealId === deal.id}
                  className="px-2 py-1 rounded text-xs font-semibold bg-action-primary/20 text-action-primary hover:bg-action-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  ↑
                </button>

                {/* Move down button */}
                <button
                  onClick={() => handleMoveDown(deal.id || '', index)}
                  disabled={index === sortedDeals.length - 1 || reorderingDealId === deal.id}
                  className="px-2 py-1 rounded text-xs font-semibold bg-action-primary/20 text-action-primary hover:bg-action-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-action-primary/10 rounded-lg text-xs text-action-primary">
        <p className="font-semibold mb-1">💡 How to use:</p>
        <ul className="space-y-1 text-action-primary/80">
          <li>• Click ⭐ to mark a deal as featured (shows in featured section)</li>
          <li>• Use ↑/↓ arrows to reorder deals (sortOrder is auto-updated)</li>
          <li>• Featured deals always appear first, then sorted by order</li>
        </ul>
      </div>
    </div>
  );
};

export default DealReorderPanel;
