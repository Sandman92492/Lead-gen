# Integration Code Examples
## How to Wire SuperHomeScreen into HomePage & Update Navigation

---

## 1. Update HomePage.tsx

**Current Implementation** (simplified):
```typescript
const HomePage: React.FC<HomePageProps> = ({
  hasPass,
  userName,
  pass,
  redeemedDeals = [],
  onRedeemClick,
  onNavigateToPass,
}) => {
  if (hasPass) {
    return (
      <VipDashboard
        passHolderName={pass.passHolderName}
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
```

**Updated Implementation** (with SuperHomeScreen):
```typescript
import React from 'react';
import { PassType, Deal } from '../types';
import FreeUserTeaser from './FreeUserTeaser';
import SuperHomeScreen from '../components/SuperHomeScreen';
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
  dealsByCategory?: { category: string; emoji: string; deals: Deal[] }[];
  useSuperHome?: boolean; // Feature flag for gradual rollout
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
  dealsByCategory = [],
  useSuperHome = false, // Default to old UI for now
}) => {
  if (!hasPass) {
    return (
      <FreeUserTeaser
        userName={userName}
        onSelectPass={() => onSelectPass?.('holiday')}
      />
    );
  }

  // NEW: Use SuperHomeScreen if flag is enabled
  if (useSuperHome && dealsByCategory.length > 0) {
    return (
      <SuperHomeScreen
        userName={userName}
        pass={pass}
        onViewPass={onNavigateToPass}
        dealsByCategory={dealsByCategory}
        redeemedDeals={redeemedDeals}
        passExpiryDate={pass?.expiryDate}
        onDealClick={(deal) => {
          // Optional: handle deal click (could navigate to deal details)
          console.log('Deal clicked:', deal.name);
        }}
        onRedeemClick={onRedeemClick}
      />
    );
  }

  // FALLBACK: Use old VipDashboard while testing
  return (
    <VipDashboard
      passHolderName={pass?.passHolderName || 'User'}
      onViewPass={onNavigateToPass}
    />
  );
};

export default HomePage;
```

**Key Changes**:
- ✓ Import SuperHomeScreen
- ✓ Add `useSuperHome` boolean flag (for gradual rollout)
- ✓ Add `dealsByCategory` prop
- ✓ Conditional render based on flag
- ✓ Fallback to VipDashboard if flag is false

**Feature Flag Usage**:
```typescript
// In App.tsx or your main routing file:
<HomePage
  hasPass={hasPass}
  userName={user?.displayName}
  pass={pass}
  redeemedDeals={redeemedDeals}
  onRedeemClick={handleRedeemClick}
  onNavigateToPass={handleViewPass}
  dealsByCategory={dealsByCategory}
  useSuperHome={true} // Toggle this to enable/disable SuperHomeScreen
/>
```

---

## 2. How to Build dealsByCategory Data

The `dealsByCategory` structure needs to be built in the parent component (likely `SignedInWithPassView.tsx` or `App.tsx`).

### Example: Building from Firestore Data

```typescript
import { useAllDeals } from '../hooks/useAllDeals';

// In your component:
const { data: allDeals } = useAllDeals(); // Fetch all deals

// Build dealsByCategory array
const dealsByCategory = React.useMemo(() => {
  const categoryMap: Record<string, Deal[]> = {};

  allDeals?.forEach((deal) => {
    const category = deal.category || 'Other';
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    categoryMap[category].push(deal);
  });

  // Convert to array with emoji mappings
  const emojiMap: Record<string, string> = {
    restaurant: '🍽️',
    activity: '🎨',
    shopping: '🛍️',
    lifestyle: '✨',
    Other: '⭐',
  };

  return Object.entries(categoryMap).map(([category, deals]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    emoji: emojiMap[category] || '⭐',
    deals: deals.slice(0, 10), // Limit to 10 deals per category
  }));
}, [allDeals]);

// Pass to HomePage:
<HomePage
  {...otherProps}
  dealsByCategory={dealsByCategory}
/>
```

### Example: Hardcoded Test Data

```typescript
const dealsByCategory = [
  {
    category: 'Restaurants',
    emoji: '🍽️',
    deals: [
      {
        id: '1',
        vendorId: 'vendor-1',
        name: 'Kakklein Collective',
        offer: '10% OFF Total Bill',
        savings: 150,
        category: 'restaurant',
        city: 'Port Alfred',
        featured: true,
        sortOrder: 1,
        imageUrl: 'https://...',
        images: [],
        createdAt: new Date().toISOString(),
      },
      // ... more deals
    ],
  },
  {
    category: 'Activities',
    emoji: '🎨',
    deals: [
      // ... deals
    ],
  },
];
```

