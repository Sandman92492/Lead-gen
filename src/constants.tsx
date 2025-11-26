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
export const FAQS: FAQItem[] = [
  {
    question: "How does the pass work?",
    answer: "It's simple! After purchasing, you'll receive a digital pass on your phone. Browse deals, click 'Redeem' on any deal you like, and confirm your redemption. The venue staff will enter a 4-digit PIN to verify, and a green success screen will appear. Show this to the staff member to complete your savings!",
  },
  {
    question: "How much does the pass cost?",
    answer: "The Holiday Pass is R199 and gives you access to exclusive deals from December 1st to January 31st. It's the perfect companion for your summer holiday or festive season getaway!",
  },
   {
    question: "When can I use my pass?",
    answer: "Your Holiday Pass is valid from December 1st through January 31st, covering the entire festive season and summer holiday period. Make the most of your Port Alfred visit!",
   },

   {
    question: "How many times can I use a deal?",
    answer: "You can use each deal once per venue. With dozens of partners, there are plenty of savings to go around during the holiday season!",
   },
   {
     question: "Is there a physical card?",
     answer: "No, the Port Alfred Holiday Pass is fully digital and lives on your phone. This makes it easy to access and environmentally friendly.",
   },
   ];
