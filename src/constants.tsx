import { AnchorDeal, DealCategory, Testimonial, FAQItem } from './types.ts';

// --- ANCHOR DEALS ---
// These are now loaded from Firestore via `featured: true` flag.
// See AdminDashboard to mark deals as featured.
// This array is kept empty to represent a clean slate during initial setup.
export const ANCHOR_DEALS: AnchorDeal[] = [];


// --- ALL DEALS BY CATEGORY ---
// All deals are now loaded from Firestore. This array is empty to represent a clean slate.
// Use AdminDashboard (?admin=true) to add deals dynamically.
export const DEAL_CATEGORIES: DealCategory[] = [];

// --- TESTIMONIALS ---
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The Holiday Pass is a game-changer! We explored more of Port Alfred in two weeks than we have in years. Perfect for our summer holiday.",
    author: "Naledi Sibanda",
    imageUrl: "/Images/user1.svg",
  },
  {
    quote: "The Holiday pass paid for itself on the first day! We saved so much on food and activities. An absolute must-have for any Port Alfred holiday.",
    author: "The van der Merwe Family",
    imageUrl: "/Images/user1.svg",
  },
  {
    quote: "We discovered so many hidden gems we would have otherwise missed. It was like having a local guide in our pocket. Highly recommended!",
    author: "John & Sarah, UK",
    imageUrl: "/Images/user1.svg",
  },
];

// --- FAQs ---
// These are static templates - actual values will be dynamically inserted in FAQ component
export const FAQS: FAQItem[] = [
  {
    question: "How does the pass work?",
    answer: "It's simple! After purchasing, you'll receive a digital pass on your phone. Browse deals, click 'Redeem' on any deal you like, and confirm your redemption. The venue staff will enter a 4-digit PIN to verify, and a green success screen will appear. Show this to the staff member to complete your savings!",
  },
  {
    question: "Is the pass really worth the price?",
    answer: "Yes! The pass typically pays for itself with just 2-3 uses.<br><br>Most deals offer R20-100 in savings. Use it at a restaurant for dinner and an activity once, and you've already saved more than the pass cost. Every additional deal you use is pure savings!",
  },
  {
    question: "What's the current price and when can I use my pass?",
    answer: "Your Holiday Pass is valid from December 1st through January 31st, covering the entire festive season and summer holiday period. Make the most of your Port Alfred visit!",
  },
  {
    question: "Can I share my pass with family?",
    answer: "Each pass is tied to one user account and cannot be shared. However, family members can purchase their own passes at the same great price! It's perfect for couples, families, or groups who want to explore together.",
  },
  {
    question: "What if I lose access to my pass?",
    answer: "Your pass is securely linked to your email. Simply sign back in with your email and password to restore access. All your redeemed deals and pass information will be right where you left it.",
  },
  {
    question: "How many times can I use a deal?",
    answer: "You can use each deal once per venue. With {{VENUE_COUNT}}+ partner venues across restaurants, activities, and shopping, there are plenty of savings to go around during the holiday season!",
  },
  {
    question: "Do I need internet to use deals?",
    answer: "Yes, you'll need an internet connection to browse deals, view your pass, and redeem them. The app requires online access to fetch current deals and verify redemptions with venues. Most venues have WiFi available, but we recommend checking deals before you visit. Installing the app only improves loading speed, not offline functionality.",
  },
  {
    question: "Is there a physical card?",
    answer: "No, the Port Alfred Holiday Pass is fully digital and lives on your phone. This makes it instantly accessible, environmentally friendly, and impossible to lose (as long as you can sign back in!).",
  },
];
