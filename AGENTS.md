# AGENTS.md - Coding Guidelines

## Build & Commands
- **Dev**: `npm run dev` (starts Vite dev server)
- **Build**: `npm run build` (runs `tsc && vite build`)
- **Preview**: `npm run preview` (serves dist/ locally)
- No test suite; linting via TypeScript strict mode only

## Architecture
- **Frontend**: React 18 + TypeScript, Vite bundler
- **Styling**: Tailwind CSS with custom color tokens (accent-primary, accent-secondary, etc.)
- **Auth**: Firebase Authentication with Google OAuth
- **Database**: Firestore (Cloud Firestore) for users, passes, redemptions, payments
- **Payment**: Yoco integration for pass purchases
- **Entry point**: `src/main.tsx` (not root `index.tsx`)
- **Key dirs**: `src/components/` (React components), `src/services/` (Firebase/Firestore logic), `src/server/` (validation)

## Code Style & Conventions
- **TypeScript**: Strict mode enabled (`strict: true`, no unused locals/params, no fallthrough cases)
- **Imports**: Use `.tsx`/`.ts` extensions, relative paths
- **Naming**: PascalCase for components/types, camelCase for functions/variables
- **Components**: Functional components with `React.FC<Props>` typing, interfaces for props
- **Styling**: className strings with Tailwind + custom CSS variables, no inline styles
- **Error handling**: Use try/catch, check results before using, return `{success, message}` pattern
- **Async**: Use `async/await`, avoid callback hell
- **Colors**: Use semantic classes from `src/colors.css` (`.btn-primary`, `.btn-redeemed`, `.card`, `.text-accent`) - NEVER hardcode colors. See COLOR_SYSTEM_GUIDE.md for full reference
- **Types**: Centralized in `types.ts`, reuse existing types (PassType: 'holiday'|'annual', Deal, Vendor, User data interfaces)

## Image Storage Strategy

### Where to Store Images
**Primary rule: Store images in Deal, use Vendor images only as fallback**

| Context | Storage | Purpose |
|---------|---------|---------|
| **Deal carousel** | `deal.images[]` | Multiple images for carousel navigation in deal cards (FullDealList, FeaturedDealCard) |
| **Featured deal hero** | `deal.imageUrl` | Main/primary image displayed in featured deal cards |
| **Vendor branding** | `vendor.imageUrl` | Optional vendor logo/branding image (fallback if deal has no image) |
| **Vendor fallback** | `vendor.images[]` | Optional venue photos (fallback if deal has no carousel images) |

### Implementation Details
- **Deal cards use image priority**: `deal.imageUrl` → `vendor.imageUrl` → no image fallback
- **Carousel images**: Use `deal.images[]` array, fallback to `vendor.images[]` if empty
- **In AdminDashboard**: 
  - Vendor section has optional "Logo/Branding Image" + "Branding Images" fields
  - Deal section has "Main Deal Image" (optional) + "Carousel Images" fields
  - Labels and helper text clarify that deal images take priority over vendor images
- **In components**: DealListItem, FeaturedDealCard, and DealCardPreview all follow same priority logic

### Why This Works
- **Decoupling**: Each deal controls its own visuals independently from vendor
- **Flexibility**: Different deals from same vendor can have different images
- **Fallback safety**: Vendor branding provides backup if deal images missing
- **Carousel functionality**: Additional images populate carousel for user navigation

