import React from 'react';
import VipDashboard from './VipDashboard';
import DealsShowcase from './DealsShowcase';
import FullDealList from './FullDealList';
import { PassInfo } from '../context/AuthContext';

interface SignedInWithPassViewProps {
  pass: PassInfo;
  redeemedDeals: string[];
  onViewPass: () => void;
  onRedeemClick: (dealName: string) => void;
  onBuyPassClick?: () => void;
}

const SignedInWithPassView: React.FC<SignedInWithPassViewProps> = ({
  pass,
  redeemedDeals,
  onViewPass,
  onRedeemClick,
  onBuyPassClick,
}) => {
  return (
    <main>
      <VipDashboard 
        passHolderName={pass.passHolderName} 
        onViewPass={onViewPass}
      />
      <DealsShowcase 
        hasPass={true} 
        onRedeemClick={onRedeemClick} 
        redeemedDeals={redeemedDeals}
        passExpiryDate={pass.expiryDate}
      />
      <FullDealList 
         hasPass={true} 
         onRedeemClick={onRedeemClick} 
         redeemedDeals={redeemedDeals}
         passExpiryDate={pass.expiryDate}
         onBuyPassClick={onBuyPassClick}
       />
    </main>
  );
};

export default SignedInWithPassView;
