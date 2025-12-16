import React, { useState } from 'react';
import Button from './Button.tsx';
import BaseModal from './BaseModal.tsx';
import FormInput from './FormInput.tsx';

interface ActivatePassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActivate: (passId: string, primaryName: string, plusOneName: string | null) => Promise<{ success: boolean, message: string }>;
}

const ActivatePassModal: React.FC<ActivatePassModalProps> = ({ isOpen, onClose, onActivate }) => {
    const [passId, setPassId] = useState('');
    const [primaryName, setPrimaryName] = useState('');
    const [plusOneName, setPlusOneName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !passId.trim() || !primaryName.trim()) return;

        setIsLoading(true);
        setError(null);

        const result = await onActivate(passId.trim(), primaryName.trim(), plusOneName.trim() || null);

        if (!result.success) {
            setError(result.message);
            setIsLoading(false);
        }
        // On success, the modal will be closed by the parent component.
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Activate Shared Ticket Pack"
            maxWidth="md"
        >
            <p className="text-text-secondary mb-6">
                Enter the details from the original ticket pack to activate it on this device.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    type="text"
                    value={passId}
                    onChange={(e) => setPassId(e.target.value.toUpperCase())}
                    placeholder="Ticket Pack ID (e.g., PAHP-XYZ123)"
                    ariaLabel="Ticket Pack ID"
                    disabled={isLoading}
                    required
                />
                <FormInput
                    type="text"
                    value={primaryName}
                    onChange={(e) => setPrimaryName(e.target.value)}
                    placeholder="Primary Ticket Holder's Name"
                    ariaLabel="Primary Ticket Holder's Name"
                    disabled={isLoading}
                    required
                />
                <FormInput
                    type="text"
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                    placeholder="Your Name (+1, if adding)"
                    ariaLabel="Your Name"
                    disabled={isLoading}
                />

                {error && (
                    <p className="text-accent-secondary text-sm bg-accent-secondary/20 border border-accent-secondary/50 p-3 rounded-lg">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full text-lg"
                    disabled={isLoading}
                >
                    {isLoading ? 'Activating...' : 'Activate Ticket Pack'}
                </Button>
            </form>
        </BaseModal>
    );
};

export default ActivatePassModal;