## Color System (Single Source of Truth)
- **Active Theme**: Coastal Holiday Savings - Ocean blues with warm sandy accents and golden highlights
- **Semantic classes**: `src/colors.css` defines `.btn-primary`, `.btn-redeemed`, `.card-featured`, etc.
- **CSS variables**: `src/index.css` defines raw colors with light/dark mode support
- **Light mode**: Sand backgrounds (#F7F5F2), ocean blue actions (#0077B6), coral urgency (#FF8C69), golden value (#FFD166)
- **Dark mode**: Deep navy backgrounds with lighter ocean blue accents and pale golden highlights
- **To change colors globally**: Edit ONE variable in `src/index.css` - changes apply to all components
- **Never**: Use hardcoded hex colors, bracket notation `bg-[#25D366]`, or raw Tailwind colors in components

### **Digital Pass Card (src/components/Pass.tsx) - Separate Brand Colors**
The digital pass card is a distinct branded product and uses its own hardcoded color system (NOT the semantic system):
- **Brand colors defined in `src/index.css`**: `--color-brand-*` variables
  - Light mode: `brand-dark-blue: #0077B6`, `brand-red: #FF8C69`, `brand-yellow: #FFD166`, `brand-white: #FFFFFF`
  - Dark mode: `brand-dark-blue: #00A8E8`, `brand-red: #FF9A84`, `brand-yellow: #FFE88D`, `brand-white: #FFFFFF`
- **To update pass styling**: Edit `src/components/Pass.tsx` and use `brand-*` color classes (not semantic colors)
- **Confetti colors**: Extracted from CSS variables at runtime via `getConfettiColors()` function
- **Gradient background**: Uses CSS variable reference `linear-gradient(135deg, var(--color-brand-dark-blue) 0%, #004A7A 50%, var(--color-brand-dark-blue) 100%)`
- **Note**: VipDashboard pass preview uses semantic colors (action-primary, value-highlight, urgency-high) to match the main theme

## Component Structure
```tsx
// Components are functional components with React.FC typing
// Props are defined in interfaces at the top of the file

interface MyComponentProps {
  title: string;
  onClick: () => void;
  isLoading?: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClick, isLoading }) => {
  // Component logic here
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```
- All components use `React.FC<Props>` typing
- Props defined as `interface ComponentNameProps`
- Use semantic color classes (never hardcode colors)
- Event handlers use arrow functions
- State managed with `useState`
- Side effects with `useEffect`

## Folder Structure
```
src/
├── components/          # React components (.tsx files)
│   ├── Button.tsx      # Reusable UI components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── BaseModal.tsx               # Reusable modal wrapper (backdrop, close, scrolling)
│   ├── FeaturedDealCard.tsx        # Reusable featured deal card (used in 3 places)
│   ├── FreeUserView.tsx            # For unauth users (no pass)
│   ├── SignedInView.tsx            # For signed-in users (no pass yet)
│   ├── SignedInWithPassView.tsx    # For signed-in users with active pass
│   └── ...
├── context/             # React context providers
│   └── AuthContext.tsx  # Auth state + user state ('free' | 'signed-in' | 'signed-in-with-pass')
├── services/            # Firebase/Firestore logic (.ts files)
│   ├── authService.ts   # Firebase Auth functions
│   ├── firestoreService.ts  # Database operations
│   └── ...
├── server/              # Server-side validation (.ts files)
│   └── validation.ts    # Pass validation, redemption logic
├── utils/               # Utility functions (.ts files)
│   ├── formatting.ts    # Text formatting (highlightPrices, formatCurrency, formatDate, etc.)
│   ├── haptics.ts       # Haptic feedback utilities
│   ├── pwaPrompt.ts     # PWA install prompt handling
│   ├── vendorSetup.ts   # Vendor onboarding utilities
│   └── dealSetup.ts     # Deal onboarding utilities
├── pages/               # Page components (.tsx files)
│   ├── HomePage.tsx
│   ├── FeaturedDealsPage.tsx       # Uses FeaturedDealCard
│   ├── AllDealsPage.tsx
│   └── ...
├── main.tsx             # App entry point (wrapped with AuthProvider)
├── App.tsx              # Root React component (uses useAuth() hook)
├── types.ts             # Centralized type definitions
├── colors.css           # Semantic color classes (single source of truth)
├── index.css            # CSS variables for colors and global styles
├── firebase.ts          # Firebase configuration and exports
└── constants.tsx        # App constants (deals, testimonials, etc.)
```
- Place new components in `src/components/`
- Place Firebase logic in `src/services/`
- Place validation/server logic in `src/server/`
- Place utility functions in `src/utils/` (never in components)
- Place context providers in `src/context/`
- Add types to `src/types.ts` (don't create separate type files)

## Reusable Form Input (src/components/FormInput.tsx)

Standardized text input component with consistent styling:

```typescript
interface FormInputProps {
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Used by**: AuthModal, SignUpModal, PurchaseModal
**Benefits**: Removes ~32 lines of repetitive input className boilerplate

---

## Custom Hooks (src/hooks/)

Custom React hooks for common data-fetching patterns with built-in error handling and loading states:

```typescript
// Fetch all deals (used by DealsShowcase, FeaturedDealsPreview, FeaturedDealsPage, FullDealList)
const { deals, isLoading, error } = useAllDeals();

// Fetch single vendor by ID (used by FeaturedDealCard, FullDealList)
const { vendor, isLoading, error } = useVendor(vendorId);

// Fetch redemptions for a pass
const { redemptions, isLoading, error } = useRedemptions(passId);
```

**Benefits**:
- Single source of truth for data fetching logic
- Consistent error handling and loading states across app
- Removed ~80 lines of duplicate useEffect code from components
- Easy to add caching, refetch triggers, or pagination in future
- Components stay focused on rendering, not data management

## Reusable Components

### BaseModal (src/components/BaseModal.tsx)
Generic modal wrapper for consistent styling and behavior:
```tsx
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeButtonPosition?: 'top-right' | 'bottom';
}
```
- **Use for**: AuthModal, PurchaseModal, PinVerificationModal, SignUpModal, SignOutConfirmationModal, RedemptionConfirmationModal, ConsentModal, ActivatePassModal
- **Don't use for**: RedemptionSuccessModal (full-screen green background), OnboardingModal (custom border styling), SwipeableModal (gesture-based)
- **Handles**: backdrop, close button, scrolling, border, padding automatically
- **Example usage**:
```tsx
<BaseModal isOpen={isOpen} onClose={onClose} title="Confirm Action">
  <p>Are you sure?</p>
</BaseModal>
```

### Modal Pattern Guidelines
All modals in the application follow a consistent pattern for visibility and state management:

```tsx
// 1. Define props with required isOpen and onClose
interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Modal-specific props
}

