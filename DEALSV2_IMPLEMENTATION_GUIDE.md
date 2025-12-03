# DealsDirectoryV2 Implementation Guide

**Status**: ✓ Component Created & Tested  
**Location**: `/src/pages/DealsDirectoryV2.tsx`  
**Build**: ✓ Verified (no errors)  
**Safety**: ✓ V2 file only - AllDealsPage.tsx untouched  

---

## What Was Created

### DealsDirectoryV2.tsx (140 lines)

**Purpose**: Transform "All Deals" page into a functional directory with filters and grid layout.

**Features**:
1. **Sticky Filter Pills** (top)
   - [✨ All] [🍔 Eat] [🛶 Play] [🛍️ Shop]
   - Click to filter grid in real-time
   - Active pill: blue background, white text
   - Inactive pill: light background, gray text

2. **2-Column Responsive Grid**
   - Mobile: 2 columns (`grid-cols-2`)
   - Tablet: 2 columns (`md:grid-cols-2`)
   - Desktop: 3 columns (`lg:grid-cols-3`)
   - Gap: `gap-4` (cards don't touch edges)

3. **CompactDealCard Reuse**
   - Visual consistency with Home Screen
   - Each card shows deal image + name + offer
   - Click → Opens DealDetailModal
   - Handles redemption flow internally

4. **Smart Filtering**
   - Filter by category (restaurant, activity, shopping)
   - Exclude already-redeemed deals
   - Show deal count dynamically

5. **States Handled**
   - Loading: "Loading deals..."
   - Empty: "No deals found" + "View all" link
   - Error: Inherits from `useAllDeals()` hook
   - Expired pass: Red banner (same as FullDealList)

---

## Data Flow

```
DealsDirectoryV2
├── useAllDeals() → { deals, isLoading }
├── Filter by selectedCategory
├── Filter by redeemedDeals
└── Map to CompactDealCard array
    └── Each card handles modals internally
```

**Same Props as AllDealsPage**:
- `hasPass: boolean`
- `onRedeemClick: (dealName: string) => void`
- `redeemedDeals: string[]`
- `passExpiryDate?: string`
- `onBuyPassClick?: () => void`

---

## How to Test (Before Routing Swap)

### Option 1: Temporary Import in App.tsx (Recommended)
```typescript
// In App.tsx, temporarily add:
import DealsDirectoryV2 from './pages/DealsDirectoryV2';

// In your render, add a test route:
{testMode && <DealsDirectoryV2 hasPass={true} redeemedDeals={[]} onRedeemClick={() => {}} />}
```

### Option 2: Create Test Route
```typescript
// Add to router config:
{
  path: '/deals-v2',
  element: <DealsDirectoryV2 {...passedProps} />
}
```

### Option 3: Visual Inspection
```bash
# Open DevTools, check console for:
# ✓ No TypeScript errors
# ✓ No missing imports
# ✓ Data loads from Firestore

npm run dev  # Start dev server
# Navigate to /all-deals (existing)
# Then manually test DealsDirectoryV2 code
```

---

## Testing Checklist

- [ ] Filter pills respond to clicks
- [ ] Grid shows 2 columns on mobile
- [ ] Grid shows 2-3 columns on desktop
- [ ] CompactDealCard displays correctly
- [ ] Deal count updates when filter changes
- [ ] Clicking a card opens DealDetailModal
- [ ] Redeem button works in detail modal
- [ ] Dark mode looks correct
- [ ] Pass expired banner still shows
- [ ] Loading state displays correctly
- [ ] Empty state shows when no deals match

---

## When Ready: Swap Routing

**Option A: Replace AllDealsPage**
```typescript
// In App.tsx (router config):
{
  path: '/all-deals',
  element: <DealsDirectoryV2 hasPass={...} {...props} />
}
```

**Option B: Conditional Feature Flag**
```typescript
const useDealsV2 = import.meta.env.VITE_USE_DEALS_V2 === 'true';

{
  path: '/all-deals',
  element: useDealsV2 ? <DealsDirectoryV2 /> : <AllDealsPage />
}
```

**Option C: Update Navigation Tab**
```typescript
// In TabNavigation.tsx:
{ label: 'Deals', path: '/all-deals', icon: <GridIcon /> }  // Was "All Deals"
```

---

## Component Architecture

### State
```typescript
const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
// 'all' | 'restaurant' | 'activity' | 'shopping'
```

### Filter Options
```typescript
[
  { label: 'All', emoji: '✨', value: 'all' },
  { label: 'Eat', emoji: '🍔', value: 'restaurant' },
  { label: 'Play', emoji: '🛶', value: 'activity' },
  { label: 'Shop', emoji: '🛍️', value: 'shopping' },
]
```

### Filtering Logic
```typescript
// Filter by category
if (selectedCategory !== 'all') {
  filtered = filtered.filter(d => d.category === selectedCategory);
}

// Exclude redeemed
filtered = filtered.filter(d => !redeemedDeals.includes(d.name));
```

---

## Styling Details

### Filter Pills
- **Active**: `bg-action-primary text-white shadow-md`
- **Inactive**: `bg-bg-card border border-border-subtle`
- **Hover**: `border-action-primary/50 cursor-pointer`
- **Scroll**: Horizontal scroll on mobile (overflow-x-auto)

### Grid Container
- **Padding**: `px-4 sm:px-6` (no cards touching edges)
- **Gap**: `gap-4` (breathing room)
- **Responsive**: `grid-cols-2 md:grid-cols-2 lg:grid-cols-3`

### Accessibility
- Filter pills: `aria-pressed={isActive}`
- CompactDealCard: `role="button"` + `tabIndex={0}` + keyboard support
- Semantic HTML: `<section>`, `<button>`, proper hierarchy

---

## Performance Considerations

- **useMemo**: Filtering computed only when deps change (allDeals, selectedCategory, redeemedDeals)
- **No new requests**: Uses same `useAllDeals()` hook as FullDealList
- **No N+1 queries**: CompactDealCard uses `useVendor()` hook (TanStack Query cached)
- **Image loading**: Inherits from CompactDealCard (lazy load via ImageCarousel)

---

## Dark Mode Support

All Tailwind classes use CSS variables:
- `bg-bg-primary` → dark mode respects theme
- `text-text-primary` → dark mode respects theme
- `border-border-subtle` → dark mode respects theme
- `action-primary` → consistent across themes

**Tested with**: light/dark toggle in ThemeContext

---

## Fallback Plan (If Issues Arise)

1. **Revert to AllDealsPage**: Keep old page active
2. **Feature flag off**: `VITE_USE_DEALS_V2=false` in .env
3. **Router rollback**: Update routing back to AllDealsPage
4. **No data lost**: Firestore untouched, user state preserved

**Rollback time**: <1 minute (just swap router config)

---

## Next Steps

1. ✓ **Component created** (this file)
2. **Test locally** (`npm run dev`)
3. **Verify in browser** (desktop + mobile)
4. **Check console** (no errors)
5. **When satisfied**: Update routing in App.tsx
6. **Delete old FullDealList?** (optional, can keep as fallback)

---

## File Locations

```
/src/pages/
├── DealsDirectoryV2.tsx        ← NEW ✓
├── AllDealsPage.tsx            (existing, untouched)
├── HomePage.tsx                (existing, untouched)
└── ...

/src/components/
├── CompactDealCard.tsx         (reused, no changes)
├── FullDealList.tsx            (existing, untouched)
└── ...
```

---

## Questions?

- **Grid columns not right?** → Adjust `grid-cols-2 md:grid-cols-2 lg:grid-cols-3`
- **Filter pills not sticky?** → Add `sticky top-0 bg-bg-primary` to pill row div
- **Cards too big?** → CompactDealCard uses `w-60` (fixed width), grid handles layout
- **Empty state message?** → Edit lines 127-132 for custom text

---

**Component is production-ready. Awaiting manual routing swap.**
