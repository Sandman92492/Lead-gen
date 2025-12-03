# Component Visual Reference & Implementation Guide

## CompactDealCard - Thumbnail Card Layout

```
┌──────────────────────┐
│                      │
│   [Image]           │  ← 160px height
│   [Image]           │     
│   [carousel dots]    │
│                      │
├──────────────────────┤
│  Kakklein Collective │  ← Deal name (line clamp 2)
│  10% OFF Coffee      │  ← Offer (line clamp 2)
│                      │
│ [Save R150] (opt)    │  ← Savings badge (if > 0)
└──────────────────────┘
   140px width
```

**States**:

1. **Default**
   - Card shadow: shadow-md
   - Border: border-border-subtle
   - Hover: scale-105, shadow-lg

2. **Redeemed**
   - Image: opacity reduced (visual fade)
   - Badge: Top-right "✓ Used" (green background)
   - Disabled: Yes, but still clickable to view details

3. **No Image**
   - Placeholder: Gray background with image icon
   - Text still visible below

---

## HorizontalCategoryRow - Scroll Row Layout

```
📍 RESTAURANTS          [◀] [▶]    ← Title, emoji, scroll buttons (desktop)
Description text here              ← Optional description

┌────────────────────────────────────────────┐
│                                            │  ← Fade edges (mobile)
│ ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│ │          │  │          │  │          │ │
│ │ Card 1   │  │ Card 2   │  │ Card 3   │ │
│ │          │  │          │  │          │ │
│ ├──────────┤  ├──────────┤  ├──────────┤ │
│ │ Name     │  │ Name     │  │ Name     │ │
│ │ Offer    │  │ Offer    │  │ Offer    │ │
│ └──────────┘  └──────────┘  └──────────┘ │
│                                 [→scroll] │
└────────────────────────────────────────────┘
```

**Features**:
- Horizontal scroll (smooth behavior)
- Gradient fade on left/right edges (mobile)
- Scroll button hints (desktop)
- Cards snap to position
- Fully responsive (mobile shows more rows, desktop shows more cards per row)

---

## SuperHomeScreen - Full Layout

```
╔════════════════════════════════════════════════════════╗
║                     [STICKY HEADER]                    ║
║  Welcome Back                            [Profile Pic] ║
║  John Smith                                             ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║                    [TAP TO VERIFY]                    ║
║                                                        ║
║        ┌──────────────────────────────────────┐       ║
║        │  PAHP                    [🔒 lock]   │       ║
║        │                                       │       ║
║        │      PASS HOLDER                     │       ║
║        │      John Smith                      │       ║
║        │                                       │       ║
║        │         ● 14:25:33                   │       ║
║        │  Tap to show staff for verification  │       ║
║        │                                       │       ║
║        └──────────────────────────────────────┘       ║
║                                                        ║
║    ✓ Valid until 25 Dec 2025                         ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║            STATS ROW (ENGAGEMENT METRICS)              ║
║  ┌──────────────────┐   ┌──────────────────┐         ║
║  │ Deals Redeemed   │   │ Total Savings    │         ║
║  │      4           │   │    R2,450        │         ║
║  └──────────────────┘   └──────────────────┘         ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║             FEED: CATEGORY ROWS                        ║
║                                                        ║
║  🍽️ RESTAURANTS                                        ║
║  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  [scroll→]   ║
║  │Card│  │Card│  │Card│  │Card│  │Card│             ║
║  └────┘  └────┘  └────┘  └────┘  └────┘             ║
║                                                        ║
║  🎨 ACTIVITIES                                        ║
║  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  [scroll→]   ║
║  │Card│  │Card│  │Card│  │Card│  │Card│             ║
║  └────┘  └────┘  └────┘  └────┘  └────┘             ║
║                                                        ║
║  🛍️ SHOPPING                                          ║
║  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  [scroll→]   ║
║  │Card│  │Card│  │Card│  │Card│  │Card│             ║
║  └────┘  └────┘  └────┘  └────┘  └────┘             ║
║                                                        ║
║  (Bottom padding for tab navigation)                  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## Navigation Flow (NEW)

### Current Navigation (4 Tabs)
```
┌─────────────────────────────────────────┐
│  Home  │  My Pass  │  All Deals  │  Profile │
│  (show │ (separate │  (catalog)  │ (user    │
│   pass │   page)   │             │  settings)
│ + some │           │             │          │
│ deals) │           │             │          │
└─────────────────────────────────────────┘
```

### Proposed Navigation (3 Tabs)
```
┌──────────────────────────────────┐
│  Home  │  Deals  │  Profile      │
│ (pass  │ (catalog │ (redemption  │
│ + feed)│ all)     │ history +    │
│        │          │ settings)    │
└──────────────────────────────────┘
```

---

## Data Structure: dealsByCategory

```typescript
// How to structure data for SuperHomeScreen
const dealsByCategory = [
  {
    category: 'Restaurants',
    emoji: '🍽️',
    deals: [
      { id: '1', name: 'Kakklein', offer: '10% OFF', ... },
      { id: '2', name: 'The Crooked Tree', offer: 'Free Dessert', ... },
      // ... more deals
    ],
  },
  {
    category: 'Activities',
    emoji: '🎨',
    deals: [
      { id: '3', name: 'Kayak Tour', offer: 'R50 OFF', ... },
      // ... more deals
    ],
  },
  {
    category: 'Shopping',
    emoji: '🛍️',
    deals: [
      { id: '4', name: 'Local Boutique', offer: '20% OFF', ... },
      // ... more deals
    ],
  },
];
```

**Question for Client**: Should we:
1. Create a `config/categories` Firestore document?
2. Hardcode emoji mappings in the component?
3. Add emoji field to each deal?

---

## Redemption Flow with NEW Components

### Old Flow (FeaturedDealCard)
```
[FeaturedDealCard with Redeem Button]
    ↓ (user clicks "Redeem")