// 2. Use isOpen to control visibility (via BaseModal or custom rendering)
const MyModal: React.FC<MyModalProps> = ({ isOpen, onClose, ...props }) => {
  // State for form data, errors, etc.
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate, process, handle errors
    if (!result.success) {
      setError(result.error);
      return;
    }
    // On success, close modal via parent
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="My Modal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Use FormInput for text/email/password inputs */}
        <FormInput
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          ariaLabel="Value input"
        />
        {error && <p className="text-action-primary text-sm">{error}</p>}
        <Button type="submit" variant="primary" className="w-full">
          Submit
        </Button>
      </form>
    </BaseModal>
  );
};

// 3. In App.tsx, manage modal state with useState
const [isMyModalOpen, setIsMyModalOpen] = useState(false);
// Then use:
<MyModal isOpen={isMyModalOpen} onClose={() => setIsMyModalOpen(false)} />
```

**Key principles**:
- Every modal accepts `isOpen` boolean and `onClose` callback
- Modal controls its own internal state (form data, errors, loading)
- Modal never directly closes itself - always calls `onClose()` for parent to update state
- Use BaseModal wrapper unless modal has custom styling needs (full-screen, gesture-based, etc.)
- Replace all manual form inputs with FormInput component

### FeaturedDealCard (src/components/FeaturedDealCard.tsx)
Reusable card for displaying featured deals with images, savings badges, and action buttons:
```tsx
interface FeaturedDealCardProps {
  deal: Deal;
  index: number;
  hasPass: boolean;
  isRedeemed: boolean;
  onRedeemClick?: (dealName: string) => void;
  cardHeight?: 'h-80' | 'h-96';
}
```
- Used by: DealsShowcase, FeaturedDealsPreview, FeaturedDealsPage
- Handles: vendor loading, maps URL generation, redemption state
- Customizable height via `cardHeight` prop
- Removed ~340 lines of duplicate code across 3 components

### DealsCategoryFilter (src/components/DealsCategoryFilter.tsx)
Reusable header + category filter section for deal listings:
```tsx
interface DealsCategoryFilterProps {
  title: string;
  description: string;
  subtitle?: string;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}
```
- Used by: FullDealList
- Handles: category filter buttons with semantic colors, section titles, descriptions
- Extracted from FullDealList to enable reuse across other listing pages
- Removed ~23 lines of filter/header logic from FullDealList

## Utility Functions

### src/utils/formatting.ts
Common text formatting utilities:

```typescript
// Highlight prices in text with styling
highlightPrices(text: string) // R249 → <span>R249</span> with urgency-high color

// Format number as South African currency
formatCurrency(amount: number) // 249 → "R249.00"

// Truncate text with ellipsis
truncateText(text: string, maxLength: number) // "Hello World" → "Hello..."

// Capitalize first letter
capitalizeFirstLetter(text: string) // "hello" → "Hello"

// Format dates
formatDate(date: Date | string, format: 'short' | 'long')
// new Date() → "Dec 25" or "December 25, 2024"
```
- Used by: FAQ.tsx (highlightPrices), can be used by Pass.tsx, PurchaseModal.tsx, etc.
- Add new formatting functions here, don't duplicate logic in components

### src/utils/validation.ts
Centralized form validation functions used across all modals:

```typescript
// Email validation with regex
validateEmail(email: string) // Returns ValidationError or null

// Required field validation
validateRequired(value: string, fieldName: string) // "Full name is required"

// Password validation with minimum length
validatePassword(password: string, minLength: number = 6)

// Password match validation
validatePasswordMatch(password: string, confirmPassword: string)

// 4-digit PIN validation
validatePin(pin: string)

// Full name validation (min 2 chars)
validateName(name: string)

// Consent checkbox validation
validateConsent(termsCheck: boolean, privacyCheck: boolean, popiaCheck: boolean)

