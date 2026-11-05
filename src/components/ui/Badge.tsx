import React, { useState, useEffect } from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'available' | 'pending' | 'sold' | 'rented';
  type?: string;
}

export const Badge = ({ status, type, className, children, ...props }: BadgeProps) => {
  const [pulsing, setPulsing] = useState(status === 'available');

  useEffect(() => {
    if (status !== 'available') return;
    const t = setTimeout(() => setPulsing(false), 2000);
    return () => clearTimeout(t);
  }, [status]);

  // Note: a badge-pulse keyframe (lighter than gold-pulse) can be defined in
  // globals.css if a custom animation is preferred over Tailwind's animate-pulse.
  const statusColors = {
    available: 'bg-status-available/15 text-status-available border-status-available/35',
    pending:   'bg-status-pending/15  text-status-pending  border-status-pending/35',
    sold:      'bg-status-sold/15     text-status-sold     border-status-sold/35',
    rented:    'bg-status-rented/15   text-status-rented   border-status-rented/35',
  };

  const baseStyle =
    'inline-flex items-center rounded-full border-[1.5px] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]';

  if (status) {
    const isStruck = status === 'sold' || status === 'rented';

    return (
      <div
        className={cn(
          baseStyle,
          statusColors[status],
          isStruck && 'relative after:content-[""] after:absolute after:inset-x-2 after:top-1/2 after:h-px after:bg-current after:opacity-40',
          status === 'available' && pulsing && 'animate-pulse',
          className
        )}
        {...props}
      >
        {status}
      </div>
    );
  }

  // Type badge — luxury navy treatment instead of neutral gray
  return (
    <div
      className={cn(
        baseStyle,
        'bg-brand-navy/8 text-brand-navy border-brand-navy/15',
        className
      )}
      {...props}
    >
      {type || children}
    </div>
  );
};
