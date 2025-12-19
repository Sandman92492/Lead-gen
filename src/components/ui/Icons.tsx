import React from 'react';

interface IconProps {
    className?: string;
}

export const TruckIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17h4" />
        <path d="M14 17h1" />
        <path d="M22 17h-1" />
        <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10" />
        <path d="M15 17H9" />
        <circle cx="7" cy="17" r="2" />
        <path d="M17 17h5l1-7h-8v7Z" />
        <circle cx="17" cy="17" r="2" />
    </svg>
);

export const FileTextIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export const PinIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a3 3 0 0 0-6 0v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
    </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21 2-2 2" />
        <circle cx="7" cy="17" r="5" />
        <path d="M12 12 22 2" />
        <path d="m18 7 3 3" />
        <path d="m16 5 3 3" />
    </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

export const BuildingIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
    </svg>
);

export const GiftIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);

export const SmartphoneIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
);

export const RocketIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-15l4.5 4.5L17 3s3 3 0 6l4.5 4.5a22 22 0 0 1-15 2z" />
        <path d="m9 15 3 3" />
        <path d="M20 9c.78.78.78 2.05 0 2.83" />
        <path d="M12.17 3.17a2.001 2.001 0 0 1 2.83 0" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3a9 9 0 0 0-9 9c0 1.3.3 2.5.8 3.6L3 21l5.4-1.4A9.02 9.02 0 0 0 21 12c0-5-4-9-9-9Z" />
        <path
            d="M16.5 14.5c-.2.6-1.2 1.4-2 1.1-.4-.2-.8-.3-1.1-.6-.2-.2-.4-.5-.6-.7-.2-.3-.4-.3-.7-.2-.4.1-.9.3-1.4.2-.4-.1-.7-.5-1-1s-.6-1.7-.9-2.3c-.3-.6-.1-.9.1-1.1.2-.2.4-.5.6-.8.2-.3.3-.4.4-.7.1-.3 0-.5-.1-.6-.1-.2-.9-2.3-1.2-2.5-.3-.2-.6-.2-.9-.2-.3 0-.6 0-.9 0-.3 0-.7.2-.9.6-.1.4-.5 1.1-.5 2s.6 1.9.7 2.1c.2.3.3.7.7 1.2.4.5 1.1 1.2 2.2 1.9.8.5 1.3.7 1.9.7.6 0 1.3-.3 1.6-.6.3-.3.6-.5.9-.4.3 0 .8.2 1.1.5.2.3.2.7.1.9Z"
            fill="white"
        />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
    </svg>
);