---

## 3. Update TabNavigation Configuration

**Current**: 4 tabs (Home, My Pass, All Deals, Profile)

**File to Modify**: The component that creates tabs (likely in `SignedInTabsApp.tsx` or `App.tsx`)

### Before
```typescript
const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: <HomeIcon />,
  },
  {
    id: 'my-pass',
    label: 'My Pass',
    path: '/my-pass',
    icon: <PassIcon />,
  },
  {
    id: 'all-deals',
    label: 'All Deals',
    path: '/all-deals',
    icon: <DealsIcon />,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: <ProfileIcon />,
  },
];

return (
  <div>
    <Routes>
      <Route path="/home" element={<HomePage {...props} />} />
      <Route path="/my-pass" element={<MyPassPage {...props} />} />
      <Route path="/all-deals" element={<AllDealsPage {...props} />} />
      <Route path="/profile" element={<ProfilePage {...props} />} />
    </Routes>
    <TabNavigation tabs={tabs} isMobile={true} />
  </div>
);
```

### After
```typescript
const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: <HomeIcon />,
  },
  {
    id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: <DealsIcon />,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: <ProfileIcon />,
  },
];

return (
  <div>
    <Routes>
      <Route path="/home" element={<HomePage {...props} dealsByCategory={dealsByCategory} useSuperHome={true} />} />
      <Route path="/deals" element={<AllDealsPage {...props} />} />
      <Route path="/profile" element={<ProfilePage {...props} />} />
      {/* Keep /my-pass as fallback for existing links, redirect to /home */}
      <Route path="/my-pass" element={<Navigate to="/home" replace />} />
    </Routes>
    <TabNavigation tabs={tabs} isMobile={true} />
  </div>
);
```

**Key Changes**:
- ✓ Remove my-pass tab
- ✓ Rename all-deals to deals
- ✓ Add redirect from /my-pass → /home (backward compatible)
- ✓ Pass `dealsByCategory` to HomePage
- ✓ Set `useSuperHome={true}`

---

## 4. Safe Rollout Strategy (Optional)

If you want to test with real users before fully switching:

```typescript
// In your user context or config:
const FEATURE_FLAGS = {
  USE_SUPER_HOME_SCREEN: process.env.REACT_APP_FEATURE_SUPER_HOME === 'true',
};

// In HomePage:
<HomePage
  {...props}
  dealsByCategory={dealsByCategory}
  useSuperHome={FEATURE_FLAGS.USE_SUPER_HOME_SCREEN}
/>

// In .env.example:
REACT_APP_FEATURE_SUPER_HOME=false

// Toggle in .env or Netlify dashboard:
REACT_APP_FEATURE_SUPER_HOME=true
```

This allows you to enable/disable the new UI without redeploying.

---

## 5. Redemption Flow - NO CODE CHANGES NEEDED

The redemption flow remains untouched. Here's why it still works:

### DealDetailModal Already Has Redeem Button

```typescript
// In DealDetailModal.tsx (existing, no changes needed)
<button
  onClick={() => onRedeemClick?.(deal.name)}
  className="w-full bg-urgency-high text-white font-bold py-3 rounded-lg hover:brightness-110"
>
  Redeem
</button>
```

### Flow Sequence

1. **User taps CompactDealCard**
   ```typescript
   // CompactDealCard.tsx (new)
   const handleCardClick = () => {
     setIsDetailModalOpen(true);
   };
   ```

2. **DealDetailModal opens**
   ```typescript
   <DealDetailModal
     isOpen={isDetailModalOpen}
     deal={deal}
     onClose={() => setIsDetailModalOpen(false)}
   />
   ```

3. **User taps "Redeem" in detail modal**
   ```typescript
   // This calls onRedeemClick passed from parent
   // Which triggers App.tsx's redemption orchestration
   ```

4. **Existing redemption flow takes over** (unchanged)
   ```
   RedemptionConfirmationModal
   → PinVerificationModal (vendor PIN)
   → RedemptionSuccessModal
   ```

**No changes to `App.tsx`, `PinVerificationModal`, or `RedemptionConfirmationModal` needed.**

---

## 6. Example: Full Integration in App.tsx