// Multiple validators - returns first error
validateForm(_fields: {}, validators: Array<() => ValidationError | null>)
```
- **Used by**: AuthModal, PurchaseModal, PinVerificationModal, SignUpModal
- **Benefits**: Single source of truth for validation logic, consistent error messages, easy to update validation rules globally
- Removed duplicate validation code from 4+ modals

## Environment Variables
Currently, Firebase configuration is hardcoded in `src/firebase.ts`. For production deployments, consider moving to environment variables:
```typescript
// src/firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```
- Use Vite `import.meta.env.VITE_*` for client-side variables
- Create `.env.local` in root (gitignored) with `VITE_*` prefixed variables
- For Netlify deployment, set variables in Netlify UI → Site Settings → Build & Deploy → Environment
- Never commit `.env.local` or hardcode secrets in source code

## Firebase/Firestore Patterns
All Firebase operations follow a consistent pattern with error handling:

**Services return `{success: boolean, message?: string}`:**
```typescript
export const createPass = async (pass: PassDocument) => {
  try {
    await setDoc(doc(db, 'passes', pass.passId), {
      ...pass,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error creating pass:', error);
    return { success: false, error: error.message };
  }
};
```

**Usage in components:**
```typescript
const result = await createPass(passData);
if (!result.success) {
  setError(result.error || 'Unknown error');
  return;
}
// Continue with success logic
```

**Common operations:**
- **Create**: `setDoc(doc(db, 'collection', 'id'), data)`
- **Read**: `getDoc(doc(db, 'collection', 'id'))`
- **Query**: `query(collection(db, 'collection'), where('field', '==', value))`
- **Update**: `updateDoc(doc(db, 'collection', 'id'), updates)`
- **Delete**: `deleteDoc(doc(db, 'collection', 'id'))`
- **Add**: `addDoc(collection(db, 'collection'), data)` (auto-generates ID)

**Type safety with database documents:**
```typescript
// Define document interface in types.ts or firestoreService.ts
interface PassDocument {
  passId: string;
  passHolderName: string;
  email: string;
  passType: PassType;
  passStatus: PassStatus;
  expiryDate: string;
  createdAt: string;
  userId: string;
}

// Cast documents to type when retrieving
const pass = docSnap.data() as PassDocument;
```

## Testing & Type Checking
- **No test suite**: Linting and type checking handled by TypeScript strict mode
- **Build verification**: `npm run build` runs `tsc && vite build && tsc --project tsconfig.netlify.json`
  - First `tsc`: type checks source code
  - `vite build`: bundles for production
  - Second `tsc`: type checks Netlify Functions
- **Dev mode**: `npm run dev` provides instant feedback on type errors
- **Strict mode enforced**:
  - `strict: true` in `tsconfig.json`
  - No unused locals or parameters
  - No implicit `any` types
  - No fallthrough switch cases
- To verify code quality, run: `npm run build` - if it passes, code is production-ready

## Recent Refactoring (December 2024 - Complete)

### Major Accomplishments

**All 12 modals refactored to unified `isOpen` prop pattern:**
- ✅ AuthModal (364 → 340 lines, -6.6%)
- ✅ SignUpModal (106 → 104 lines)
- ✅ PurchaseModal (153 → 152 lines)
- ✅ ConsentModal (added isOpen prop)
- ✅ RedemptionConfirmationModal (119 → 62 lines, -47%)
- ✅ RedemptionSuccessModal (added isOpen prop, maintains custom full-screen styling)
- ✅ ActivatePassModal (extracted from App.tsx into separate component - 93 lines)
- ✅ SignOutConfirmationModal (56 → 43 lines)
- ✅ PinVerificationModal (161 → 149 lines)
- ✅ OnboardingModal (added isOpen prop)
- ✅ BaseModal (reusable wrapper component)
- ✅ SwipeableModal (already had isOpen pattern)

**Reusable components created:**
- ✅ **BaseModal** - Wrapper for 8+ modals (AuthModal, PurchaseModal, PinVerificationModal, SignOutConfirmationModal, ActivatePassModal, RedemptionConfirmationModal, etc.)
- ✅ **FormInput** - Standardized text input component (removed ~32 lines of input boilerplate across 3 modals)
- ✅ **FeaturedDealCard** - Removed ~340 lines of duplicate card rendering
- ✅ **Custom Hooks** - useAllDeals, useVendor, useRedemptions (removed ~80 lines of duplicate data-fetching)

**Build verification:**
✅ `npm run build` passes with 276 modules, 0 errors
✅ Final bundle size: 203.59 kB (reduced from 206.24 kB, -2.65 kB saved)
✅ All type checking passes (strict mode)
✅ No breaking changes to existing functionality

## User Flows & Key Features

### Three User States Architecture
The app uses a context-based system for managing three distinct user states with different UIs and restrictions:

