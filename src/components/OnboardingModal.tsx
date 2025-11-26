import React from 'react';
import Button from './Button.tsx';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto"
            style={{ display: isOpen ? 'flex' : 'none' }}
            onClick={onClose}
        >
            <div
                className="bg-bg-card rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full relative border-4 border-action-primary my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Success icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-success/20 rounded-full mb-4">
                        <svg
                            className="w-12 h-12 text-success"
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

                    <h2 className="text-3xl font-display font-black text-accent-primary mb-2">
                        You're All Set! 🎉
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Your Holiday Pass is ready to use
                    </p>
                </div>

                {/* How to use steps */}
                <div className="bg-bg-primary rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-lg text-text-primary mb-4">
                        How to redeem your deals:
                    </h3>
                    <ol className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-action-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                1
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-text-primary">Visit any partner venue</p>
                                <p className="text-sm text-text-secondary">Browse deals below and choose where to go</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-action-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                2
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-text-primary">Tap "Redeem" on the deal</p>
                                <p className="text-sm text-text-secondary">This will show a confirmation screen</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-action-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                                3
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-text-primary">Show the green screen to staff</p>
                                <p className="text-sm text-text-secondary">They'll honor your deal on the spot</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-success text-white rounded-full flex items-center justify-center font-bold text-sm">
                                ✓
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-text-primary">Enjoy your savings!</p>
                                <p className="text-sm text-text-secondary">Use each deal once per venue</p>
                            </div>
                        </li>
                    </ol>
                </div>

                {/* Tips */}
                <div className="bg-value-highlight/10 border-2 border-value-highlight/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-value-highlight flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-text-primary mb-1">Pro Tip:</p>
                            <p className="text-xs text-text-secondary">
                                Check deal terms before visiting. Some deals may have restrictions like specific days or times.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <Button
                    variant="primary"
                    onClick={onClose}
                    className="w-full text-lg"
                >
                    Start Exploring Deals
                </Button>

                <p className="text-center text-xs text-text-secondary mt-4">
                    Need help? Use the WhatsApp button to chat with us
                </p>
            </div>
        </div>
    );
};

export default OnboardingModal;
