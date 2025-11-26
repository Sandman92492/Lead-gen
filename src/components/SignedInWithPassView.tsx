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
}

const SignedInWithPassView: React.FC<SignedInWithPassViewProps> = ({
  pass,
  redeemedDeals,
  onViewPass,
  onRedeemClick,
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
      />
      <FullDealList 
         hasPass={true} 
         onRedeemClick={onRedeemClick} 
         redeemedDeals={redeemedDeals}
       />
    </main>
  );
};

export default SignedInWithPassView;