#### **State 1: Free User (Not Signed In)**
- **Triggered when**: `userState === 'free'`
- **Rendered component**: `<FreeUserView />` 
- **What they see**:
  - Hero section with social proof
  - 2-3 sample deals (teaser)
  - Testimonials
  - "Sign In to Browse Deals" CTA
  - Full pricing options
- **Restrictions**: Cannot view full deal list, cannot redeem
- **Goal**: Convert to sign-up
- **Key file**: `src/components/FreeUserView.tsx`

#### **State 2: Signed In (No Pass)**
- **Triggered when**: `userState === 'signed-in'`
- **Rendered component**: `<SignedInView />`
- **What they see**:
  - "Browse All Deals" hero section
  - Full deal list (no blur)
  - Prominent "Get Holiday Pass" button (sticky/floating)
  - User profile menu in header
- **Restrictions**: Can view deals but cannot redeem (buttons show "Get Pass to Redeem")
- **Goal**: Convert to pass purchase
- **Key file**: `src/components/SignedInView.tsx`

#### **State 3: Signed In with Active Pass**
- **Triggered when**: `userState === 'signed-in-with-pass'`
- **Rendered component**: `<SignedInWithPassView />`
- **What they see**:
  - VipDashboard (personalized welcome + pass preview)
  - Full deal list with active "Redeem" buttons
  - Redemption history
  - Pass expiry countdown badge
  - All redemption functionality enabled
- **Restrictions**: None - full feature access
- **Goal**: Drive engagement & redemptions
- **Key file**: `src/components/SignedInWithPassView.tsx`

**Implementation**:
- All auth state management in `src/context/AuthContext.tsx`
- Import via `const { user, userState, pass, isLoading } = useAuth()`
- No local state needed - AuthContext handles all auth/pass tracking
- Auth context wrapped in `src/main.tsx` before ThemeProvider

### Redemption Flow (Critical for Launch)
The redemption flow is designed for seamless partner integration with vendor PIN verification:

1. **User browses deals** - See deals in DealsShowcase or FullDealList (filtered by location)
2. **Clicks "Redeem"** - Opens RedemptionConfirmationModal
3. **Confirms redemption** - Shows "Are you sure?" confirmation
4. **PIN verification** - PinVerificationModal appears asking staff for their 4-digit PIN
   - Staff enters 4-digit PIN (manually given to each vendor)
   - PIN validated against vendor in Firestore
   - Prevents accidental/fraudulent redemptions
5. **Success screen appears** - Full-screen green RedemptionSuccessModal
   - Shows venue name and location prominently
   - Displays deal being redeemed
   - Live timestamp for staff verification
   - Clear "Show this screen to staff" instruction
   - Auto-closes after 10 seconds
6. **Deal marked as redeemed** - Saved to Firestore with vendorId, button changes to green checkmark

**Key files:**
- `src/components/RedemptionConfirmationModal.tsx` - User confirmation step
- `src/components/PinVerificationModal.tsx` - Vendor PIN verification (NEW)
- `src/components/RedemptionSuccessModal.tsx` - Staff-facing success screen
- `src/App.tsx` - Handles redemption state and Firestore integration

**Vendor Setup:**
- Use `src/utils/vendorSetup.ts` to onboard vendors
- Edit `VENDOR_ONBOARDING_TEMPLATE()` with your 3 vendor details
- Call `onboardVendors()` to bulk-create in Firestore
- Each vendor needs: name, email, phone, location (city), 4-digit PIN, category

### First-Time User Onboarding
New users see onboarding after their first pass purchase:

1. **User purchases pass** - Payment completes, pass created
2. **Digital pass appears** - Full-screen Pass.tsx with confetti
3. **User taps pass card** - Triggers onboarding
4. **OnboardingModal shows** - 4-step guide:
   - Visit partner venue
   - Tap "Redeem" on deal
   - Show green screen to staff
   - Enjoy savings
5. **Scrolls to deals** - User can start redeeming immediately

**Key file:** `src/components/OnboardingModal.tsx`

### Admin Dashboard
Simple web UI to add vendors and deals without Firebase Console or code changes:
- **Component:** `src/components/AdminDashboard.tsx`
- **Access:** Add `?admin=true` to URL and sign in with your admin email (configured in VITE_ADMIN_EMAIL)
- **Features:**
  - Create vendors with name, email, phone, 4-digit PIN, category, city, address
  - Create deals linked to vendors with offer, savings amount, category, city, terms
  - Live vendor/deal lists showing all records
  - Form validation and error handling
  - Automatic Firestore sync
- **Usage:** `https://yoursite.com/?admin=true`
- **Note:** Change email address in `App.tsx` to your own admin email for security

