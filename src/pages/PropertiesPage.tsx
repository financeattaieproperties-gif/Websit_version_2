import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Bed, Bath, Maximize2, Layers, MapPin, CalendarDays, Building2, ArrowUpRight, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SearchBar } from '../components/forms/SearchBar';
import { FilterSidebar, FilterState } from '../components/property/FilterSidebar';
import { PropertyCard } from '../components/ui/PropertyCard';
import { ProjectCard } from '../components/ui/ProjectCard';
import { PropertyCardSkeleton } from '../components/ui/PropertyCardSkeleton';
import { VisitRequestDialog, type VisitTarget } from '../components/forms/VisitRequestDialog';
import { QuickContactModal } from '../components/forms/QuickContactModal';
import {
  getProperties,
  getProjects,
  getAllProjectUnits,
  type Property,
  type Project,
  type ProjectUnit,
} from '../lib/dbService';
import { SeoHead } from '../components/seo/SeoHead';
import { buildPropertiesListingSeo } from '../lib/seoConfig';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

const defaultFilters: FilterState = {
  purpose: 'buy',
  type: [],
  minPrice: 0,
  maxPrice: 2000000,
  minArea: 0,
  maxArea: 1000,
  beds: [],
  baths: [],
  status: [],
};

function ProjectUnitInventoryCard({
  unit,
  onRequestVisit,
}: {
  unit: ProjectUnit;
  onRequestVisit: (target: VisitTarget) => void;
}) {
  const { t } = useTranslation();
  const [quickContactOpen, setQuickContactOpen] = useState(false);
  const projectLabel = unit.project_name || `Project #${unit.project_id}`;
  const unitHref = `/projects/${unit.project_id}#unit-${unit.id}`;
  const bookable = !['sold', 'rented'].includes(unit.status);
  const unitTitle = unit.title || `${projectLabel} — ${t('projectUnits.unitPrefix', { number: unit.unit_number })}`;
  const priceDisplay = unit.price !== null ? `$${Number(unit.price).toLocaleString()}` : 'Price on request';

  return (
    <>
      <div className="group bg-white rounded-2xl overflow-hidden border border-brand-navy/8 shadow-brand-sm hover:shadow-brand-lg transition-all duration-300 flex flex-col h-full">
        <Link to={unitHref} className="relative block aspect-[16/10] overflow-hidden bg-brand-navy">
          {unit.image_url ? (
            <img
              src={unit.image_url}
              alt={`${projectLabel} — ${unit.unit_number}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              <Building2 size={36} />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-navy/90 text-white backdrop-blur-xs">
              {t('projectUnits.projectApartmentBadge')}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-brand-gold text-white">
              {unit.status}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg">
              {projectLabel} · {t('projectUnits.unitPrefix', { number: unit.unit_number })}
            </span>
          </div>
        </Link>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-1">
              {projectLabel}
            </p>
            <Link to={unitHref} className="block group-hover:text-brand-gold transition-colors">
              <h3 className="text-lg font-bold text-brand-navy line-clamp-1">
                {unitTitle}
              </h3>
            </Link>
            {unit.project_location && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin size={13} className="text-brand-gold shrink-0" />
                <span className="truncate">{unit.project_location}</span>
              </p>
            )}

            <div
              aria-label="Apartment features"
              className="mt-4 grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-2.5 text-xs font-semibold text-neutral-600 pt-3 border-t border-neutral-100"
            >
              {unit.beds !== null && (
                <div className="flex items-center gap-2" title={t('projectUnits.beds', { count: unit.beds })}>
                  <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Bed size={14} aria-hidden="true" />
                  </span>
                  <span>{t('projectUnits.beds', { count: unit.beds })}</span>
                </div>
              )}
              {unit.baths !== null && (
                <div className="flex items-center gap-2" title={t('projectUnits.baths', { count: unit.baths })}>
                  <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Bath size={14} aria-hidden="true" />
                  </span>
                  <span>{t('projectUnits.baths', { count: unit.baths })}</span>
                </div>
              )}
              {unit.area !== null && (
                <div className="flex items-center gap-2" title={`${unit.area} m²`}>
                  <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Maximize2 size={13} aria-hidden="true" />
                  </span>
                  <span>{unit.area} m²</span>
                </div>
              )}
              {unit.floor !== null && (
                <div className="flex items-center gap-2" title={t('projectUnits.floor', { floor: unit.floor })}>
                  <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Layers size={13} aria-hidden="true" />
                  </span>
                  <span>{t('projectUnits.floor', { floor: unit.floor })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
            <div>
              {unit.price !== null ? (
                <p className="text-lg font-bold text-brand-gold">
                  ${Number(unit.price).toLocaleString()}
                </p>
              ) : (
                <p className="text-sm font-semibold text-neutral-500">Price on request</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setQuickContactOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-gold transition-colors"
              >
                <MessageSquare size={13} />
                <span>Inquire Now</span>
              </button>
              {bookable && (
                <button
                  type="button"
                  onClick={() =>
                    onRequestVisit({
                      label: `${projectLabel} — ${t('projectUnits.unitPrefix', { number: unit.unit_number })}`,
                      projectId: unit.project_id,
                      projectUnitId: unit.id,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-gold px-3 py-1.5 text-xs font-bold text-brand-gold hover:bg-brand-gold hover:text-white transition-colors"
                >
                  <CalendarDays size={13} />
                  {t('projectUnits.requestVisit')}
                </button>
              )}
              <Link
                to={unitHref}
                className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-bold text-brand-navy hover:bg-neutral-200 transition-colors"
                title={t('projectUnits.viewInProject', { project: projectLabel })}
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <QuickContactModal
        open={quickContactOpen}
        onClose={() => setQuickContactOpen(false)}
        property={{
          id: `unit-${unit.id}`,
          serialNumber: unit.unit_number,
          title: unitTitle,
          priceDisplay,
          location: unit.project_location || 'Kabul, Afghanistan',
          type: 'Project Apartment',
          listingType: 'sale',
          image: unit.image_url,
        }}
      />
    </>
  );
}

function PropertiesContent() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'individual';
  const isProjects = category === 'projects';

  const initialPurposeParam = searchParams.get('purpose');
  const initialPurpose: FilterState['purpose'] =
    initialPurposeParam === 'rent' || initialPurposeParam === 'commercial' ? initialPurposeParam : 'buy';
  const initialTypeParam = searchParams.get('type');

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [allProjectUnits, setAllProjectUnits] = useState<ProjectUnit[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilters,
    purpose: initialPurpose,
    type: initialTypeParam ? [initialTypeParam] : [],
  }));
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('search') ?? searchParams.get('serial_number') ?? ''
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitTarget, setVisitTarget] = useState<VisitTarget | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    if (isProjects) {
      getProjects()
        .then((data) => setAllProjects(data))
        .catch(() => setError('Failed to load. Please try again.'))
        .finally(() => setLoading(false));
    } else {
      Promise.all([getProperties(), getAllProjectUnits()])
        .then(([propsData, unitsResp]) => {
          setAllProperties(propsData);
          setAllProjectUnits(unitsResp.items);
        })
        .catch(() => setError('Failed to load. Please try again.'))
        .finally(() => setLoading(false));
    }
  }, [isProjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync when URL search params change externally (e.g. from Navbar or Hero search)
  useEffect(() => {
    const urlTerm = searchParams.get('search') ?? searchParams.get('serial_number') ?? '';
    setSearchQuery(urlTerm);
    const urlPurpose = searchParams.get('purpose');
    if (urlPurpose === 'buy' || urlPurpose === 'rent' || urlPurpose === 'commercial') {
      setFilters((prev) => ({ ...prev, purpose: urlPurpose }));
    }
  }, [searchParams]);

  const handleSearchChange = (nextQuery: string) => {
    setSearchQuery(nextQuery);
    const nextParams = new URLSearchParams(searchParams);
    if (nextQuery.trim()) {
      nextParams.set('search', nextQuery.trim());
    } else {
      nextParams.delete('search');
      nextParams.delete('serial_number');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handlePurposeChange = (purpose: FilterState['purpose']) => {
    setFilters((prev) => ({
      ...prev,
      purpose,
      type: purpose === 'commercial' && !prev.type.includes('Commercial') ? ['Commercial'] : prev.type,
    }));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Real-time filtered standalone properties (matches title, location, or serial_number + sidebar filters)
  const properties = allProperties.filter((p) => {
    if (normalizedQuery) {
      const matchesTitle = p.title.toLowerCase().includes(normalizedQuery);
      const matchesLocation = p.location.toLowerCase().includes(normalizedQuery);
      const matchesSerial = (p.serial_number ?? '').toLowerCase().includes(normalizedQuery);
      if (!matchesTitle && !matchesLocation && !matchesSerial) {
        return false;
      }
    }

    if (filters.type.length > 0 && !filters.type.includes(p.type)) {
      return false;
    }

    if (filters.purpose === 'rent' && p.listing_type !== 'rent') {
      return false;
    }
    if (filters.purpose === 'commercial' && p.type !== 'Commercial') {
      return false;
    }
    if (filters.purpose === 'buy' && filters.status.length > 0 && p.listing_type !== 'sale') {
      return false;
    }

    if (p.price < filters.minPrice || p.price > filters.maxPrice) {
      return false;
    }

    if (p.area !== null && (p.area < filters.minArea || p.area > filters.maxArea)) {
      return false;
    }

    if (filters.beds.length > 0) {
      if (p.beds === null || p.beds === undefined) return false;
      const bedMatch = filters.beds.some((b) =>
        b === 'Studio' ? p.beds === 0 : b === '5+' ? (p.beds ?? 0) >= 5 : p.beds === Number(b)
      );
      if (!bedMatch) return false;
    }

    if (filters.baths.length > 0) {
      if (p.baths === null || p.baths === undefined) return false;
      const bathMatch = filters.baths.some((b) =>
        b === '4+' ? (p.baths ?? 0) >= 4 : p.baths === Number(b)
      );
      if (!bathMatch) return false;
    }

    if (filters.status.length > 0 && !filters.status.includes(p.status)) {
      return false;
    }

    return true;
  });

  // Real-time filtered project units (matches unit_number, title, project_name, or project_location + sidebar filters)
  const projectUnits = allProjectUnits.filter((u) => {
    if (normalizedQuery) {
      const matchesUnitNumber = u.unit_number.toLowerCase().includes(normalizedQuery);
      const matchesTitle = (u.title ?? '').toLowerCase().includes(normalizedQuery);
      const matchesProjectName = (u.project_name ?? '').toLowerCase().includes(normalizedQuery);
      const matchesLocation = (u.project_location ?? '').toLowerCase().includes(normalizedQuery);
      if (!matchesUnitNumber && !matchesTitle && !matchesProjectName && !matchesLocation) {
        return false;
      }
    }

    if (filters.type.length > 0 && !filters.type.includes('Apartment')) {
      return false;
    }
    if (filters.purpose === 'rent' || filters.purpose === 'commercial') {
      return false;
    }
    if (u.price !== null && (u.price < filters.minPrice || u.price > filters.maxPrice)) {
      return false;
    }
    if (u.area !== null && (u.area < filters.minArea || u.area > filters.maxArea)) {
      return false;
    }
    if (filters.beds.length > 0) {
      if (u.beds === null) return false;
      const bedMatch = filters.beds.some((b) =>
        b === 'Studio' ? u.beds === 0 : b === '5+' ? (u.beds ?? 0) >= 5 : u.beds === Number(b)
      );
      if (!bedMatch) return false;
    }
    if (filters.baths.length > 0) {
      if (u.baths === null) return false;
      const bathMatch = filters.baths.some((b) =>
        b === '4+' ? (u.baths ?? 0) >= 4 : u.baths === Number(b)
      );
      if (!bathMatch) return false;
    }
    if (filters.status.length > 0) {
      const mappedStatus = u.status === 'reserved' ? 'pending' : u.status;
      if (!filters.status.includes(mappedStatus)) return false;
    }

    return true;
  });

  // Real-time filtered projects when viewing projects tab
  const projects = allProjects.filter((proj) => {
    if (!normalizedQuery) return true;
    return (
      proj.name.toLowerCase().includes(normalizedQuery) ||
      proj.location.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalInventoryCount = properties.length + projectUnits.length;
  const seo = buildPropertiesListingSeo({ isProjects, search: searchQuery.trim() });

  return (
    <main className="min-h-screen bg-brand-ivory flex flex-col">
      <SeoHead
        seo={searchQuery.trim() || isProjects ? seo : undefined}
        context={{
          purpose: filters.purpose,
          propertyTypes: filters.type,
        }}
      />
      <Navbar />

      <div className="relative bg-brand-navy pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        <div className="container-custom relative z-10">
          <Breadcrumbs
            variant="light"
            items={[
              {
                label: isProjects
                  ? t('nav.projects', 'Signature Projects')
                  : t('nav.properties', 'Properties'),
              },
            ]}
            className="mb-4"
          />
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-[1px] bg-brand-gold/50" />
            Kabul, Afghanistan
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            {isProjects ? 'Signature Projects' : 'Browse Properties'}
          </h1>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            purpose={filters.purpose}
            onPurposeChange={handlePurposeChange}
          />
        </div>
      </div>

      {/* Tab bar with sliding active indicator */}
      <div className="bg-white/95 backdrop-blur-md border-b border-neutral-100 sticky top-0 z-40 shadow-sm">
        <div className="container-custom flex gap-1 py-3">
          {[
            { label: 'Individual Properties', href: '/properties?category=individual', active: !isProjects },
            { label: 'Signature Projects', href: '/projects', active: isProjects },
          ].map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${
                tab.active ? 'text-white' : 'text-neutral-500 hover:text-brand-navy hover:bg-neutral-100'
              }`}
            >
              {tab.active && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-brand-navy rounded-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="container-custom py-12 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          {!isProjects && (
            <aside className="w-full lg:w-72 shrink-0">
              <FilterSidebar filters={filters} onChange={setFilters} className="sticky top-24" />
            </aside>
          )}

          <div className="flex-1">
            {/* Error state with retry */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between gap-4">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={loadData}
                  className="text-sm font-semibold underline shrink-0 hover:text-red-900"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-brand-gold rounded-full" />
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={loading ? 'loading' : isProjects ? projects.length : totalInventoryCount}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-bold text-brand-navy"
                  >
                    {loading
                      ? 'Loading…'
                      : isProjects
                      ? `${projects.length} Projects Available`
                      : `${totalInventoryCount} Properties Found`}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : isProjects ? (
              <motion.div
                key="projects"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              >
                {projects.map((proj) => (
                  <motion.div
                    key={proj.id}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.97 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                    }}
                  >
                    <ProjectCard
                      id={String(proj.id)}
                      name={proj.name}
                      location={proj.location}
                      deliveryDate={proj.delivery_date ?? undefined}
                      status={proj.status}
                      availableUnits={proj.available_units}
                      image={proj.image_url}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <>
                {!loading && totalInventoryCount === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6">
                      <SlidersHorizontal size={32} className="text-brand-gold" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-2">No properties match your filters</h3>
                    <p className="text-neutral-500 mb-6 max-w-xs">
                      Try adjusting your search criteria to see more results.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(defaultFilters);
                        handleSearchChange('');
                      }}
                      className="px-6 py-2.5 bg-brand-navy text-white rounded-lg font-semibold text-sm hover:bg-brand-navy-light transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}

                {totalInventoryCount > 0 && (
                  <motion.div
                    key="properties"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                  >
                    {properties.map((prop) => (
                      <motion.div
                        key={`prop-${prop.id}`}
                        variants={{
                          hidden: { opacity: 0, y: 20, scale: 0.97 },
                          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                        }}
                      >
                        <PropertyCard
                          id={String(prop.id)}
                          serialNumber={prop.serial_number}
                          title={prop.title}
                          price={prop.price}
                          location={prop.location}
                          beds={prop.beds ?? undefined}
                          baths={prop.baths ?? undefined}
                          area={prop.area ?? undefined}
                          floor={prop.floor ?? undefined}
                          status={prop.status}
                          type={prop.type}
                          listingType={prop.listing_type}
                          image={prop.image_url}
                        />
                      </motion.div>
                    ))}
                    {projectUnits.map((unit) => (
                      <motion.div
                        key={`unit-${unit.id}`}
                        variants={{
                          hidden: { opacity: 0, y: 20, scale: 0.97 },
                          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
                        }}
                      >
                        <ProjectUnitInventoryCard
                          unit={unit}
                          onRequestVisit={setVisitTarget}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {visitTarget && (
        <VisitRequestDialog
          target={visitTarget}
          onClose={() => setVisitTarget(null)}
        />
      )}

      <Footer />
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}

