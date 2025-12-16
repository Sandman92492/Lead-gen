import React, { useEffect } from 'react';
import BaseModal from './BaseModal';

interface RedemptionSuccessModalProps {
    isOpen: boolean;
    dealName: string;
    venueName: string;
    onClose: () => void;
}

const RedemptionSuccessModal: React.FC<RedemptionSuccessModalProps> = ({
    isOpen,
    dealName,
    venueName,
    onClose,
}) => {
    // Auto-close after 10 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 10000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    const currentTime = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="md" showCloseButton zIndex={60}>
            <div className="text-center space-y-6">
                {/* Large checkmark */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-success/20 rounded-full border-4 border-success">
                        <svg
                            className="w-16 h-16 text-success"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Deal Redeemed */}
                <h1 className="text-4xl font-display font-black text-success">
                    ENTRY<br />RECORDED
                </h1>

                {/* Venue name - what staff should see */}
                <div className="bg-success/10 rounded-xl p-6 border-2 border-success/30 space-y-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-2">
                            School/Fundraiser
                        </p>
                        <p className="text-2xl font-display font-black text-text-primary">
                            {venueName}
                        </p>
                    </div>

                    <div className="border-t-2 border-success/20 pt-4">
                        <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-2">
                            Raffle
                        </p>
                        <p className="text-lg font-bold text-text-primary">
                            {dealName}
                        </p>
                    </div>
                </div>

                {/* Timestamp for verification */}
                <div className="bg-bg-primary rounded-lg px-6 py-4 space-y-2 border border-border-subtle">
                    <p className="text-5xl font-mono font-black text-action-primary">
                        {currentTime}
                    </p>
                    <p className="text-lg font-semibold text-text-secondary">
                        {currentDate}
                    </p>
                </div>

                {/* Instructions */}
                <div className="space-y-1">
                    <p className="text-lg font-semibold text-text-primary">
                        Show this screen to staff
                    </p>
                    <p className="text-sm text-text-secondary">
                        Auto-closes in 10 seconds
                    </p>
                </div>
            </div>
        </BaseModal>
    );
};

export default RedemptionSuccessModal;
