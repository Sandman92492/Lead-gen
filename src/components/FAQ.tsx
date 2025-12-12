import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FAQS } from '../constants.tsx';
import { highlightPrices } from '../utils/formatting';
import { useAllDeals } from '../hooks/useAllDeals';

interface FaqHeaderRef {
  [key: number]: HTMLButtonElement | null;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqHeaderRefs = useRef<FaqHeaderRef>({});
  const prevIndexRef = useRef<number | null>(0);

  const { deals: allDeals = [] } = useAllDeals();
  const venueCount = useMemo(() => {
    const vendorIds = new Set(allDeals.map((deal) => deal.vendorId).filter(Boolean));
    return vendorIds.size;
  }, [allDeals]);

  useEffect(() => {
    // Only scroll if we're opening a NEW item (not just closing)
    if (openIndex !== null && openIndex !== prevIndexRef.current) {
      // Scroll the card to the top after expansion animation completes
      setTimeout(() => {
        const headerButton = faqHeaderRefs.current[openIndex];
        if (headerButton) {
          headerButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 600);
    }
    prevIndexRef.current = openIndex;
  }, [openIndex]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderAnswer = (answer: string) => {
    const venueCountText = venueCount > 0 ? venueCount.toString() : 'many';
    const venueCountPlusText = venueCount > 0 ? `${venueCount}+` : 'many';

    let processedAnswer = answer
      .replace(/{{VENUE_COUNT}}\+/g, venueCountPlusText)
      .replace(/{{VENUE_COUNT}}/g, venueCountText);
    return highlightPrices(processedAnswer);
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6">
         <div className="text-center mb-16 scroll-reveal">
          <h3 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">Got Questions?</h3>
          <p className="text-4xl md:text-5xl font-display font-black text-action-primary mb-4 md:mb-6">We've Got Answers</p>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">Find answers to everything you need to know about the Holiday Pass</p>
         </div>
         <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, index) => (
             <div key={index} className="bg-bg-card rounded-lg shadow-md border-4 border-action-primary overflow-hidden scroll-reveal transition-all duration-300 hover:shadow-lg hover:brightness-105" style={{ transitionDelay: `${index * 100}ms` }}>
              <button
                ref={(el) => {
                  if (el) faqHeaderRefs.current[index] = el;
                }}
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left p-5 sm:p-6 focus:outline-none"
                aria-expanded={openIndex === index}
              >
                 <h3 className={`text-lg sm:text-xl font-display font-bold transition-colors duration-300 ${openIndex === index ? 'text-accent-primary' : 'text-text-primary'}`}>{faq.question}</h3>
                 <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-45' : 'rotate-0'}`}>
                   <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" />
                   </svg>
                 </span>
                 </button>
                 <div
                 className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                 >
                 <div className="p-5 sm:p-6 border-t border-border-subtle">
                  <p className="text-text-secondary leading-relaxed" dangerouslySetInnerHTML={renderAnswer(faq.answer)}></p>
                </div>
              </div>
            </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
