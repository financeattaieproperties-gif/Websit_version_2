import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Building2 } from 'lucide-react';

export interface PromoBannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: string[];
  ctaLabel: string;
  ctaHref: string;
  image?: string;
  imageSide?: 'left' | 'right';
}

export const PromoBanner = ({
  eyebrow,
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  image,
  imageSide = 'right',
}: PromoBannerProps) => (
  <section className="section-padding" style={{ background: 'var(--color-brand-cream)' }}>
    <div className="container-custom">
      <div
        className="relative rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        style={{ background: 'var(--color-brand-navy)', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-25 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(1,69,242,0.25) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={`relative z-10 p-10 sm:p-14 flex flex-col justify-center ${
            imageSide === 'left' ? 'lg:order-2' : ''
          }`}
        >
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-brand-gold)' }}>
              {eyebrow}
            </p>
          )}
          <h2 className="font-heading font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
            {title}
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-md">{description}</p>

          {bullets && bullets.length > 0 && (
            <ul className="flex flex-col gap-2.5 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-white/85 text-sm">
                  <CheckCircle2 size={16} className="text-brand-gold shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          <a
            href={ctaHref}
            className="inline-flex items-center gap-2 self-start px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            style={{ background: 'var(--color-brand-gold)', boxShadow: 'var(--gold-glow-md)' }}
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </a>
        </motion.div>

        <div className={`relative min-h-[260px] flex items-center justify-center ${imageSide === 'left' ? 'lg:order-1' : ''}`}>
          {image ? (
            <img src={image} alt="" aria-hidden="true" className="w-full h-full object-cover absolute inset-0" loading="lazy" />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold-lt">
              <Building2 size={44} />
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

