import React from 'react';

export type BottomNavItem = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
};

type BottomNavProps = {
  items: BottomNavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
};

const isActivePath = (itemPath: string, currentPath: string): boolean => {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

import { motion } from 'framer-motion';

const BottomNav: React.FC<BottomNavProps> = ({ items, currentPath, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-[env(safe-area-inset-bottom)] bg-bg-card border-t border-border-subtle" aria-label="Primary">
      <div className="mx-auto max-w-md px-6">
        <div className="flex justify-between items-center h-16">
          {items.map((item) => {
            const active = isActivePath(item.path, currentPath);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300
                  ${active ? 'text-primary' : 'text-text-secondary/60 hover:text-text-secondary'}`}
                aria-current={active ? 'page' : undefined}
              >
                <motion.span
                  animate={active ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                  className="h-6 w-6 relative z-10"
                >
                  {item.icon}
                </motion.span>
                <span className={`text-[12px] font-bold uppercase tracking-widest transition-all duration-300 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-x-4 -inset-y-1 bg-primary/10 rounded-[var(--r-lg)] z-0"
                    transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
