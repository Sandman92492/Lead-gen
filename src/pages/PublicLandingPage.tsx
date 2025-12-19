import React from 'react';
import Button from '../components/Button';
import { copy } from '../copy';

type PublicLandingPageProps = {
  onSignIn: () => void;
};

const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onSignIn }) => {
  return (
    <main className="relative min-h-[calc(100vh-6rem)] bg-bg-primary px-4 py-10 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-8 h-80 w-80 rounded-full bg-action-primary opacity-[0.10] blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-brand-yellow opacity-[0.14] blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="relative bg-bg-card border border-border-subtle rounded-3xl shadow-[var(--shadow)] p-6">
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-br from-action-primary to-brand-yellow opacity-[0.08]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "url('data:image/svg+xml;utf8,<svg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noise\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" seed=\"1\"/></filter><rect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"1\"/></svg>')",
            }}
            aria-hidden="true"
          />

          <div className="relative">
            <h1 className="mt-2 text-3xl font-display font-black text-text-primary">{copy.landing.title}</h1>
            <p className="mt-2 text-text-secondary">{copy.landing.subtitle}</p>

            <div className="mt-6">
              <Button variant="primary" className="w-full" onClick={onSignIn}>
                {copy.landing.signIn}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PublicLandingPage;
