import React from 'react';
import { TESTIMONIALS } from '../constants.tsx';

const Testimonials: React.FC = () => {
  return (
    <section 
      id="testimonials" 
      className="py-20 md:py-32 bg-bg-card overflow-hidden relative"
      style={{
        backgroundImage: `radial-gradient(circle at top left, rgba(255, 111, 97, 0.05), transparent 30%), radial-gradient(circle at bottom right, rgba(77, 182, 172, 0.05), transparent 30%)`
      }}
    >
      <div className="container mx-auto px-4 sm:px-6">
         <div className="text-center mb-16 scroll-reveal">
          <h3 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">Hear It From Your Fellow Holiday-Makers</h3>
          <p className="text-4xl md:text-5xl font-display font-black text-accent-primary mb-4 md:mb-6">What Our Pass Holders Are Saying</p>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">Real stories from holidaymakers who've discovered amazing deals across Port Alfred</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {TESTIMONIALS.map((testimonial, index) => (
             <div key={index} 
                  className="bg-bg-primary p-8 rounded-lg shadow-lg flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 scroll-reveal border-l-4 border-accent-primary"
                  style={{ transitionDelay: `${index * 150}ms` }}>
                 <svg className="absolute top-4 left-4 w-16 h-16 text-accent-primary/20" fill="currentColor" viewBox="0 0 32 32">
                   <path d="M6,1v10.3c0,3.4-1.7,5.6-4.5,6.7l1.1,1.4c3.4-1.3,5.4-4.3,5.4-8.1V1H6z M22,1v10.3c0,3.4-1.7,5.6-4.5,6.7l1.1,1.4 c3.4-1.3,5.4-4.3,5.4-8.1V1H22z"></path>
                 </svg>
                 <p className="text-lg sm:text-xl italic mb-6 relative z-10 leading-relaxed text-text-secondary pt-10">"{testimonial.quote}"</p>
                 <div className="flex items-center mt-auto">
                     <img src={testimonial.imageUrl} alt={testimonial.author} className="w-14 h-14 rounded-full object-cover border-2 border-accent-primary"/>
                     <p className="font-display text-xl sm:text-2xl text-text-primary font-semibold ml-4">{testimonial.author}</p>
                 </div>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
};

export default Testimonials;