### WhatsApp Support Integration
Always-visible floating WhatsApp button for instant support:
- **Component:** `src/components/WhatsAppButton.tsx`
- **Phone number:** 065 806 2198 (hardcoded in component)
- **Renders in:** `src/App.tsx` (global, always visible)
- **Styling:** Fixed bottom-right, green WhatsApp brand color

### Public Assets & Logos
Logo files for light and dark mode:
- **Light mode**: Use `logo-light.png` from `/public` directory
- **Dark mode**: Use `logo-dark.png` from `/public` directory
- **App icon**: Use `HOLIDAY PASS APP ICON.SVG` from `/public` directory for installable app icon
- Always respect the user's OS/browser dark mode preference when selecting logos

### Deal Terms System
Deals can now display restrictions and terms:

**Type definition:**
```typescript
// In src/types.ts
export interface Deal {
  name: string;
  offer: string;
  gmapsQuery?: string;
  terms?: string; // Optional terms/restrictions
}
```

**Usage in constants.tsx:**
```typescript
{ 
  name: "The Wharf Street Brew Pub", 
  offer: "2-for-1 on all Main Meals (Save R150+)",
  gmapsQuery: "The Wharf Street Brew Pub, Port Alfred",
  terms: "Valid Mon-Thu. Excludes Dec 25-26. Dine-in only."
}
```

**Display locations:**
- `src/components/FullDealList.tsx` - Shows terms in italic below description
- `src/components/DealsShowcase.tsx` - Shows terms in italic below savings amount

## Pre-Launch Checklist

### Critical Path (Must Complete Before Launch)
- [ ] Test redemption flow end-to-end (confirmation → success screen)
- [ ] Verify WhatsApp button appears and works (065 806 2198)
- [ ] Add terms to relevant deals in `src/constants.tsx`
- [ ] Test all Google Maps links work correctly
- [ ] Test offline mode (PWA functionality per PWA_IMPLEMENTATION.md)
- [ ] Verify onboarding shows for first-time users
- [ ] Test on 3+ different mobile devices
- [ ] Run `npm run build` to verify production readiness

### Partner Materials Needed
- [ ] Create 30-second demo video showing redemption flow
- [ ] Create partner one-pager PDF explaining how redemptions work
- [ ] Create "We Accept Holiday Pass" QR code printout
- [ ] Create staff training card (how to verify redemptions)

### Launch Week Setup
- [ ] Verify Firebase/Firestore production credentials
- [ ] Set up monitoring for redemption errors
- [ ] Prepare support response templates
- [ ] Test payment flow (Yoco integration)
- [ ] Verify email notifications work

## Partner Integration Notes

### For Venue Staff
Redemptions are verified by:
1. **Green success screen** - Full-screen confirmation after user redeems
2. **Venue name** - Shows which venue the deal is for
3. **Timestamp** - Live clock showing exact redemption time
4. **Deal description** - What was redeemed

### Common Partner Questions
**Q: How do we know it's legitimate?**
A: Green success screen + live timestamp + pass holder name. Screen auto-closes after 10s to prevent screenshots.

**Q: What if customer has issues?**
A: WhatsApp support button (065 806 2198) is always visible - they can get help immediately.

**Q: Can deals be used multiple times?**
A: No - each deal can only be redeemed once per venue. Button changes to green checkmark after redemption.

## FAQ - Using the Pass with PIN Verification

### Customer/Pass Holder Questions

**Q: What is the PIN and why do I need it?**
A: The PIN is a 4-digit security code provided to venue staff. It prevents accidental or fraudulent redemptions by requiring staff to verify the transaction at the venue.

**Q: How do I redeem a deal with the PIN system?**
A: 
1. Browse deals in the app
2. Click the "Redeem" button on a deal
3. Confirm you want to redeem in the popup
4. Show your phone to the venue staff
5. Staff enters their 4-digit PIN into the app
6. A green success screen appears confirming the redemption
7. Show this green screen to the staff member as final confirmation

**Q: What if the staff enters the wrong PIN?**
A: The redemption will fail and you can try again. Only the correct PIN for that specific venue will complete the redemption.

**Q: How long does the green success screen last?**
A: The green screen auto-closes after 10 seconds. But you can keep it open longer by tapping the screen if needed for staff verification.

**Q: Can I redeem a deal without the staff PIN?**
A: No. The PIN verification step is required to complete every redemption. This protects both you and the venue.

**Q: What if I already redeemed a deal at a venue?**
A: The button will show a green checkmark instead of "Redeem". Each deal can only be redeemed once per venue.

**Q: What if there's an error during redemption?**
A: Contact WhatsApp support at 065 806 2198. They can help troubleshoot or manually verify your redemption if needed.

### Venue Staff Questions

**Q: What is the staff PIN and where do I find it?**
A: You receive a unique 4-digit PIN when your venue is set up. This PIN is provided via email or by the Holiday Pass team. Keep it confidential and don't share with customers.

