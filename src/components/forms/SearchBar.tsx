import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Hash, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SearchBarProps {
  value?: string;
  onChange?: (query: string) => void;
  purpose?: 'buy' | 'rent' | 'commercial';
  onPurposeChange?: (purpose: 'buy' | 'rent' | 'commercial') => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  purpose: controlledPurpose,
  onPurposeChange,
  placeholder = 'Search by title, location, or serial number...',
}) => {
  const navigate = useNavigate();
  const [internalPurpose, setInternalPurpose] = useState<'buy' | 'rent' | 'commercial'>('buy');
  const [internalQuery, setInternalQuery] = useState('');

  const activePurpose = controlledPurpose ?? internalPurpose;
  const query = value !== undefined ? value : internalQuery;

  const handlePurposeClick = (nextPurpose: 'buy' | 'rent' | 'commercial') => {
    setInternalPurpose(nextPurpose);
    onPurposeChange?.(nextPurpose);
  };

  const handleInputChange = (nextVal: string) => {
    setInternalQuery(nextVal);
    onChange?.(nextVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onChange) {
      onChange(query);
      return;
    }
    const params = new URLSearchParams();
    params.set('purpose', activePurpose);
    if (query.trim()) params.set('search', query.trim());
    navigate(`/properties?${params.toString()}`);
  };

  const isSerialLike =
    Boolean(query.trim()) &&
    /^[a-z0-9-]+$/i.test(query.trim()) &&
    (query.trim().includes('-') || /\d/.test(query.trim()));

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-2"
    >
      <div className="flex flex-col md:flex-row gap-2">
        {/* Purpose Toggle */}
        <div className="flex bg-neutral-100 rounded-xl p-1 md:w-auto w-full shrink-0">
          {(['buy', 'rent', 'commercial'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePurposeClick(p)}
              className={`flex-1 md:flex-none px-6 py-3 text-sm font-bold rounded-lg transition-colors capitalize ${
                activePurpose === p
                  ? 'bg-white text-brand-gold shadow-sm'
                  : 'text-neutral-500 hover:text-brand-navy'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Real-time Search Input */}
        <div className="flex-1 relative flex items-center bg-neutral-50 rounded-xl px-4">
          {isSerialLike ? (
            <Hash size={19} className="text-brand-gold absolute left-4 pointer-events-none" />
          ) : (
            <MapPin size={20} className="text-neutral-400 absolute left-4 pointer-events-none" />
          )}
          <input
            type="text"
            aria-label="Search properties by title, location, or serial number"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-transparent border-none py-3 pl-8 pr-9 text-brand-navy focus:outline-none focus:ring-0 placeholder:text-neutral-400"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => handleInputChange('')}
              className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-brand-navy hover:bg-neutral-200/70 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full md:w-auto px-8 shrink-0 gap-2 rounded-xl">
          <Search size={20} />
          <span>Search</span>
        </Button>
      </div>
    </form>
  );
};
