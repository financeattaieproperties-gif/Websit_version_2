import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  light?: boolean;
}

export const SectionHeader = ({ eyebrow, title, subtitle, cta, light }: SectionHeaderProps) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    variants={staggerParent}
    className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
  >
    <motion.div variants={fadeUp}>
      <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3 flex items-center gap-3"
        style={{ color: 'var(--color-brand-gold)' }}>
        <span className="inline-block w-8 h-px" style={{ background: 'var(--color-brand-gold)', opacity: 0.5 }} />
        {eyebrow}
      </p>
      <h2
        className={`font-heading font-bold leading-tight ${light ? 'text-white' : 'text-brand-navy'}`}
        style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 max-w-lg text-sm leading-relaxed ${light ? 'text-white/60' : 'text-neutral-500'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
    {cta && (
      <motion.div variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4 } } }}
        className="shrink-0">
        <a
          href={cta.href}
          className={`inline-flex items-center gap-2 font-semibold text-sm group transition-colors duration-200 ${
            light ? 'text-white hover:text-brand-gold' : 'text-brand-navy hover:text-brand-gold'
          }`}
        >
          {cta.label}
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1.5" />
        </a>
      </motion.div>
    )}
  </motion.div>
);
