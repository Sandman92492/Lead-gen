import { AnchorDeal, DealCategory, Testimonial, FAQItem, Deal } from './types.ts';

// --- ANCHOR DEALS ---
// These are the "hero" deals shown prominently. They are also included in the full list.

export const ANCHOR_DEALS = [
  {
    name: 'The Wharf Street Brew Pub',
    offer: '2-for-1 on all Main Meals (Save R150+)',
    gmapsQuery: 'The Wharf Street Brew Pub, Port Alfred',
    imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/35/96/34/front-door.jpg?w=900&h=500&s=1',
    terms: 'Valid Mon-Thu. Excludes Dec 25-26. Dine-in only.',
  },
  {
    name: 'Kowie River Cruises',
    offer: 'R100 off per person on the Sunset Cruise (Save R400 for a family of 4)',
    gmapsQuery: 'Kowie River Cruises, Port Alfred',
    imageUrl: 'https://portalfred.co.za/wp-content/uploads/2021/10/50327615_2220668454631377_8970490873636716544_n.jpg',
    terms: 'Sunset cruise only. Minimum 2 people.',
  },
  {
    name: 'Royal Port Alfred Golf Course',
    offer: 'One FREE round of golf when you buy one (Save R350+)',
    gmapsQuery: 'Royal Port Alfred Golf Course',
    imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG30by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    terms: 'Valid weekdays only. Subject to availability.',
  },
] as AnchorDeal[];


// --- ALL DEALS BY CATEGORY ---
const restaurantDeals: Deal[] = [
  { name: "The Wharf Street Brew Pub", offer: "2-for-1 on all Main Meals (Save R150+)", gmapsQuery: "The Wharf Street Brew Pub, Port Alfred", terms: "Valid Mon-Thu. Excludes Dec 25-26. Dine-in only.", savings: 150 },
  { name: "Guido's Port Alfred", offer: "Free garlic bread with any large pizza purchase.", gmapsQuery: "Guidos Port Alfred", terms: "Valid with any large pizza. One per table.", savings: 45 },
  { name: "Graze by the River", offer: "Complimentary glass of house wine with any main meal.", gmapsQuery: "Graze by the River Port Alfred", terms: "House wine only. Valid Mon-Fri evenings.", savings: 75 },
  { name: "The Highlander Pub", offer: "Buy one get one free on selected draught beers.", gmapsQuery: "The Highlander Pub Port Alfred", terms: "Selected draughts only. Valid during happy hour.", savings: 60 },
  { name: "Ocean Basket", offer: "Free dessert with any main meal.", gmapsQuery: "Ocean Basket Port Alfred", terms: "One dessert per main meal purchased.", savings: 80 },
];

const activityDeals: Deal[] = [
  { name: "Kowie River Cruises", offer: "R100 off per person on the Sunset Cruise (Save R400 for a family of 4)", gmapsQuery: "Kowie River Cruises, Port Alfred", terms: "Sunset cruise only. Minimum 2 people.", savings: 400 },
  { name: "Royal Port Alfred Golf Course", offer: "One FREE round of golf when you buy one (Save R350+)", gmapsQuery: "Royal Port Alfred Golf Course", terms: "Valid weekdays only. Subject to availability.", savings: 350 },
  { name: "Outdoor Focus", offer: "15% off kayak rentals.", gmapsQuery: "Outdoor Focus Port Alfred", terms: "Valid for 2-hour rentals and longer. Excludes peak season.", savings: 100 },
  { name: "The Kowie Museum", offer: "Two adult tickets for the price of one.", gmapsQuery: "The Kowie Museum Port Alfred", terms: "Adult tickets only. Valid Mon-Fri.", savings: 120 },
  { name: "Fish River Horse Trails", offer: "R50 off per person for a beach ride.", gmapsQuery: "Fish River Horse Trails", terms: "Beach ride only. Minimum 2 riders. Weather dependent.", savings: 100 },
];

const shoppingDeals: Deal[] = [
  { name: "Corals", offer: "Free gift with any purchase over R300.", gmapsQuery: "Corals Port Alfred", terms: "One gift per purchase over R300. While stocks last.", savings: 80 },
  { name: "The Courtyard", offer: "10% off all home decor items.", gmapsQuery: "The Courtyard Port Alfred", terms: "Excludes sale items. Valid in-store only.", savings: 150 },
  { name: "Wave Action", offer: "20% off all branded apparel.", gmapsQuery: "Wave Action Port Alfred", terms: "Branded items only. Cannot be combined with other offers.", savings: 180 },
];

export const DEAL_CATEGORIES: DealCategory[] = [
  {
    category: 'Restaurants',
    deals: restaurantDeals,
  },
  {
    category: 'Activities',
    deals: activityDeals,
  },
  {
    category: 'Shopping',
    deals: shoppingDeals,
  },
];

// --- TESTIMONIALS ---
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "\"The Holiday Pass is a game-changer! We explored more of Port Alfred in two weeks than we have in years. Perfect for our summer holiday.\"",
    author: 'Naledi Sibanda',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    quote: "\"The Holiday pass paid for itself on the first day! We saved so much on food and activities. An absolute must-have for any Port Alfred holiday.\"",
    author: 'The van der Merwe Family',
    imageUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=150&h=150&fit=crop&crop=face',
  },
  {
    quote: "\"We discovered so many hidden gems we would have otherwise missed. It was like having a local guide in our pocket. Highly recommended!\"",
    author: 'John & Sarah, UK',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
];

// --- FAQ ITEMS ---
export const FAQ_ITEMS: FAQItem[] = [
{
question: 'How does the pass work?',
answer: "It's simple! After purchasing, you'll receive a digital pass on your phone. Just show this pass at any of our partner venues to get your exclusive discount instantly. No fuss, no coupons.",
},
{
question: 'How much does the pass cost?',
answer: 'The Holiday Pass is R199 and gives you access to exclusive deals from December 1st to January 31st. It\'s the perfect companion for your summer holiday or festive season getaway!',
},
{
question: "When can I use my pass?",
answer: 'Your Holiday Pass is valid from December 1st through January 31st, covering the entire festive season and summer holiday period. Make the most of your Port Alfred visit!',
},
{
question: 'How many times can I use a deal?',
answer: 'You can use each deal once per venue. With dozens of partners, there are plenty of savings to go around during the holiday season!',
},
{
question: 'Is there a physical card?',
answer: 'No, the Port Alfred Holiday Pass is fully digital and lives on your phone. This makes it easy to access and environmentally friendly.',
},
];
