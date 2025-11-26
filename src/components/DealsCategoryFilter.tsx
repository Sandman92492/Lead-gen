import React from 'react';

interface DealsCategoryFilterProps {
  title: string;
  description: string;
  subtitle?: string;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'restaurant': return { bg: 'bg-urgency-high/10', border: 'border-urgency-high', text: 'text-urgency-high' };
    case 'activity': return { bg: 'bg-action-primary/10', border: 'border-action-primary', text: 'text-action-primary' };
    case 'shopping': return { bg: 'bg-value-highlight/10', border: 'border-value-highlight', text: 'text-value-highlight' };
    default: return { bg: 'bg-bg-card', border: 'border-border-subtle', text: 'text-text-secondary' };
  }
};

const DealsCategoryFilter: React.FC<DealsCategoryFilterProps> = ({
  title,
  description,
  subtitle,
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="text-center">
      {subtitle && (
        <h3 className="text-sm md:text-base font-semibold text-action-primary uppercase tracking-widest mb-4 md:mb-5">
          {subtitle}
        </h3>
      )}
      <p className="text-3xl md:text-4xl font-display font-black text-accent-primary mb-4 md:mb-6">
        {title}
      </p>
      <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">
        {description}
      </p>

      {categories.length > 0 && (
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null ? 'bg-action-primary text-white' : 'bg-bg-card border border-border-subtle text-text-secondary hover:brightness-110'}`}
          >
            All Categories
          </button>
          {categories.map(cat => {
            const colors = getCategoryColor(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${isSelected ? `${colors.bg} ${colors.border} ${colors.text}` : `${colors.bg} ${colors.border} ${colors.text} opacity-60 hover:opacity-100`}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealsCategoryFilter;
