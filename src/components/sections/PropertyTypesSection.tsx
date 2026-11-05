import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Home, Warehouse, Store, Trees } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

interface PropertyType {
  Icon: LucideIcon;
  label: string;
  typeParam: string;
}

const TYPES: PropertyType[] = [
  { Icon: Building2, label: 'Apartments', typeParam: 'Apartment' },
  { Icon: Home, label: 'Villas', typeParam: 'Villa' },
  { Icon: Warehouse, label: 'Houses', typeParam: 'House' },
  { Icon: Store, label: 'Commercial', typeParam: 'Commercial' },
  { Icon: Trees, label: 'Land', typeParam: 'Land' },
];

export const PropertyTypesSection = () => (
  <section className="section-padding" style={{ background: 'var(--color-brand-ivory)' }}>
    <div className="container-custom">
      <SectionHeader
        eyebrow="Get Started"
        title="Browse By Property Type"
        subtitle="Find the right category of home or investment for your needs across Kabul."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {TYPES.map(({ Icon, label, typeParam }, i) => (
          <motion.a
            key={label}
            href={`/properties?type=${encodeURIComponent(typeParam)}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5 }}
            className="group flex flex-col items-center text-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/70 p-6 transition-colors duration-300 hover:border-brand-gold/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors duration-300">
              <Icon size={24} className="text-brand-gold" />
            </div>
            <p className="font-heading font-bold text-brand-navy text-sm">{label}</p>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

