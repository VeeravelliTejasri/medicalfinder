import React, { useState, useEffect, useRef } from 'react';
import { Search, Pill, AlertTriangle, X, ArrowRight, Activity } from 'lucide-react';
import { medicineApi } from '../services/api.js';
import { Medicine } from '../types/index.js';
import { useNavigate } from 'react-router-dom';

interface MedicineSearchBarProps {
  initialQuery?: string;
  onSelectMedicine?: (med: Medicine) => void;
  placeholder?: string;
  size?: 'normal' | 'large';
  autoFocus?: boolean;
}

export const MedicineSearchBar: React.FC<MedicineSearchBarProps> = ({
  initialQuery = '',
  onSelectMedicine,
  placeholder = 'Search by medicine name, brand (e.g. Dolo 650), or generic...',
  size = 'normal',
  autoFocus = false
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);

      try {
        const data = await medicineApi.search(query.trim());
        setSuggestions(data.medicines || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Medicine search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (med: Medicine) => {
    setQuery(med.name);
    setIsOpen(false);

    if (onSelectMedicine) {
      onSelectMedicine(med);
    } else {
      navigate(
        `/search?q=${encodeURIComponent(med.name)}&medicineId=${med.id}`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    }
  };

  // Search button handler
  const handleSearch = () => {
    if (!query.trim()) return;

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const isLarge = size === 'large';

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center w-full bg-white rounded-2xl border transition-all ${
          isOpen
            ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-lg'
            : 'border-slate-300 hover:border-slate-400 shadow-sm'
        } ${isLarge ? 'py-3.5 px-4' : 'py-2.5 px-3.5'}`}
      >
        <Search
          className={`text-slate-400 shrink-0 ${
            isLarge ? 'w-6 h-6 mr-3' : 'w-5 h-5 mr-2.5'
          }`}
        />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none text-slate-800 font-medium placeholder:text-slate-400 ${
            isLarge ? 'text-base sm:text-lg' : 'text-sm'
          }`}
        />

        {isLoading && (
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin shrink-0 mr-2" />
        )}

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className={`bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center transition shrink-0 ${
            isLarge
              ? 'px-5 py-2 text-sm gap-1.5'
              : 'px-3.5 py-1.5 text-xs gap-1'
          }`}
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2.5 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>
              Matching Medicines ({suggestions.length})
            </span>

            <span>
              Click to view availability
            </span>
          </div>

          {suggestions.map((med) => (
            <div
              key={med.id}
              onClick={() => handleSelect(med)}
              className="p-3.5 hover:bg-teal-50/50 cursor-pointer transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    med.is_emergency
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {med.is_emergency ? (
                    <Activity className="w-4 h-4" />
                  ) : (
                    <Pill className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {med.name}
                    </span>

                    {med.is_emergency === 1 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        Critical SOS
                      </span>
                    )}

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {med.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Generic:{' '}
                    <span className="text-slate-700 font-medium">
                      {med.generic_name}
                    </span>{' '}
                    • Brand:{' '}
                    <span className="text-slate-700 font-medium">
                      {med.brand_name}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-teal-700">
                  ~₹{med.average_price.toFixed(2)}
                </p>

                <span className="text-[10px] text-slate-400">
                  avg. market price
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};