```typescript
import React, { useState, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { useAllDeals } from './hooks/useAllDeals';
import HomePage from './pages/HomePage';
import AllDealsPage from './pages/AllDealsPage';
import ProfilePage from './pages/ProfilePage';
import TabNavigation from './components/TabNavigation';

const App: React.FC = () => {
  const { user, pass, redeemedDeals } = useAuth();
  const { data: allDeals } = useAllDeals();

  // Build dealsByCategory
  const dealsByCategory = useMemo(() => {
    if (!allDeals) return [];

    const categoryMap: Record<string, typeof allDeals> = {};
    allDeals.forEach((deal) => {
      const cat = deal.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(deal);
    });

    const emojiMap: Record<string, string> = {
      restaurant: '🍽️',
      activity: '🎨',
      shopping: '🛍️',
      lifestyle: '✨',
      Other: '⭐',
    };

    return Object.entries(categoryMap).map(([category, deals]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      emoji: emojiMap[category.toLowerCase()] || '⭐',
      deals: deals.slice(0, 10),
    }));
  }, [allDeals]);

  const handleRedeemClick = (dealName: string) => {
    // This triggers the existing redemption flow
    // (handled in App.tsx orchestration)
  };

  const handleViewPass = () => {
    // This opens the Pass modal
    // (already implemented)
  };

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', path: '/home', icon: <HomeIcon /> },
    { id: 'deals', label: 'Deals', path: '/deals', icon: <DealsIcon /> },
    { id: 'profile', label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
  ];

  return (
    <>
      <Routes>
        <Route
          path="/home"
          element={
            <HomePage
              hasPass={!!pass}
              userName={user?.displayName}
              pass={pass}
              redeemedDeals={redeemedDeals}
              onRedeemClick={handleRedeemClick}
              onNavigateToPass={handleViewPass}
              dealsByCategory={dealsByCategory}
              useSuperHome={true} // ✓ Enable SuperHomeScreen
            />
          }
        />
        <Route path="/deals" element={<AllDealsPage {...otherProps} />} />
        <Route path="/profile" element={<ProfilePage {...otherProps} />} />
        <Route path="/my-pass" element={<Navigate to="/home" replace />} />
      </Routes>

      <TabNavigation tabs={tabs} isMobile={true} />
    </>
  );
};

export default App;
```

---

## 7. Testing the Integration

### Quick Test Checklist

- [ ] `npm run dev` - Start dev server
- [ ] Navigate to Home page
- [ ] Verify SuperHomeScreen renders (pass card visible, stats visible, category rows visible)
- [ ] Verify pass card opens Pass modal on click
- [ ] Click a CompactDealCard
- [ ] Verify DealDetailModal opens with deal info
- [ ] Click "Redeem" in detail modal
- [ ] Verify RedemptionConfirmationModal opens
- [ ] Enter vendor PIN
- [ ] Verify RedemptionSuccessModal shows
- [ ] Check mobile responsiveness (DevTools)
- [ ] Verify dark mode works
- [ ] Check navigation to other tabs (Deals, Profile)

### Console Checks

```typescript
// No errors should appear in browser console
// Network tab should show all images loading
// React DevTools should show SuperHomeScreen component mounted
```

---

## 8. Rollback Plan

If SuperHomeScreen has issues in production:

### Option 1: Feature Flag Toggle
```typescript
// Disable in Netlify dashboard or .env
REACT_APP_FEATURE_SUPER_HOME=false

// Redeploy (takes ~1 minute)
// App will show old VipDashboard automatically
```

### Option 2: Quick Revert
```bash
# If merged to main:
git revert <commit-hash>
git push

# Redeploy
npm run build && git push
```

### Option 3: Branch Deploy
```bash
# Deploy from staging branch
git checkout staging
npm run build
# Deploy to production
```

---

## Summary

**Integration Points**:
1. ✓ Update HomePage.tsx (add SuperHomeScreen render)
2. ✓ Build dealsByCategory from Firestore data
3. ✓ Update TabNavigation (remove my-pass tab)
4. ✓ Add feature flag for gradual rollout

**Safety**:
- ✓ No breaking changes
- ✓ Redemption flow untouched
- ✓ Easy rollback with feature flag
- ✓ Backward compatible (redirect /my-pass to /home)

**Testing**:
- ✓ Full local testing before deploy
- ✓ Staging environment testing recommended
- ✓ Gradual rollout via feature flag

**Next Step**: Review integration examples, then implement Phase 2.
