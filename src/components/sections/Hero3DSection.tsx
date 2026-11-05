import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import type { Property } from '../../lib/dbService';

const PLACEHOLDERS = [
  'Search by district, serial number, or address...',
  'Wazir Akbar Khan...',
  'Shahr-e-Naw...',
];

type PropertyType = 'Buy' | 'Rent' | 'Commercial';
const PROPERTY_TYPES: PropertyType[] = ['Buy', 'Rent', 'Commercial'];

export const Hero3DSection: React.FC<{ featuredProperties?: Property[] }> = ({ featuredProperties = [] }) => {
  const navigate = useNavigate();
  const slidesWithImages = featuredProperties.filter((p) => Boolean(p.image_url));

  const [slideIdx, setSlideIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [propType, setPropType] = useState<PropertyType>('Buy');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (slidesWithImages.length <= 1) return;
    const id = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slidesWithImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slidesWithImages.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (propType === 'Commercial') params.set('type', 'Commercial');
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const activeSlide = slidesWithImages[slideIdx % Math.max(slidesWithImages.length, 1)];
  const formattedPrice = activeSlide
    ? activeSlide.listing_type === 'rent'
      ? `$${Number(activeSlide.price).toLocaleString()}/mo`
      : `$${Number(activeSlide.price).toLocaleString()}`
    : '';

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-24 pb-36 md:pb-28"
      style={{ background: 'var(--color-brand-navy)' }}
    >
      {/* ── Architectural backdrop or live uploaded property slideshow ── */}
      {activeSlide?.image_url ? (
        <AnimatePresence mode="sync">
          <motion.div
            key={activeSlide.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img src={activeSlide.image_url} alt={activeSlide.title} className="w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 35%, rgba(1,69,242,0.28) 0%, rgba(2,14,58,0.95) 70%)',
          }}
        />
      )}

      {/* ── Overlays ── */}
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* ── Center card ── */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-3xl px-8 py-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 80px rgba(2,14,58,0.25), 0 4px 16px rgba(2,14,58,0.12)',
            border: '1px solid rgba(255,255,255,0.85)',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="font-heading font-bold text-brand-navy leading-tight mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Find Your Dream Home<br />in Kabul
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="text-neutral-500 text-sm mb-7 leading-relaxed"
          >
            Premium villas, apartments &amp; commercial spaces — for sale and for rent.
          </motion.p>

          {/* Property type pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.45 }}
            className="flex items-center gap-1 p-1 rounded-xl mb-4 w-fit mx-auto"
            style={{ background: 'rgba(2,14,58,0.07)' }}
          >
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPropType(t)}
                className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200"
                style={{ color: propType === t ? '#ffffff' : 'rgba(2,14,58,0.5)' }}
              >
                {propType === t && (
                  <motion.span
                    layoutId="pill"
                    className="absolute inset-0 rounded-lg bg-brand-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            ))}
          </motion.div>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.45 }}
            className="flex items-center gap-2 rounded-xl px-4 py-3 mb-2"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(2,14,58,0.12)',
              boxShadow: '0 2px 8px rgba(2,14,58,0.06)',
            }}
          >
            <MapPin size={16} className="text-brand-gold shrink-0" />
            <div className="relative flex-1">
              {!searchQuery && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center text-neutral-400 text-sm pointer-events-none select-none"
                    aria-hidden="true"
                  >
                    {PLACEHOLDERS[phraseIdx]}
                  </motion.span>
                </AnimatePresence>
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search location or property"
                placeholder=""
                className="relative z-10 w-full bg-transparent border-none outline-none text-brand-navy text-sm font-medium"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shrink-0 bg-brand-gold text-white hover:brightness-110 transition-[filter] duration-150"
            >
              <Search size={14} />
              Search
            </motion.button>
          </motion.form>
        </motion.div>

        {/* Browse CTA below card */}
        <motion.a
          href="/properties"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 inline-flex items-center gap-2 text-white/90 text-sm font-semibold drop-shadow-md hover:gap-3 transition-all duration-200 group"
        >
          Browse all properties
          <ChevronDown size={15} className="group-hover:translate-y-0.5 transition-transform duration-200" />
        </motion.a>
      </div>

      {/* ── Background property info (bottom-left of hero image) ── */}
      {activeSlide && (
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-10 z-20 max-w-xs sm:max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/properties/${activeSlide.id}`}
                className="group block transition-opacity duration-200"
              >
                <p className="font-heading font-bold text-white text-base sm:text-lg leading-snug line-clamp-1 drop-shadow-md group-hover:text-brand-gold-lt transition-colors">
                  {activeSlide.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-white/85 text-xs sm:text-sm line-clamp-1 drop-shadow-md">
                  <MapPin size={14} className="text-brand-gold-lt shrink-0" />
                  <span className="truncate">{activeSlide.location}</span>
                </p>
                <p className="mt-1.5 font-heading font-extrabold text-white text-lg sm:text-2xl tracking-tight drop-shadow-md">
                  {formattedPrice}
                </p>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

