import React from 'react';
import FullDealList from '../components/FullDealList';

interface AllDealsPageProps {
  hasPass: boolean;
  onRedeemClick: (dealName: string) => void;
  redeemedDeals: string[];
}

const AllDealsPage: React.FC<AllDealsPageProps> = ({ hasPass, onRedeemClick, redeemedDeals }) => {
  return (
    <main className="pb-24 sm:pb-0">
      <FullDealList hasPass={hasPass} onRedeemClick={onRedeemClick} redeemedDeals={redeemedDeals} />
    </main>
  );
};

export default AllDealsPage;
