# DealsDirectoryV2 - Visual Mockups

## Mobile View (2 columns)

```
┌─────────────────────────────────────┐
│         All Deals                   │
│  Browse all 12 exclusive deals...   │
│                                     │
│ ✨ All | 🍔 Eat | 🛶 Play | 🛍️...│  ← Scrollable pills
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Image    │  │ Image    │        │
│  │ (160px)  │  │ (160px)  │        │
│  ├──────────┤  ├──────────┤        │
│  │Deal Name │  │Deal Name │        │
│  │10% OFF   │  │Free Kayak│        │
│  │[Save R50]│  │[Save R100]│       │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Image    │  │ Image    │        │
│  │ (160px)  │  │ (160px)  │        │
│  ├──────────┤  ├──────────┤        │
│  │Deal Name │  │Deal Name │        │
│  │Massage   │  │Shopping  │        │
│  │[Save R75]│  │[Save R200]│       │
│  └──────────┘  └──────────┘        │
│                                     │
│               ... (more cards)      │
└─────────────────────────────────────┘
```

## Tablet View (2 columns)

```
┌─────────────────────────────────────────────┐
│              All Deals                      │
│   Browse all 12 exclusive deals in...       │
│                                             │
│ ✨ All | 🍔 Eat | 🛶 Play | 🛍️ Shop       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Image        │  │ Image        │       │
│  │ (160px)      │  │ (160px)      │       │
│  ├──────────────┤  ├──────────────┤       │
│  │Deal Name     │  │Deal Name     │       │
│  │10% OFF       │  │Free Activity │       │
│  │[Save R50]    │  │[Save R100]   │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Image        │  │ Image        │       │
│  │ (160px)      │  │ (160px)      │       │
│  ├──────────────┤  ├──────────────┤       │
│  │Deal Name     │  │Deal Name     │       │
│  │Wellness      │  │Shopping      │       │
│  │[Save R75]    │  │[Save R200]   │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│               ... (more cards)              │
└─────────────────────────────────────────────┘
```

## Desktop View (3 columns)

```
┌──────────────────────────────────────────────────────────┐
│                     All Deals                            │
│        Browse all 12 exclusive deals in Port Alfred      │
│                                                          │
│  ✨ All | 🍔 Eat | 🛶 Play | 🛍️ Shop                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Image    │  │ Image    │  │ Image    │              │
│  │ (160px)  │  │ (160px)  │  │ (160px)  │              │
│  ├──────────┤  ├──────────┤  ├──────────┤              │
│  │Deal Name │  │Deal Name │  │Deal Name │              │
│  │10% OFF   │  │Free Kayak│  │Spa Deal  │              │
│  │[Save R50]│  │[Save R100│  │[Save R150│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Image    │  │ Image    │  │ Image    │              │
│  │ (160px)  │  │ (160px)  │  │ (160px)  │              │
│  ├──────────┤  ├──────────┤  ├──────────┤              │
│  │Deal Name │  │Deal Name │  │Deal Name │              │
│  │Shopping  │  │Coffee    │  │Hiking    │              │
│  │[Save R75]│  │[Save R30]│  │[Save R120│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│               ... (more cards)                          │
└──────────────────────────────────────────────────────────┘
```

## Filter Pill States

### Inactive (Default)
```
┌────────────┐
│ 🍔 Eat     │  ← Light background, gray text
└────────────┘
   border: 1px solid border-subtle
   hover: border-action-primary/50
```

### Active (Selected)
```
┌────────────┐
│ 🍔 Eat     │  ← Blue background, white text
└────────────┘
   bg: action-primary
   shadow: md
```

### Tablet Pill Row (Full width, no scroll)
```
┌─────────────────────────────────────┐
│ ✨ All | 🍔 Eat | 🛶 Play | 🛍️ Shop │
└─────────────────────────────────────┘
```

## Filter in Action: Click "🛶 Play"

**Before Filter**:
```
All Deals (12 items)
[Restaurant] [Activity] [Shopping]
```

**After Filter**:
```
All Deals (3 items)
[Restaurant] [Activity ← Active] [Shopping]

Grid shows only:
- Kayaking Adventure
- Hiking Tour
- Rock Climbing
```

## Empty State Example

**User selects "Shop" but has redeemed all shopping deals**:
```
┌─────────────────────────────────────┐
│           All Deals                 │
│                                     │
│ ✨ All | 🍔 Eat | 🛶 Play | 🛍️ Shop│ (active)
│                                     │
│                                     │
│      No deals found in this         │
│         category.                   │
│                                     │
│   [View all deals]  (clickable link)│
│                                     │
└─────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────┐
│           All Deals                 │
│                                     │
│ ✨ All | 🍔 Eat | 🛶 Play | 🛍️ Shop│
│                                     │
│                                     │
│        Loading deals...             │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Pass Expired Banner (Top)

```
┌─────────────────────────────────────┐
│ ⚠️  Your pass has expired            │
│ Purchase a new pass to access deals  │
│                      [Get New Pass]  │ (Red button)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│           All Deals                 │
│  ...content below...                │
└─────────────────────────────────────┘
```

## Dark Mode (Same Layout, Different Colors)

**Light Mode**:
- Background: white
- Cards: light gray
- Text: dark gray
- Active pill: blue (#2563eb)

**Dark Mode**:
- Background: dark gray (#1a1a1a)
- Cards: darker gray (#2d2d2d)
- Text: light gray (#e5e5e5)
- Active pill: bright blue (#3b82f6)
- All CSS variables handled by ThemeContext

---

## Key Dimensions

| Element | Size | Notes |
|---------|------|-------|
| CompactDealCard | 160×200px | Fixed width, fixed height |
| Card Image | 160×160px | 1:1 aspect ratio |
| Card Text Box | 160×40px | Name + offer, line-clamped |
| Filter Pill | Auto | `px-4 py-2 rounded-full` |
| Grid Gap | 16px | `gap-4` |
| Container Padding | 16px (mobile), 24px (desktop) | `px-4 sm:px-6` |
| Title | h1, 3xl/4xl | Action primary color |
| Subtitle | p, sm | Text secondary color |

---

## Interactions

### Filter Pill Click
```
1. Click pill (e.g., "🍔 Eat")
2. setSelectedCategory('restaurant')
3. useMemo recalculates filteredDeals
4. Grid re-renders with only restaurant deals
5. Smooth transition (no flash)
```

### Card Click
```
1. Click CompactDealCard
2. DealDetailModal opens internally
3. User sees full deal info + images
4. Click "Redeem" → Confirmation modal
5. Enter PIN → Success modal
```

### Responsive Behavior
```
Mobile (< 768px):
- Pills scroll horizontally
- Grid: 2 columns
- Padding: 16px

Tablet (768px - 1024px):
- Pills display in row
- Grid: 2 columns
- Padding: 24px

Desktop (> 1024px):
- Pills display in row
- Grid: 3 columns
- Padding: 24px
```

---

## Animation Details

| Element | Animation | Duration |
|---------|-----------|----------|
| Filter pill hover | Border color change | 200ms |
| Filter pill active | Scale + shadow | 200ms |
| Card hover | Shadow increase | 200ms |
| Grid transition | Fade in | 300ms |
| Filter transition | No flash, smooth | 0ms (instant) |

---

**This layout balances density with usability, making it easy to scan and filter 12 deals at a glance.**