[RedemptionConfirmationModal]
    ↓ (user clicks "Confirm")
[PinVerificationModal] ← Vendor PIN entry
    ↓ (correct PIN entered)
[RedemptionSuccessModal] ← Staff shows this to customer
```

### New Flow (CompactDealCard → DealDetailModal)
```
[CompactDealCard thumbnail - NO BUTTONS]
    ↓ (user clicks anywhere on card)
[DealDetailModal - Full info + Redeem button visible]
    ↓ (user clicks "Redeem" button)
[RedemptionConfirmationModal]
    ↓ (user clicks "Confirm")
[PinVerificationModal] ← Vendor PIN entry (NO CHANGE)
    ↓ (correct PIN entered)
[RedemptionSuccessModal] ← Staff shows this (NO CHANGE)
```

**Key**: The `RedemptionConfirmationModal` and `PinVerificationModal` remain **untouched**. Only the trigger changes (button moved to detail modal).

---

## Responsive Behavior

### Mobile (< 768px)
- SuperHomeScreen header: Compact, single line
- Pass card: Full width - 32px (16px padding each side)
- Stats: 2 columns, stacked vertically
- HorizontalCategoryRow: Shows 1-2 cards per scroll
- Scroll buttons: Hidden (fade edges visible)
- Carousel dots: Always visible

### Tablet (768px - 1024px)
- SuperHomeScreen header: Same as mobile
- Pass card: Centered, ~400px max width
- Stats: 2 columns, side by side
- HorizontalCategoryRow: Shows 2-3 cards per scroll
- Scroll buttons: Visible on hover
- Carousel dots: Always visible

### Desktop (> 1024px)
- SuperHomeScreen header: Full width with profile icon right-aligned
- Pass card: Centered, ~450px max width
- Stats: 2 columns, wider spacing
- HorizontalCategoryRow: Shows 3-5 cards per scroll
- Scroll buttons: Always visible
- Carousel dots: Always visible

---

## Dark Mode Support

All new components use CSS variables:
```css
/* Light Mode (default) */
--color-bg-primary: white
--color-bg-card: #f9fafb
--color-text-primary: #1f2937
--color-action-primary: #0066cc