**Q: How do I verify a redemption?**
A:
1. Customer shows you their phone with the "Redeem" button visible
2. They confirm they want to redeem the deal
3. Hand the phone back or let them hold it
4. Enter your venue's 4-digit PIN into the PinVerificationModal that appears
5. If correct, the green success screen appears immediately
6. The screen shows the venue name, deal, and timestamp
7. This is your receipt that the deal was redeemed

**Q: What if I enter the wrong PIN?**
A: The redemption fails. You can try again. Make sure you're entering your venue's correct PIN (not a customer's).

**Q: Why do we need this PIN system?**
A: The PIN ensures that:
- Only legitimate staff can verify redemptions
- Customers can't redeem deals without visiting the venue
- You have a timestamped record of every redemption
- Fraudulent redemptions are prevented

**Q: Can I give my PIN to a customer?**
A: No. The PIN should never be shared. It's for staff verification only. If a customer asks for it, contact support at 065 806 2198.

**Q: What if a customer claims the PIN didn't work?**
A: Check that you entered the correct 4-digit PIN for your venue. If you're sure it's correct and it still fails, contact support. There may be a technical issue that needs investigation.

**Q: How long do I have to enter the PIN?**
A: There's no time limit on the PIN entry modal. Take your time to enter it carefully. If the customer leaves or you need to cancel, just close the modal.

## Development Notes

### Recent Updates (December 2024)
- **Created FormInput reusable component** - Removed ~32 lines of input className boilerplate from AuthModal, SignUpModal, PurchaseModal
- **Migrated AuthModal to BaseModal** - Refactored from 364 lines to 340 lines (24 line reduction - 6.6%), uses FormInput component
- **Migrated SignUpModal & PurchaseModal to BaseModal** - Added isOpen prop pattern for consistency across modals
- **Migrated 3 more modals to BaseModal** - SignOutConfirmationModal (56→43 lines), PinVerificationModal (161→149 lines), OnboardingModal (added isOpen prop)
- **Converted RedemptionConfirmationModal to BaseModal** - Refactored from 119 lines to 62 lines, uses BaseModal wrapper for consistent styling
- **Extracted Firestore query hooks** - Created useAllDeals, useVendor, useRedemptions hooks (removed ~80 lines of duplicate data-fetching code)
- **BaseModal component wrapper** - Reusable modal with configurable max-width, close button position, and built-in scrolling
- **FeaturedDealCard extraction** - Removed ~340 lines of duplicate deal card rendering from DealsShowcase, FeaturedDealsPreview, FeaturedDealsPage
- **DealsCategoryFilter extraction** - Created reusable filter header component, removed ~23 lines from FullDealList
- **Form validation utilities** - Created src/utils/validation.ts with 8 reusable validators (email, password, name, PIN, consent, etc.), removed duplicate validation code from AuthModal, PurchaseModal, PinVerificationModal
- **Dynamic pricing support for SavingsProgressBar** - Added `purchasePrice` field to PassDocument and PassInfo to support launch pricing (R99, R199, R499). Progress bar now calculates breakeven based on actual price paid, with sensible fallbacks. Yoco webhook saves purchasePrice when creating passes.
- Added RedemptionSuccessModal for staff verification
- Added OnboardingModal for first-time user guidance
- Integrated WhatsApp support button globally
- Added optional `terms` field to Deal type
- Removed pass sharing features (no longer supported)
- Improved visual hierarchy in deal listings (savings badges, category pills)
- **Fixed profile tab layout shift** - Standardized mobile bottom padding (`pb-24 sm:pb-0`) across all tab pages to prevent visual jank when switching tabs
- **Redesigned ProfilePage** - Enhanced with gradient header, better section organization, account status indicator, support links, and improved typography
- **Desktop welcome section** - Use `text-left md:text-center` for FreeUserView welcome section to left-align on desktop while maintaining mobile centering

### Modal Architecture - Unified isOpen Pattern (December 2024)
All 12 modals now follow a consistent `isOpen` prop pattern:
- **AuthModal** - Sign in/create account forms
- **SignUpModal** - Post-purchase pass holder name collection
- **PurchaseModal** - Yoco payment form
- **ConsentModal** - Google OAuth legal consent
- **RedemptionConfirmationModal** - Deal redemption confirmation
- **RedemptionSuccessModal** - Full-screen green success screen (custom)
- **ActivatePassModal** - Activate existing digital pass
- **SignOutConfirmationModal** - Confirm sign-out action
- **PinVerificationModal** - Vendor PIN entry for redemptions
- **OnboardingModal** - First-time user guide
- **BaseModal** - Reusable wrapper component
- **SwipeableModal** - Helper for swipe-to-close gestures

**Benefits of unified pattern:**
- Consistent visibility control via `isOpen` boolean
- Easier testing and conditional rendering
- Reduced App.tsx component nesting
- Single source of truth for modal open/close state

### Post-Deploy Fixes (Post-Launch)
- **Fixed savings badge text color** - Changed from light `text-primary` to dark `text-gray-900` for better readability on gold background in DealsShowcase and FeaturedDealsPreview
- **Fixed app icon caching** - Added query params (`?v=2`) to manifest.json and index.html icon references to force browser cache invalidation. Updated favicon links in index.html
- **Added PWA install prompt** - Created `src/utils/pwaPrompt.ts` utility to manage beforeinstallprompt event, added install app button to Header mobile menu that triggers install prompt on first load
- **Fixed modal scrollability on mobile** - Added `overflow-y-auto` to backdrop containers and `max-h-[calc(100vh-100px)]` to modal cards in:
  - PurchaseModal
  - AuthModal
  - SignUpModal
  - RedemptionConfirmationModal
  - PaymentFailure
  - PaymentSuccess
  - PaymentCancel
  - SignOutConfirmationModal
  - ActivatePassModal
  - Added `my-8` margin to modal cards to ensure scrolling content doesn't hide behind close button
- **Fixed haptic feedback on scroll** - Removed automatic haptic vibrations from `useSwipeGesture` hook. Swipes no longer trigger haptics by default. Haptics now only trigger on explicit button clicks (tap actions). Modified `useSwipeGesture` to remove haptics calls and updated Header to not call haptics on swipe-down menu close.
- **Fixed PWA install prompt reappearance** - Fixed `pwaPrompt.ts` to reset `promptShown` flag after user responds to install prompt, allowing prompt to be shown again if user dismisses it. Also updated Header to re-check prompt availability when menu opens/closes.

### State Update & Re-render Debugging Pattern
**Issue**: DealsShowcase component fetching vendor data correctly but not triggering re-render after `setDeals()` and `setIsLoading()` state updates.

**Root cause**: Unknown - state values were being updated (logged correctly in effects) but component wasn't re-rendering with new state.

**Debugging approach**:
1. Add logging at component render level: `console.log('ComponentName render - stateVar:', stateVar);`
2. Add logging in useEffect after state updates: `console.log('State updated'); setDeals(...);`
3. Check if render logs appear AFTER state update logs - if state logs appear but no render logs follow, state update isn't triggering re-render
4. Check component visibility on page - verify it's actually rendering (not off-screen or hidden)
5. If component shows some data but not all (e.g., "Redeemed" button appears but not directions button), component IS rendering but conditional rendering logic may be wrong

**If this happens again**:
- Check if component is wrapped in React.memo or has stale dependencies
- Verify state setters aren't inside conditional blocks
- Check if useEffect has correct dependency array
- Try adding key prop or forcing re-render
- Last resort: convert state to Context if parent component needs to manage child state

### Featured Deals Consolidation (Complete)
**Status**: ✅ All featured deals now use the reusable `FeaturedDealCard` component.

| Component | Location | Used By |
|-----------|----------|---------|
| `FeaturedDealCard.tsx` | `src/components/` | DealsShowcase, FeaturedDealsPreview, FeaturedDealsPage |

**Refactoring complete**:
- Single source of truth for featured deal card styling and behavior
- Removed ~340 lines of duplicate card rendering code
- Customizable `cardHeight` prop (h-80 | h-96) for different contexts
- Handles vendor loading, maps URL generation, and redemption state internally

### Known Limitations
- No analytics dashboard yet (planned post-launch)
- No partner portal (manual management for now)
- Redemption reports sent manually (no automated emails yet)

## Next Refactoring Opportunities

### In Progress
*(None - refactoring complete as of December 2024)*

### High Priority (Next)
1. ~~**Consolidate deal lists**~~ - Extracted DealsCategoryFilter header component (Dec 2024)
2. ~~**Form validation patterns**~~ - Created src/utils/validation.ts with 8 reusable validators (Dec 2024)
3. **Remaining opportunities**: See Medium/Low Priority section below

### Medium Priority
4. **Redux/Context cleanup**: Review if state management can be simplified
5. **Service consolidation**: Consider if authService, firestoreService can be split further
6. **Redemption flow hooks**: Extract validation/redemption steps into custom hooks

### Low Priority
7. **Analytics integration**: Add event tracking for user flows
8. **Component storybook**: Create Storybook for component documentation
9. **E2E testing**: Add Playwright tests for critical flows (auth, redemption, payment)

### Next Planned Features (Post-Launch)
- Partner analytics dashboard
- Automated weekly redemption reports
- Push notifications for new deals
- User reviews/ratings system
- Performance monitoring and error tracking
