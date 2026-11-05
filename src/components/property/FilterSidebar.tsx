import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export interface FilterState {
  purpose: 'buy' | 'rent' | 'commercial';
  type: string[];
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  beds: string[];
  baths: string[];
  status: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

export const FilterSidebar = ({ filters, onChange, className }: FilterSidebarProps) => {
  const { t } = useTranslation();

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const handleArrayToggle = (key: 'type' | 'beds' | 'baths' | 'status', item: string) => {
    const current = filters[key];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateFilter(key, updated);
  };

  const activeCount =
    filters.type.length +
    filters.beds.length +
    filters.baths.length +
    filters.status.length +
    (filters.purpose !== 'buy' ? 1 : 0);

  return (
    <div className={`bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-6 ${className || ''}`}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-gold/15">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-brand-gold rounded-full" />
          <h3 className="font-bold text-brand-navy text-base uppercase tracking-wide">Filters</h3>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-brand-gold text-white text-xs font-bold flex items-center justify-center"
            >
              {activeCount}
            </motion.span>
          )}
        </div>
        <button
          onClick={() => onChange({
            purpose: 'buy', type: [], minPrice: 0, maxPrice: 2000000, minArea: 0, maxArea: 1000, beds: [], baths: [], status: []
          })}
          className="text-xs font-bold text-brand-gold uppercase tracking-wide hover:text-brand-gold-dark transition-colors link-underline"
        >
          {t('clearAll')}
        </button>
      </div>

      <div className="space-y-6">
        {/* Purpose */}
        <div>
          <h4 className="uppercase tracking-wide text-xs font-bold text-neutral-600 mb-3">{t('purpose')}</h4>
          <div className="relative flex bg-neutral-100 rounded-xl p-1">
            {(['buy', 'rent', 'commercial'] as const).map(p => (
              <button
                key={p}
                onClick={() => updateFilter('purpose', p)}
                className={`relative flex-1 py-2 text-sm font-semibold rounded-lg capitalize z-10 transition-colors duration-200 ${
                  filters.purpose === p ? 'text-white' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {filters.purpose === p && (
                  <motion.span
                    layoutId="filter-purpose-pill"
                    className="absolute inset-0 bg-brand-navy rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <h4 className="uppercase tracking-wide text-xs font-bold text-neutral-600 mb-3">{t('type')}</h4>
          <div className="space-y-2">
            {['Apartment', 'Villa', 'House', 'Townhouse', 'Commercial', 'Land'].map(type => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.type.includes(type)}
                  onChange={() => handleArrayToggle('type', type)}
                  className="rounded border-neutral-300 text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm text-neutral-700 group-hover:text-brand-navy transition-colors duration-150">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Beds */}
        <div>
          <h4 className="uppercase tracking-wide text-xs font-bold text-neutral-600 mb-3">{t('beds')}</h4>
          <div className="flex flex-wrap gap-2">
            {['Studio', '1', '2', '3', '4', '5+'].map(bed => (
              <motion.button
                key={bed}
                onClick={() => handleArrayToggle('beds', bed)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors duration-150 ${
                  filters.beds.includes(bed)
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-gold/50 hover:text-brand-navy'
                }`}
              >
                {bed}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
