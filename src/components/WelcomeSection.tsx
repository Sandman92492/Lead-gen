import React from 'react';

interface WelcomeSectionProps {
  variant?: 'intro' | 'welcome' | 'welcomeWithPass'; // 'intro' for free users, 'welcome' for signed-in users, 'welcomeWithPass' for pass holders
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ variant = 'intro' }) => {
  const imageUrl = "/Images/welcome.jpg";

  const content = {
    intro: {
      tag: 'The December Survival Kit',
      heading: 'Your December. Sorted.',
      body: 'Whether you\'re a local dodging inflation or a visitor looking for the best spots, December can get expensive.\n\nWe\'ve partnered with local legends to create a digital pass that helps you do more for less.\n\nDon\'t pay Peak Season prices. Unlock the local rate instantly.',
    },
    welcome: {
      tag: 'Welcome Aboard',
      heading: 'Your Port Alfred Adventure Begins.',
      body: 'Where the gentle Kowie River meets the endless Indian Ocean. We believe a holiday is more than just seeing the sights, it\'s the feeling of warm sand between your toes, the taste of salt on the air, and the stories you\'ll share for years. Your real holiday starts now.',
    },
    welcomeWithPass: {
       tag: 'VIP Access',
       heading: 'Discover Local. Save Big.',
       body: 'You\'re now part of a community supporting Port Alfred\'s thriving local scene. Explore authentic venues, discover what makes our town special, and enjoy unbeatable savings while supporting the businesses that make Port Alfred great.',
     },
  };

  const current = content[variant];

  return (
    <section id="welcome" className="py-20 md:py-32 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6">
         <div className={`${variant === 'intro' ? 'grid md:grid-cols-2' : ''} gap-12 md:gap-16 items-center`}>
            {variant === 'intro' && (
              <div className="scroll-reveal">
                <img 
                  src={imageUrl} 
                  alt="An aerial view of Port Alfred's coastline and the Kowie River mouth."
                  className="rounded-lg shadow-2xl w-full h-full object-cover border-4 border-action-primary"
                />
              </div>
            )}
            <div className={`scroll-reveal ${variant === 'intro' ? 'text-left' : 'max-w-2xl mx-auto text-center'}`} style={{ transitionDelay: '150ms' }}>
              <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
                {current.tag}
              </h2>
              <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary mb-4 md:mb-6">
                {current.heading}
              </h1>
              <div className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">
                 {current.body.split('\n\n').map((paragraph, idx) => (
                   <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
                     {paragraph}
                   </p>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>
    );
};

export default WelcomeSection;
