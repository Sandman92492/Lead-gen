import React from 'react';
import { PassType, Deal } from '../types';
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
  onBuyPassClick?: () => void;
  isOnline?: boolean;
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
  onBuyPassClick,
  isOnline,
}) => {
  // Show SuperHomeScreen for all signed-in users (with or without pass)
  if (useSuperHome) {
    return (
      <SuperHomeScreen
        userName={userName}
        userPhotoURL={userPhotoURL}
        pass={pass}
        dealsByCategory={dealsByCategory}
        redeemedDeals={redeemedDeals}
        onRedeemClick={onRedeemClick}
        onBuyPassClick={onBuyPassClick || (() => onSelectPass?.('holiday'))}
        isOnline={isOnline}
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

  // This shouldn't happen with useSuperHome=true, but fallback just in case
  return null;
};

export default HomePage;