/* Dark Mode */
--color-bg-primary: #0f172a
--color-bg-card: #1e293b
--color-text-primary: #f1f5f9
--color-action-primary: #3b82f6
```

No manual theme switching needed in components—all use `dark:` Tailwind classes.

---

## Animation Details

### CompactDealCard
- **Hover**: `scale-105` (1.05x zoom)
- **Duration**: 300ms
- **Shadow**: Increases on hover

### HorizontalCategoryRow
- **Scroll**: `smooth` behavior
- **Fade Edges**: Gradient from transparent to opaque
- **Buttons**: Fade effect on hover

### SuperHomeScreen
- **Pass Card**: Initial state → `scale-105` on hover
- **Stats**: No animation (static)
- **Category Rows**: Staggered scroll on page load

---

## Testing Checklist

### Component Unit Tests
- [ ] CompactDealCard renders with deal data
- [ ] CompactDealCard shows redeemed badge correctly
- [ ] CompactDealCard opens detail modal on click
- [ ] HorizontalCategoryRow renders all deals
- [ ] HorizontalCategoryRow scrolls smoothly
- [ ] HorizontalCategoryRow scroll buttons work (desktop)
- [ ] SuperHomeScreen displays pass card
- [ ] SuperHomeScreen displays stats
- [ ] SuperHomeScreen displays category rows
- [ ] SuperHomeScreen pass modal opens on click

### Integration Tests
- [ ] SuperHomeScreen integrated into HomePage
- [ ] Redemption flow still works (detail modal → confirmation → PIN)
- [ ] Pass verification still works (open Pass modal)
- [ ] Navigation between tabs works

### Visual/UX Tests
- [ ] Mobile responsiveness (iPhone 12, SE)
- [ ] Tablet responsiveness (iPad)
- [ ] Desktop display (1920px, 2560px)
- [ ] Dark mode rendering
- [ ] Light mode rendering
- [ ] Scroll performance (no jank)
- [ ] Touch interactions (mobile)
- [ ] Hover interactions (desktop)

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Color contrast meets WCAG AA

---

## Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| CompactDealCard.tsx | ~130 | Thumbnail deal card |
| HorizontalCategoryRow.tsx | ~150 | Netflix-style row |
| SuperHomeScreen.tsx | ~280 | Full home screen |
| **Total** | **~560** | **New modern UI** |

---

## Integration Points

### HomePage.tsx (Modify)
```typescript
// Add SuperHomeScreen render
if (hasPass) {
  return (
    <SuperHomeScreen
      userName={userName}
      pass={pass}
      onViewPass={onViewPass}
      dealsByCategory={dealsByCategory}
      redeemedDeals={redeemedDeals}
      onDealClick={handleDealClick}
      onRedeemClick={onRedeemClick}
    />
  );
}
```

### App.tsx (No Changes Needed)
- Redemption modal orchestration remains the same
- PIN verification modal still works
- Pass modal still works

### TabNavigation.tsx (Modify)
```typescript
// Update tabs array to remove "My Pass"
const tabs = [
  { id: 'home', label: 'Home', path: '/home', icon: <HomeIcon /> },
  { id: 'deals', label: 'Deals', path: '/deals', icon: <DealsIcon /> },
  { id: 'profile', label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
];
```

### ProfilePage.tsx (Enhance)
```typescript
// Add Redemption History section
// Move from MyPassPage if needed
```

---

## Color Palette Reference

```
Primary Actions: action-primary (#0066cc)
Success States: success (#10b981)
Urgent/Redeem: urgency-high (#dc2626)
Text: text-primary / text-secondary
Background: bg-primary / bg-card
Borders: border-subtle
```

All colors defined in `/src/colors.css` — no hardcoding needed.

---

## Summary

These three components create a modern, premium experience while maintaining **100% compatibility** with existing redemption flows. The layout follows proven patterns from Airbnb, Netflix, and Apple Wallet.

**Next Step**: Review visuals and component props, then proceed with Phase 2 (Integration).
