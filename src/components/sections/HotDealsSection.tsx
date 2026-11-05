import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { HorizontalCarousel } from '../ui/HorizontalCarousel';
import { PropertyCard, type PropertyCardProps } from '../ui/PropertyCard';

export const HotDealsSection = ({ deals = [] }: { deals?: PropertyCardProps[] }) => {
  if (deals.length === 0) return null;

  return (
    <section className="section-padding" style={{ background: 'var(--color-brand-cream)' }}>
      <div className="container-custom">
        <SectionHeader
          eyebrow="Limited Time"
          title="Hot Deals"
          subtitle="Priced to move — verified listings with the best value on the market right now."
          cta={{ label: 'View all deals', href: '/properties' }}
        />

        <HorizontalCarousel
          items={deals}
          cardWidth={340}
          gap={24}
          renderItem={(prop) => <PropertyCard {...prop} />}
        />
      </div>
    </section>
  );
};

