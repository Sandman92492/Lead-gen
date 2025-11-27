import React from 'react';
import FullDealList from '../components/FullDealList';

interface AllDealsPageProps {
  hasPass: boolean;
  onRedeemClick: (dealName: string) => void;
  redeemedDeals: string[];
  passExpiryDate?: string;
  onBuyPassClick?: () => void;
}

const AllDealsPage: React.FC<AllDealsPageProps> = ({ hasPass, onRedeemClick, redeemedDeals, passExpiryDate, onBuyPassClick }) => {
  return (
    <main className="pb-24 sm:pb-0">
      <FullDealList hasPass={hasPass} onRedeemClick={onRedeemClick} redeemedDeals={redeemedDeals} passExpiryDate={passExpiryDate} onBuyPassClick={onBuyPassClick} />
    </main>
  );
};

export default AllDealsPage;
