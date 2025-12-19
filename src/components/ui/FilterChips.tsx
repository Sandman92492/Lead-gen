export type FilterChip<T extends string> = {
  id: T;
  label: string;
};

type FilterChipsProps<T extends string> = {
  items: FilterChip<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

const FilterChips = <T extends string>({ items, value, onChange, className }: FilterChipsProps<T>) => {
  return (
    <div
      className={`inline-flex max-w-full overflow-x-auto scrollbar-hide rounded-full border border-border-subtle bg-surface/50 p-1.5 ${className || ''
        }`}
      role="tablist"
      aria-label="Filters"
    >
      <div className="flex gap-2">
        {items.map((item) => {
          const active = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`h-10 px-5 rounded-full text-sm font-bold whitespace-nowrap focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] transition-all duration-200
                ${active ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'}`}
              role="tab"
              aria-selected={active}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterChips;
