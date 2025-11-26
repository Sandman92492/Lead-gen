import React from 'react';
import { PassType } from '../types';
import FreeUserTeaser from './FreeUserTeaser';
import VipDashboard from './VipDashboard';
import { PassInfo } from '../context/AuthContext';

interface HomePageProps {
  hasPass: boolean;
  userName?: string;
  onSelectPass?: (passType: PassType) => void;
  redeemedDeals?: string[];
  onNavigateToDeal?: () => void;
  pass?: PassInfo | null;
  onRedeemClick?: (dealName: string) => void;
  onNavigateToPass?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  hasPass,
  userName,
  onSelectPass,
  redeemedDeals = [],
  onNavigateToDeal,
  pass,
  onRedeemClick,
  onNavigateToPass,
}) => {
  if (hasPass) {
    return (
      <VipDashboard
        userName={userName}
        redeemedDeals={redeemedDeals}
        pass={pass}
        onBrowseDeals={onNavigateToDeal}
        onRedeemClick={onRedeemClick}
        onViewPass={onNavigateToPass}
      />
    );
  }

  return (
    <FreeUserTeaser
      userName={userName}
      onSelectPass={() => onSelectPass?.('holiday')}
    />
  );
};

export default HomePage;
