import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from './Button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: 'default' | 'light';
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  variant = 'default',
  className,
}) => {
  const { t } = useTranslation();
  const isLight = variant === 'light';

  const fullItems: BreadcrumbItem[] = [
    { label: t('nav.home', 'Home'), href: '/' },
    ...items,
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('w-full', className)}
    >
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
      >
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1;
          const isFirst = index === 0;

          return (
            <li
              key={`${item.label}-${index}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0"
            >
              {index > 0 && (
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 rtl:rotate-180 transition-colors',
                    isLight ? 'text-white/40' : 'text-brand-navy/35'
                  )}
                />
              )}

              {!isLast && item.href ? (
                <Link
                  to={item.href}
                  itemProp="item"
                  className={cn(
                    'inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm',
                    isLight
                      ? 'text-white/75 hover:text-white'
                      : 'text-brand-navy/60 hover:text-brand-gold'
                  )}
                >
                  {isFirst && (
                    <Home
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 opacity-80"
                    />
                  )}
                  <span itemProp="name" className="truncate max-w-[180px] sm:max-w-[240px]">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  itemProp="name"
                  className={cn(
                    'inline-flex items-center gap-1.5 truncate max-w-[220px] sm:max-w-[380px] md:max-w-[480px]',
                    isLight
                      ? 'text-white font-semibold'
                      : 'text-brand-navy font-semibold'
                  )}
                >
                  {isFirst && (
                    <Home
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 opacity-80"
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </span>
              )}

              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
