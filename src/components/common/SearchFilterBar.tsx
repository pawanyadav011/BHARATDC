import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  countText?: string;
  filters?: React.ReactNode;
  onResetFilters?: () => void;
  showReset?: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  countText,
  filters,
  onResetFilters,
  showReset = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-sm">
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 bg-[#07111F]/70 border border-[rgba(148,163,184,0.18)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

        {showReset && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium py-1.5 px-2.5 hover:bg-blue-500/10 rounded-lg transition-colors whitespace-nowrap"
          >
            Reset Filters
          </button>
        )}
      </div>

      {countText && (
        <div className="text-xs text-slate-400 whitespace-nowrap pl-1 sm:pl-0 sm:border-l sm:border-slate-800 sm:pl-3 font-mono">
          {countText}
        </div>
      )}
    </div>
  );
};
