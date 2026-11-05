import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

interface District {
  name: string;
  subtitle: string;
}

const DISTRICTS: District[] = [
  { name: 'Wazir Akbar Khan', subtitle: 'Diplomatic & Residential District' },
  { name: 'Shahr-e-Naw', subtitle: 'Commercial & Urban Center' },
  { name: 'Karte Parwan', subtitle: 'Established Family Neighborhood' },
  { name: 'Taimani', subtitle: 'Residential & Retail Hub' },
];

export const PopularLocationsSection = () => (
  <section className="section-padding" style={{ background: 'var(--color-brand-cream)' }}>
    <div className="container-custom">
      <SectionHeader
        eyebrow="Where to Look"
        title="Popular Districts"
        subtitle="The Kabul neighborhoods our clients ask for most."
        cta={{ label: 'Explore all districts', href: '/properties' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {DISTRICTS.map((d, i) => (
          <motion.a
            key={d.name}
            href={`/properties?search=${encodeURIComponent(d.name)}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl overflow-hidden p-7 flex flex-col justify-between min-h-[200px] bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="absolute inset-0 islamic-pattern opacity-25 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold-lt">
                <MapPin size={20} />
              </div>
              <ArrowUpRight
                size={18}
                className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div className="relative z-10 mt-8">
              <p className="font-heading font-bold text-white text-lg leading-tight">{d.name}</p>
              <p className="text-white/60 text-xs mt-1">{d.subtitle}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

