import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero3DSection } from './Hero3DSection';
import { TrustBadgesStrip } from './TrustBadgesStrip';
import { PropertyTypesSection } from './PropertyTypesSection';
import { PromoBanner } from './PromoBanner';
import { WhyAttaieSection } from './WhyAttaieSection';
import { PopularLocationsSection } from './PopularLocationsSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TrustBlock } from './TrustBlock';
import { ServicesSection } from './ServicesSection';
import { HotDealsSection } from './HotDealsSection';
import { NewsletterBanner } from './NewsletterBanner';
import { PropertyCard } from '../ui/PropertyCard';
import { ProjectCard } from '../ui/ProjectCard';
import { SectionHeader } from '../ui/SectionHeader';
import { HorizontalCarousel } from '../ui/HorizontalCarousel';
import { MessageCircle, Phone } from 'lucide-react';
import { ClickToCallButton } from '../ui/ClickToCallButton';
import { getProperties, getProjects, type Property, type Project } from '../../lib/dbService';

const WHATSAPP_NUMBER = '93782222279';

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURED_PROPERTIES_LIMIT = 6;
const FEATURED_PROJECTS_LIMIT = 4;

function toPropertyCardProps(p: Property) {
  return {
    id: String(p.id),
    serialNumber: p.serial_number,
    title: p.title,
    price: p.price,
    location: p.location,
    beds: p.beds ?? undefined,
    baths: p.baths ?? undefined,
    area: p.area ?? undefined,
    floor: p.floor ?? undefined,
    status: p.status,
    type: p.type,
    listingType: p.listing_type,
    image: p.image_url,
  };
}

function toProjectCardProps(p: Project) {
  return {
    id: String(p.id),
    name: p.name,
    location: p.location,
    deliveryDate: p.delivery_date ?? undefined,
    status: p.status,
    availableUnits: p.available_units,
    image: p.image_url,
  };
}

// ── Filter types ──────────────────────────────────────────────────────────────

type FilterTab = 'All' | 'For Sale' | 'For Rent' | 'Commercial';
const FILTER_TABS: FilterTab[] = ['All', 'For Sale', 'For Rent', 'Commercial'];

// ── Main Component ────────────────────────────────────────────────────────────

export const LandingPageContent = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    Promise.all([getProperties(), getProjects()])
      .then(([props, projs]) => {
        setProperties(props.slice(0, FEATURED_PROPERTIES_LIMIT));
        setProjects(projs.slice(0, FEATURED_PROJECTS_LIMIT));
      })
      .catch(() => {
        setProperties([]);
        setProjects([]);
      })
      .finally(() => setLoadingFeatured(false));
  }, []);

  const featuredProperties = properties.map(toPropertyCardProps);
  const featuredProjects = projects.map(toProjectCardProps);

  const filteredProperties = featuredProperties.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'For Sale') return p.listingType === 'sale';
    if (activeFilter === 'For Rent') return p.listingType === 'rent';
    if (activeFilter === 'Commercial') return p.type === 'Commercial';
    return true;
  });

  return (
    <>
      <Hero3DSection featuredProperties={properties} />
      <TrustBadgesStrip />
      <PropertyTypesSection />

      {/* ── Featured Properties ───────────────────────────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-brand-ivory)' }}>
        <div className="container-custom">
          <SectionHeader
            eyebrow="Browse Listings"
            title="Individual Properties"
            subtitle="Standalone homes, apartments and commercial spaces available for sale or rent across Kabul's top districts."
            cta={{ label: 'View all properties', href: '/properties' }}
          />

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 mb-10 flex-wrap"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = tab === activeFilter;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className="relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                  style={{
                    background: isActive ? 'var(--color-brand-navy)' : 'rgba(255,255,255,0.55)',
                    color: isActive ? '#ffffff' : 'rgba(2,14,58,0.55)',
                    border: isActive ? '1.5px solid var(--color-brand-navy)' : '1.5px solid rgba(2,14,58,0.1)',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'var(--color-brand-navy)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loadingFeatured ? (
                <div className="py-20 text-center text-neutral-400 text-sm">Loading properties…</div>
              ) : filteredProperties.length > 0 ? (
                <HorizontalCarousel
                  items={filteredProperties}
                  cardWidth={340}
                  gap={24}
                  renderItem={(prop) => <PropertyCard {...prop} />}
                />
              ) : (
                <div className="py-20 text-center text-neutral-400 text-sm">
                  No properties match this filter.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <PromoBanner
        eyebrow="List With Us"
        title="List Your Property With Us"
        description="Get maximum visibility and the best value for your property, backed by our agents and marketing network."
        bullets={['Free property evaluation', 'Professional photography', 'Targeted marketing', 'Expert negotiation']}
        ctaLabel="List Your Property"
        ctaHref="/contact"
        imageSide="left"
      />

      <WhyAttaieSection />

      <PopularLocationsSection />

      <HowItWorksSection />

      <TrustBlock />

      <ServicesSection />

      <HotDealsSection />

      {/* ── Signature Projects ────────────────────────────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-brand-cream)' }}>
        <div className="container-custom">
          <SectionHeader
            eyebrow="Developments"
            title="Signature Projects"
            subtitle="Multi-unit residential developments offering off-plan and ready units across Kabul's growth corridors."
            cta={{ label: 'View all projects', href: '/projects' }}
          />

          {loadingFeatured ? (
            <div className="py-20 text-center text-neutral-400 text-sm">Loading projects…</div>
          ) : featuredProjects.length > 0 ? (
            <HorizontalCarousel
              items={featuredProjects}
              cardWidth={340}
              gap={24}
              renderItem={(proj) => <ProjectCard {...proj} />}
            />
          ) : (
            <div className="py-20 text-center text-neutral-400 text-sm">No projects available yet.</div>
          )}
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden" style={{ background: 'var(--color-brand-navy)' }}>
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(1,69,242,0.22) 0%, transparent 70%)',
          }}
        />
        {/* Islamic pattern overlay */}
        <div className="absolute inset-0 islamic-pattern opacity-25 pointer-events-none" />
        {/* Top/bottom gold rules */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(1,69,242,0.5), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(1,69,242,0.5), transparent)' }} />

        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.3em] mb-5 flex items-center justify-center gap-3"
            style={{ color: 'var(--color-brand-gold)' }}
          >
            <span className="inline-block w-8 h-px" style={{ background: 'rgba(1,69,242,0.4)' }} />
            Get in Touch
            <span className="inline-block w-8 h-px" style={{ background: 'rgba(1,69,242,0.4)' }} />
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Ready to Find Your<br />
            <span style={{ color: 'var(--color-brand-gold)' }}>Dream Property</span> in Kabul?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="text-base mb-12 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Our local experts know every district. Whether buying, renting, or investing —
            we'll find the right property for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.26 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              aria-label="Contact us via WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white transition-colors shadow-lg"
              style={{ background: '#25D366', boxShadow: '0 8px 28px rgba(37,211,102,0.35)' }}
            >
              <MessageCircle size={20} aria-hidden="true" /> WhatsApp Us
            </motion.a>
            <motion.a
              href="tel:+93782222279"
              aria-label="Call us"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-white transition-colors"
              style={{
                background: 'var(--color-brand-gold)',
                boxShadow: '0 8px 28px rgba(1,69,242,0.4)',
              }}
            >
              <Phone size={20} aria-hidden="true" /> +93 782 222 279
            </motion.a>
            <ClickToCallButton
              className="px-8 py-4 rounded-2xl font-bold text-base"
            />
          </motion.div>
        </div>
      </section>

      <NewsletterBanner />
    </>
  );
};
