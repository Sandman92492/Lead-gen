import React from 'react';

interface WelcomeSectionProps {
  variant?: 'intro' | 'welcome' | 'welcomeWithPass'; // 'intro' for free users, 'welcome' for signed-in users, 'welcomeWithPass' for pass holders
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ variant = 'intro' }) => {
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const content = {
    intro: {
      tag: 'THE 2025 SURVIVAL KIT',
      heading: 'Don\'t Overpay This Summer.',
      body: 'Whether you\'re a local dodging inflation or a visitor looking for the best spots, the holidays can get expensive.\n\n**We fixed that.**',
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
         <div className="gap-12 md:gap-16 items-center">
            <div className={`scroll-reveal ${variant === 'intro' ? 'max-w-3xl mx-auto text-center px-4 sm:px-8' : 'max-w-2xl mx-auto text-center'}`} style={{ transitionDelay: '150ms' }}>
              <h2 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
                {current.tag}
              </h2>
              <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary mb-4 md:mb-6">
                {current.heading}
              </h1>
              <div className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8 md:mb-10">
                 {current.body.split('\n\n').map((paragraph, idx) => (
                   <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
                     {renderTextWithBold(paragraph)}
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
