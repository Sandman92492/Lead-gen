import React from 'react';
import { useTheme } from './ThemeContext';

interface IconProps {
  className?: string;
}

export const HomeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
   const { theme } = useTheme();
   return (
     <img 
       src="/Images/home.svg" 
       alt="Home" 
       className={className}
       style={{ 
         filter: theme === 'dark' ? 'brightness(1.2) invert(1)' : 'brightness(0.9)'
       }} 
     />
   );
};

export const PassIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
   const { theme } = useTheme();
   return (
     <img 
       src="/Images/pass.svg" 
       alt="Pass" 
       className={className}
       style={{ 
         filter: theme === 'dark' ? 'brightness(1.2) invert(1)' : 'brightness(0.9)'
       }} 
     />
   );
};

export const DealsIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
   const { theme } = useTheme();
   return (
     <img 
       src="/Images/all-deals.svg" 
       alt="All Deals" 
       className={className}
       style={{ 
         filter: theme === 'dark' ? 'brightness(1.2) invert(1)' : 'brightness(0.9)'
       }} 
     />
   );
};

export const HeavyHittersIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
   const { theme } = useTheme();
   return (
     <img 
       src="/Images/featured.svg" 
       alt="Featured" 
       className={className}
       style={{ 
         filter: theme === 'dark' ? 'brightness(1.2) invert(1)' : 'brightness(0.9)'
       }} 
     />
   );
};

export const ProfileIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
   const { theme } = useTheme();
   return (
     <img 
       src="/Images/profile.svg" 
       alt="Profile" 
       className={className}
       style={{ 
         filter: theme === 'dark' ? 'brightness(1.2) invert(1)' : 'brightness(0.9)'
       }} 
     />
   );
};
