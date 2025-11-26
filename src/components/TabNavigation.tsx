import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { haptics } from '../utils/haptics';

interface TabItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  isMobile?: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const currentTabId = tabs.find(tab => tab.path === location.pathname)?.id || tabs[0].id;

  const handleTabClick = (path: string) => {
    haptics.tap();
    navigate(path);
  };

  if (isMobile) {
    return (
      <nav 
        className="fixed bottom-0 left-0 right-0 z-20 bg-bg-card border-t-8 border-brand-dark-blue md:hidden rounded-t-3xl shadow-lg"
        style={{ boxShadow: theme === 'dark' ? '0 -4px 8px rgba(0, 0, 0, 0.4), 0 -12px 20px rgba(0, 0, 0, 0.5)' : '0 -4px 8px rgba(0, 0, 0, 0.1), 0 -12px 20px rgba(0, 0, 0, 0.15)' }}
      >
        <div className="flex justify-around items-center h-16 sm:h-20 gap-1 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-xs sm:text-sm font-semibold transition-all rounded-xl ${
                currentTabId === tab.id
                  ? 'text-action-primary bg-action-primary/10'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.icon && (
                <div 
                  className={`h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center flex-shrink-0`}
                  style={{
                    filter: currentTabId === tab.id 
                      ? `brightness(0) saturate(100%) invert(32%) sepia(65%) saturate(2000%) hue-rotate(${theme === 'dark' ? '175deg' : '190deg'}) brightness(1.1)`
                      : theme === 'dark' 
                        ? 'brightness(0.7) opacity(0.8)' 
                        : 'brightness(0.5) opacity(0.7)'
                  }}>
                  {tab.icon}
                </div>
              )}
              <span className="line-clamp-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    );
  }

  // Desktop horizontal tabs
  return (
    <nav className="hidden md:flex border-b border-border-subtle bg-bg-primary sticky top-24 z-20 justify-center">
      <div className="flex items-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.path)}
            className={`px-4 py-4 font-semibold text-sm transition-colors border-b-2 ${
              currentTabId === tab.id
                ? 'border-action-primary text-action-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabNavigation;
