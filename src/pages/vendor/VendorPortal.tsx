import React from 'react';
import { useVendorAuth } from '../../context/VendorAuthContext';
import VendorLogin from './VendorLogin';
import VendorDashboard from './VendorDashboard';

const VendorPortal: React.FC = () => {
  const { isLoading, isAuthed } = useVendorAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <p className="text-text-secondary font-semibold">Loading...</p>
      </main>
    );
  }

  return isAuthed ? <VendorDashboard /> : <VendorLogin />;
};

export default VendorPortal;
