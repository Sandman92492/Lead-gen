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
    quote: "Raffle Tickets made it simple to support our school fundraiser. Entering took seconds.",
    author: "Naledi S.",
    imageUrl: "/Images/user1.svg",
  },
  {
    quote: "We loved how easy it was to enter raffles and track our entries in one place.",
    author: "The van der Merwe Family",
    imageUrl: "/Images/user1.svg",
  },
  {
    quote: "A great way to support local fundraisers with a clear, verified entry flow.",
    author: "John & Sarah",
    imageUrl: "/Images/user1.svg",
  },
];

// --- FAQs ---
// These are static templates - actual values will be dynamically inserted in FAQ component
export const FAQS: FAQItem[] = [
  {
    question: "How does the ticket pack work?",
    answer: "It's simple! After purchasing, you'll receive a digital ticket pack on your phone. Browse raffles, tap 'Enter' on any raffle you like, and confirm your entry. A school/fundraiser staff member will enter a 4-digit PIN to verify, and a green success screen will appear. Show this to confirm your entry.",
  },
  {
    question: "Is the ticket pack worth the price?",
    answer: "Your purchase supports schools/fundraisers and gives you entries into raffles. Each raffle lists its prize details, and you can track your entries in the app.",
  },
  {
    question: "What's the current price and when can I use my ticket pack?",
    answer: "You can use your ticket pack immediately after purchase. It's valid until the expiry date shown in your ticket pack.",
  },
  {
    question: "Can I share my ticket pack with family?",
    answer: "Each ticket pack is tied to one user account and can't be shared. Family members can purchase their own ticket packs if they'd like to enter too.",
  },
  {
    question: "What if I lose access to my ticket pack?",
    answer: "Your ticket pack is securely linked to your email. Simply sign back in with your email and password to restore access. Your entries and ticket pack info will be right where you left it.",
  },
  {
    question: "How many times can I enter a raffle?",
    answer: "You can enter each raffle once per ticket pack. With {{VENUE_COUNT}}+ schools/fundraisers, there are plenty of raffles to explore.",
  },
  {
    question: "Do I need internet to enter raffles?",
    answer: "Yes, you'll need an internet connection to browse raffles, view your ticket pack, and record entries. The app requires online access to fetch current raffles and verify entries with schools/fundraisers. Installing the app only improves loading speed, not offline functionality.",
  },
  {
    question: "Is there a physical card?",
    answer: "No, your ticket pack is fully digital and lives on your phone. This makes it instantly accessible and easy to manage (as long as you can sign back in!).",
  },
];
