import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

const PLACEHOLDERS = [
  'Wazir Akbar Khan...',
  'Macroyan apartments...',
  '3-bed villa for sale...',
];

export const HeroSection = () => {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = PLACEHOLDERS[idx];
    let pauseId: ReturnType<typeof setTimeout>;
    const id = setTimeout(
      () => {
        if (!deleting) {
          if (text.length < target.length) {
            setText(target.slice(0, text.length + 1));
          } else {
            pauseId = setTimeout(() => setDeleting(true), 2200);
          }
        } else {
          if (text.length > 0) {
            setText(target.slice(0, text.length - 1));
          } else {
            setDeleting(false);
            setIdx((i) => (i + 1) % PLACEHOLDERS.length);
          }
        }
      },
      deleting ? 45 : 80
    );
    return () => {
      clearTimeout(id);
      clearTimeout(pauseId);
    };
  }, [text, deleting, idx]);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0 bg-brand-navy">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/70 to-brand-navy/85" />
        <div className="absolute inset-0 islamic-pattern" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-32">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3"
        >
          <span className="inline-block w-10 h-[1px] bg-brand-gold/60" />
          Kabul&apos;s Premier Real Estate
          <span className="inline-block w-10 h-[1px] bg-brand-gold/60" />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] max-w-4xl"
        >
          Find Your Home{' '}
          <span className="text-brand-gold italic font-display block md:inline">
            in Kabul
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg text-neutral-300 mb-10 max-w-xl leading-relaxed"
        >
          Browse premium homes, apartments &amp; commercial spaces across
          Kabul&apos;s finest neighbourhoods — for sale and for rent.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex flex-col sm:flex-row items-stretch gap-2 border border-white/20 shadow-2xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b sm:border-b-0 sm:border-r border-white/15">
              <MapPin className="text-brand-gold shrink-0" size={18} />
              <input
                type="text"
                aria-label="Search location or property"
                placeholder={text || PLACEHOLDERS[idx].slice(0, 1)}
                className="w-full bg-transparent border-none outline-none text-white font-medium placeholder:text-white/50 text-sm"
              />
            </div>
            <div className="w-full sm:w-36 px-4 py-3 border-b sm:border-b-0 sm:border-r border-white/15 flex items-center">
              <select
                aria-label="Property type"
                className="w-full bg-transparent border-none outline-none text-white font-bold appearance-none cursor-pointer text-sm"
              >
                <option className="text-brand-navy">Buy</option>
                <option className="text-brand-navy">Rent</option>
                <option className="text-brand-navy">Commercial</option>
              </select>
            </div>
            <Button className="w-full sm:w-auto px-6 gap-2 rounded-xl text-sm">
              <Search size={16} /> Search
            </Button>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 mt-12"
        >
          {[['200+', 'Properties'], ['15+', 'Projects'], ['10+', 'Years']].map(([val, lbl]) => (
            <div key={lbl} className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-brand-gold">{val}</span>
              <span className="text-xs text-white/60 font-medium uppercase tracking-widest">{lbl}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll chevron */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-white/40"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
};
