import React from 'react';
import { PassType, Deal } from '../types';
import FreeUserTeaser from './FreeUserTeaser';
import VipDashboard from './VipDashboard';
import SuperHomeScreen from '../components/SuperHomeScreen';
import { PassInfo } from '../context/AuthContext';

interface HomePageProps {
  hasPass: boolean;
  userName?: string;
  userPhotoURL?: string;
  onSelectPass?: (passType: PassType) => void;
  redeemedDeals?: string[];
  onNavigateToDeal?: () => void;
  pass?: PassInfo | null;
  onRedeemClick?: (dealName: string) => void;
  dealsByCategory?: { category: string; emoji: string; deals: Deal[] }[];
  useSuperHome?: boolean;
  onDealClick?: (deal: Deal) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  hasPass,
  userName,
  userPhotoURL,
  onSelectPass,
  redeemedDeals = [],
  onNavigateToDeal,
  pass,
  onRedeemClick,
  dealsByCategory = [],
  useSuperHome = false,
  onDealClick,
}) => {
  // Show SuperHomeScreen for pass users if feature flag is enabled
  if (hasPass && useSuperHome) {
    return (
      <SuperHomeScreen
        userName={userName}
        userPhotoURL={userPhotoURL}
        pass={pass}
        dealsByCategory={dealsByCategory}
        redeemedDeals={redeemedDeals}
        onDealClick={onDealClick}
        onRedeemClick={onRedeemClick}
      />
    );
  }

  // Fallback to VipDashboard for pass users if feature flag is off
  if (hasPass) {
    return (
      <VipDashboard
        userName={userName}
        redeemedDeals={redeemedDeals}
        pass={pass}
        onBrowseDeals={onNavigateToDeal}
        onRedeemClick={onRedeemClick}
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
