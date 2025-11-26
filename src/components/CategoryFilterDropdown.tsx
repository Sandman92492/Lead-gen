import React, { useState, useRef, useEffect } from 'react';

interface Category {
  category: string;
  deals: any[];
}

interface CategoryFilterDropdownProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = selectedCategory || 'All Categories';
  const selectedCount = selectedCategory
    ? categories.find(cat => cat.category === selectedCategory)?.deals.length
    : categories.reduce((sum, cat) => sum + cat.deals.length, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  const handleSelectOption = (category: string | null) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto max-w-sm">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3 md:py-2.5 rounded-lg font-semibold text-base border-2 border-action-primary bg-bg-card text-text-primary transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-action-primary focus:ring-offset-2 focus:ring-offset-bg-primary flex items-center justify-between gap-3"
      >
        <div className="text-left">
          <p className="text-xs font-bold text-action-primary/70 uppercase tracking-wide">Filter by Category</p>
          <p className="text-sm md:text-base font-semibold text-text-primary">{selectedLabel}</p>
        </div>
        <svg
          className={`h-5 w-5 text-action-primary flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu - Inline */}
      {isOpen && (
        <div
          ref={dropdownRef}
          onKeyDown={handleKeyDown}
          className="absolute top-full left-0 mt-2 bg-bg-card border-2 border-action-primary rounded-lg shadow-2xl overflow-hidden z-10 w-full"
        >
          {/* All Categories Option */}
          <button
            onClick={() => handleSelectOption(null)}
            className={`w-full px-6 py-3 text-left font-semibold text-base transition-all flex items-center justify-between gap-3 border-l-4 ${
              selectedCategory === null
                ? 'bg-action-primary/15 text-accent-primary border-l-action-primary'
                : 'text-text-primary hover:bg-action-primary/5 border-l-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              {selectedCategory === null && (
                <svg className="w-4 h-4 text-action-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span>All Categories</span>
            </div>
            <span className="inline-block bg-value-highlight/20 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
              <span className="text-value-highlight font-bold text-sm">{selectedCount}</span>
            </span>
          </button>

          <div className="border-t border-border-subtle" />

          {/* Category Options */}
          {categories.map((cat, index) => (
            <React.Fragment key={cat.category}>
              <button
                onClick={() => handleSelectOption(cat.category)}
                className={`w-full px-6 py-3 text-left font-semibold text-base transition-all flex items-center justify-between gap-3 border-l-4 ${
                  selectedCategory === cat.category
                    ? 'bg-action-primary/15 text-accent-primary border-l-action-primary'
                    : 'text-text-primary hover:bg-action-primary/5 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedCategory === cat.category && (
                    <svg className="w-4 h-4 text-action-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{cat.category}</span>
                </div>
                <span className="inline-block bg-value-highlight/20 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                  <span className="text-value-highlight font-bold text-sm">{cat.deals.length}</span>
                </span>
              </button>
              {index < categories.length - 1 && (
                <div className="border-t border-border-subtle" />
              )}
            </React.Fragment>
          ))}
          </div>
          )}
          </div>
          );
          };

export default CategoryFilterDropdown;
