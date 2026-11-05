import React from 'react';
import { motion } from 'framer-motion';
import { BadgeDollarSign, ShieldCheck, Users, Landmark, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TrustBadge {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const BADGES: TrustBadge[] = [
  { Icon: BadgeDollarSign, title: 'Best Price Guarantee', desc: 'Get the best deal on every listing' },
  { Icon: ShieldCheck, title: 'Verified Properties', desc: 'Every listing personally inspected' },
  { Icon: Users, title: 'Expert Agents', desc: 'Local knowledge, professional support' },
  { Icon: Landmark, title: 'Easy Financing', desc: 'Flexible payment plans available' },
  { Icon: Clock, title: '24/7 Support', desc: "We're here to help, any time" },
];

export const TrustBadgesStrip = () => (
  <section className="py-10" style={{ background: 'var(--color-brand-ivory)' }}>
    <div className="container-custom">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {BADGES.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-brand-gold/10">
              <Icon size={20} className="text-brand-gold" />
            </div>
            <div>
              <p className="font-bold text-brand-navy text-sm leading-tight">{title}</p>
              <p className="text-neutral-400 text-xs mt-0.5 leading-snug">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
