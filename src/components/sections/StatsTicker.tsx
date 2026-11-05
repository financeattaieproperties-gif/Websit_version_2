import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export interface StatItem {
  target: number;
  decimals?: number;
  suffix: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { target: 200, suffix: '+', label: 'Properties Listed' },
  { target: 15, suffix: '+', label: 'Signature Projects' },
  { target: 10, suffix: '+', label: 'Years in Kabul' },
  { target: 4.8, decimals: 1, suffix: '/5', label: 'Client Rating' },
];

const CountUp = ({
  target,
  decimals = 0,
  suffix,
}: {
  target: number;
  decimals?: number;
  suffix: string;
}) => {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1000;
    const id = setInterval(() => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (t >= 1) {
        setValue(target);
        setDone(true);
        clearInterval(id);
      }
    }, 16);
    return () => clearInterval(id);
  }, [inView, target, decimals]);

  return (
    <span ref={ref}>
      <span className={done ? 'flash-gold' : ''} style={{ display: 'inline-block' }}>
        {decimals > 0 ? value.toFixed(decimals) : Math.floor(value)}
        {suffix}
      </span>
    </span>
  );
};

export const StatsTicker = ({ stats = DEFAULT_STATS }: { stats?: StatItem[] }) => (
  <section className="relative bg-brand-navy islamic-pattern py-16 overflow-hidden" aria-label="Key statistics">
    {/* Subtle gold glow top */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
    <div className="container-custom">
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {stats.map(({ target, decimals, suffix, label }, i) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className={`flex flex-col items-center text-center px-6 py-4 ${
              i < stats.length - 1 ? 'md:border-r md:border-brand-gold/20' : ''
            } ${i < 2 ? 'border-b md:border-b-0 border-brand-gold/20 pb-10 md:pb-4' : 'pt-10 md:pt-4'}`}
          >
            <p className="font-bold text-white mb-2 tabular-nums" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              <CountUp target={target} decimals={decimals} suffix={suffix} />
            </p>
            <p className="text-brand-gold/85 text-xs uppercase tracking-[0.2em] font-bold">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
  </section>
);
