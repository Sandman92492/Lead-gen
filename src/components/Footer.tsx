import React from 'react';
import Button from './Button.tsx';
import { useTheme } from './ThemeContext.tsx';

interface FooterProps {
  onButtonClick: () => void;
  buttonText: string;
  hasPass: boolean;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onButtonClick, buttonText, hasPass, onPrivacyClick, onTermsClick }) => {
  const { theme } = useTheme();
  return (
    <footer 
      className="bg-action-primary text-white relative pt-20 pb-32 md:pb-16"
    >
      <div className="container mx-auto px-4 sm:px-6 text-center scroll-reveal">
        {!hasPass && (
          <>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
              Ready for a <span className="text-value-highlight">Lekker</span> Holiday?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get instant access to all these deals and more. Make your holiday in Port Alfred the most <span className="font-bold text-value-highlight">memorable</span> (and <span className="font-bold text-value-highlight">affordable</span>) one yet.
            </p>
            <Button variant="primary" size="lg" className="!bg-white !text-action-primary hover:!bg-white/90 px-12 md:px-14 transform hover:scale-105 shadow-xl" onClick={onButtonClick}>
              {buttonText}
            </Button>
          </>
        )}
        <div className={`${!hasPass ? 'mt-16' : 'mt-0'} border-t border-white/20 pt-8 text-white/90`}>
          <div className="mx-auto mb-6 w-16 h-16 flex-shrink-0">
              <img 
                src={theme === 'dark' ? '/Images/logo-dark.png' : '/Images/logo-light.png'} 
                alt="Port Alfred Holiday Pass Logo"
                className="w-full h-full object-contain"
              />
          </div>
          <p>&copy; {new Date().getFullYear()} Port Alfred Holiday Pass. All rights reserved.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <button onClick={onPrivacyClick} className="text-white hover:text-value-highlight underline transition">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={onTermsClick} className="text-white hover:text-value-highlight underline transition">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
