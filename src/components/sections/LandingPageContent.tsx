import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  MapPin,
  Building2,
  Bed,
  CircleDollarSign,
  Search,
  ShieldCheck,
  Users,
  Home,
  Store,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Calendar,
} from 'lucide-react';
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
import { ClickToCallButton } from '../ui/ClickToCallButton';
import { getProperties, getProjects, type Property, type Project } from '../../lib/dbService';
import defaultExteriorImg from '../../assets/images/project_exterior_elevation_1793995966183.jpg';
import stitchHeroImg from '../../assets/images/stitch_hero_kabul_panorama.jpg';
import stitchInteriorImg from '../../assets/images/stitch_apartment_interior.jpg';
import stitchVillaImg from '../../assets/images/stitch_villa_exterior.jpg';
import categoryHousesImg from '../../assets/images/category_houses_villa_1794037428658.jpg';
import categoryCommercialImg from '../../assets/images/category_commercial_plaza_1794037429778.jpg';
import categoryProjectsImg from '../../assets/images/category_master_projects_1794037429266.jpg';

const WHATSAPP_NUMBER = '93782222279';

const FALLBACK_SHOWCASE_PROPERTIES: Property[] = [
  {
    id: 101,
    serial_number: 'ATP-101',
    title: 'Wazir Akbar Khan Luxury Residence',
    price: 185000,
    location: 'Street 10, Wazir Akbar Khan, Kabul',
    beds: 4,
    baths: 3,
    area: 220,
    floor: 5,
    status: 'available',
    type: 'Apartment',
    listing_type: 'sale',
    image_url: stitchInteriorImg,
    gallery_images: [stitchInteriorImg],
    video_url: null,
    floor_plan_url: null,
    three_d_plan_url: null,
    description:
      'Sunlit luxury 4-bedroom apartment featuring panoramic mountain views, marble flooring, and 24/7 solar-hybrid backup power.',
    created_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 102,
    serial_number: 'ATP-102',
    title: 'Kabul Plaza Saljuqi — Corner Suite',
    price: 142000,
    location: 'Ansari Square, Shahr-e-Naw, Kabul',
    beds: 3,
    baths: 2,
    area: 175,
    floor: 4,
    status: 'available',
    type: 'Apartment',
    listing_type: 'sale',
    image_url: stitchHeroImg,
    gallery_images: [stitchHeroImg],
    video_url: null,
    floor_plan_url: null,
    three_d_plan_url: null,
    description:
      'Modern corner apartment in Shahr-e-Naw with glass wrap-around balconies, underground parking, and dedicated security.',
    created_at: '2026-02-03T08:00:00Z',
  },
  {
    id: 103,
    serial_number: 'ATP-103',
    title: 'Karte Parwan Panoramic Hillside Villa',
    price: 1800,
    location: 'Karte Parwan, District 2, Kabul',
    beds: 5,
    baths: 4,
    area: 420,
    floor: 2,
    status: 'available',
    type: 'Villa',
    listing_type: 'rent',
    image_url: stitchVillaImg,
    gallery_images: [stitchVillaImg],
    video_url: null,
    floor_plan_url: null,
    three_d_plan_url: null,
    description:
      'Executive residence with private landscaped courtyard, formal Mehmankhana reception hall, and diplomatic-grade security.',
    created_at: '2026-02-05T08:00:00Z',
  },
];

const FALLBACK_PREVIEW_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Kabul Plaza Saljuqi',
    location: 'Ansari Square, Shahr-e-Naw, Kabul',
    delivery_date: 'Q4 2027',
    status: 'In Progress',
    available_units: 21,
    total_units: 42,
    image_url: defaultExteriorImg,
    gallery_images: [defaultExteriorImg],
    video_url: null,
    masterplan_image: null,
    description:
      'Residential & Commercial landmark in Shahr-e-Naw featuring luxury apartments and retail spaces.',
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 2,
    name: 'Attaie Signature Towers',
    location: 'Street 10, Wazir Akbar Khan, Kabul',
    delivery_date: 'Q2 2027',
    status: 'In Progress',
    available_units: 14,
    total_units: 36,
    image_url: categoryProjectsImg,
    gallery_images: [categoryProjectsImg],
    video_url: null,
    masterplan_image: null,
    description:
      'Multi-tower diplomatic district residences with rooftop sky gardens and seismic-grade engineering.',
    created_at: '2026-01-20T08:00:00Z',
  },
  {
    id: 3,
    name: 'Shahr-e-Naw Executive Center',
    location: 'Park Road, Shahr-e-Naw, Kabul',
    delivery_date: 'Ready 2026',
    status: 'Ready',
    available_units: 9,
    total_units: 28,
    image_url: categoryCommercialImg,
    gallery_images: [categoryCommercialImg],
    video_url: null,
    masterplan_image: null,
    description:
      'Grade-A commercial suites and luxury penthouse apartments overlooking Shahr-e-Naw.',
    created_at: '2026-01-25T08:00:00Z',
  },
];

const FEATURED_PROPERTIES_LIMIT = 6;
const FEATURED_PROJECTS_LIMIT = 8;

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

type FilterTab = 'All' | 'For Sale' | 'For Rent' | 'Commercial';
const FILTER_TABS: FilterTab[] = ['All', 'For Sale', 'For Rent', 'Commercial'];

const KABUL_LOCATIONS = [
  { label: 'All Kabul', value: '' },
  { label: 'Wazir Akbar Khan', value: 'Wazir Akbar Khan' },
  { label: 'Shahr-e-Naw', value: 'Shahr-e-Naw' },
  { label: 'Karte Parwan', value: 'Karte Parwan' },
  { label: 'Karte Char', value: 'Karte Char' },
  { label: 'Darulaman', value: 'Darulaman' },
  { label: 'Microrayan', value: 'Microrayan' },
];

const PROPERTY_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Apartments', value: 'Apartment' },
  { label: 'Houses', value: 'House' },
  { label: 'Villas', value: 'Villa' },
  { label: 'Commercial', value: 'Commercial' },
];

const BEDROOM_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '1+ Bedroom', value: '1' },
  { label: '2+ Bedrooms', value: '2' },
  { label: '3+ Bedrooms', value: '3' },
  { label: '4+ Bedrooms', value: '4' },
  { label: '5+ Bedrooms', value: '5+' },
];

const BUDGET_OPTIONS = [
  { label: 'Any Budget', value: '' },
  { label: 'Under $100,000', value: '100000' },
  { label: 'Up to $250,000', value: '250000' },
  { label: 'Up to $500,000', value: '500000' },
  { label: '$500,000+', value: '1000000' },
];

/**
 * 21st.dev + motion.dev Interactive Featured Project Carousel Card
 * Dynamically cycles through projects fetched from the database with spring physics,
 * pointer parallax, swipe gestures, and animated progress indicators.
 */
function FeaturedProjectMotionCarousel({ projects }: { projects: Project[] }) {
  const safeProjects = projects.length > 0 ? projects : FALLBACK_PREVIEW_PROJECTS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Motion values for 21st.dev subtle 3D pointer parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 260, damping: 26 });
  const smoothY = useSpring(mouseY, { stiffness: 260, damping: 26 });
  const imgX = useTransform(smoothX, [-0.5, 0.5], ['6px', '-6px']);
  const imgY = useTransform(smoothY, [-0.5, 0.5], ['6px', '-6px']);

  const total = safeProjects.length;
  const currentProject = safeProjects[activeIndex % total] || safeProjects[0];

  const paginate = useCallback(
    (newDirection: number) => {
      if (total <= 1) return;
      setDirection(newDirection);
      setActiveIndex((prev) => (prev + newDirection + total) % total);
    },
    [total]
  );

  // Auto-advance every 5.5 seconds when not hovered
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, total, paginate]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 48 : -48,
      opacity: 0,
      scale: 0.97,
      filter: 'blur(4px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -48 : 48,
      opacity: 0,
      scale: 0.97,
      filter: 'blur(4px)',
    }),
  };

  return (
    <motion.div
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-brand-ivory via-white to-brand-gold-lt/40 border border-brand-navy/10 shadow-brand-md relative flex flex-col justify-between min-h-[230px] select-none group"
    >
      {/* Subtle Islamic geometric pattern accent */}
      <div className="absolute inset-0 islamic-pattern-light opacity-30 pointer-events-none" />

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentProject.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 320, damping: 32 },
            opacity: { duration: 0.25 },
            scale: { duration: 0.3 },
            filter: { duration: 0.25 },
          }}
          drag={total > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_e, { offset }) => {
            if (offset.x < -45) paginate(1);
            else if (offset.x > 45) paginate(-1);
          }}
          className="relative flex-1 flex items-center min-h-[195px]"
        >
          {/* Right Side Architectural Visual with 21st.dev Spring Parallax */}
          <div className="w-[48%] sm:w-[46%] h-full absolute right-0 top-0 bottom-0 overflow-hidden">
            <motion.img
              src={currentProject.image_url || defaultExteriorImg}
              onError={(e) => {
                e.currentTarget.src = defaultExteriorImg;
              }}
              alt={currentProject.name}
              referrerPolicy="no-referrer"
              style={{ x: imgX, y: imgY, scale: 1.07 }}
              className="w-full h-full object-cover object-center transition-transform duration-500"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-brand-ivory) 0%, rgba(237,241,245,0.35) 38%, transparent 100%)',
              }}
            />
            {/* Status pill badge in top-right of image */}
            {currentProject.status && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-brand-navy/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                {currentProject.status}
              </span>
            )}
          </div>

          {/* Left Side Project Information */}
          <div className="relative z-10 p-6 sm:p-7 max-w-[64%] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="eyebrow tracking-[0.2em]">FEATURED PROJECT</span>
                {total > 1 && (
                  <span className="text-[10px] font-bold text-brand-navy/50 tabular-nums">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-brand-navy leading-tight line-clamp-2">
                {currentProject.name}
              </h3>

              <p className="text-xs font-medium text-neutral-600 mt-1 flex items-center gap-1.5 truncate">
                <MapPin size={12} className="text-brand-gold shrink-0" />
                <span className="truncate">
                  {currentProject.location || 'Residential & Commercial'}
                </span>
              </p>

              {/* Micro specs row */}
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] font-semibold text-brand-navy/75">
                {currentProject.available_units !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={12} className="text-brand-gold" />
                    <span className="tabular-nums font-bold text-brand-navy">
                      {currentProject.available_units}
                    </span>{' '}
                    Units Open
                  </span>
                )}
                {currentProject.delivery_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} className="text-brand-gold" />
                    <span>{currentProject.delivery_date}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-1 flex items-center gap-2">
              <Link
                to={`/projects/${currentProject.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-navy font-bold text-xs shadow-brand-sm border border-brand-navy/10 hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all"
              >
                <span>View Apartments</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom 21st.dev Carousel Navigation Bar */}
      {total > 1 && (
        <div className="relative z-20 px-6 pb-3.5 pt-2 border-t border-brand-navy/8 bg-white/70 backdrop-blur-xs flex items-center justify-between gap-3">
          {/* Animated Pill Dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured projects">
            {safeProjects.map((proj, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={proj.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Show project ${proj.name}`}
                  onClick={() => {
                    setDirection(idx > activeIndex ? 1 : -1);
                    setActiveIndex(idx);
                  }}
                  className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-7 bg-brand-gold/25' : 'w-2 bg-brand-navy/20 hover:bg-brand-navy/40'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="featured-project-active-dot"
                      className="absolute inset-0 bg-brand-gold rounded-full"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous featured project"
              className="w-7 h-7 rounded-lg bg-white border border-brand-navy/10 text-brand-navy hover:bg-brand-gold hover:text-white hover:border-brand-gold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next featured project"
              className="w-7 h-7 rounded-lg bg-white border border-brand-navy/10 text-brand-navy hover:bg-brand-gold hover:text-white hover:border-brand-gold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export const LandingPageContent = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [activeCategory, setActiveCategory] = useState<string>('Apartments');
  const [properties, setProperties] = useState<Property[]>(FALLBACK_SHOWCASE_PROPERTIES);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PREVIEW_PROJECTS);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Hero Search Bar state
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBeds, setSelectedBeds] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  useEffect(() => {
    Promise.all([
      getProperties().catch(() => FALLBACK_SHOWCASE_PROPERTIES),
      getProjects().catch(() => FALLBACK_PREVIEW_PROJECTS),
    ])
      .then(([props, projs]) => {
        const validProps =
          Array.isArray(props) && props.length > 0 ? props : FALLBACK_SHOWCASE_PROPERTIES;
        setProperties(validProps.slice(0, FEATURED_PROPERTIES_LIMIT));

        if (Array.isArray(projs) && projs.length > 0) {
          // If the database has only 1 project, append distinct showcase projects so the carousel is rich and interactive
          const mergedProjects =
            projs.length >= 2
              ? projs
              : [
                  ...projs,
                  ...FALLBACK_PREVIEW_PROJECTS.filter(
                    (fb) => !projs.some((dbProj) => dbProj.id === fb.id || dbProj.name === fb.name)
                  ),
                ];
          setProjects(mergedProjects.slice(0, FEATURED_PROJECTS_LIMIT));
        } else {
          setProjects(FALLBACK_PREVIEW_PROJECTS);
        }
      })
      .finally(() => setLoadingFeatured(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedLocation) params.set('search', selectedLocation);
    if (selectedType) params.set('type', selectedType);
    if (selectedType === 'Commercial') params.set('purpose', 'commercial');
    const qs = params.toString();
    navigate(qs ? `/properties?${qs}` : '/properties');
  };

  const featuredProperties = properties.map(toPropertyCardProps);
  const featuredProjects = projects.map(toProjectCardProps);

  const filteredProperties = featuredProperties.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'For Sale') return p.listingType === 'sale';
    if (activeFilter === 'For Rent') return p.listingType === 'rent';
    if (activeFilter === 'Commercial') return p.type === 'Commercial';
    return true;
  });

  // All 4 Category Cards now feature bespoke architectural photography
  const categories = [
    {
      id: 'Apartments',
      label: 'Apartments',
      href: '/properties?type=Apartment',
      icon: Building2,
      image: defaultExteriorImg,
    },
    {
      id: 'Houses',
      label: 'Houses',
      href: '/properties?type=House',
      icon: Home,
      image: categoryHousesImg,
    },
    {
      id: 'Commercial',
      label: 'Commercial',
      href: '/properties?purpose=commercial&type=Commercial',
      icon: Store,
      image: categoryCommercialImg,
    },
    {
      id: 'Projects',
      label: 'Projects',
      href: '/projects',
      icon: Layers,
      image: categoryProjectsImg,
    },
  ];

  return (
    <>
      {/* ── 1. STITCH ARCHITECTURAL HERO SECTION + FLOATING SEARCH BAR ── */}
      <section className="relative pt-24 lg:pt-28 pb-12 overflow-hidden bg-brand-cream">
        {/* Full-bleed Kabul Architectural Hero Backdrop */}
        <div className="relative min-h-[540px] lg:min-h-[600px] flex flex-col justify-between">
          <div className="absolute inset-0 z-0">
            <img
              src={stitchHeroImg}
              alt="Attaie Properties — Modern Real Estate in Kabul, Afghanistan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-right-top"
            />
            {/* Measured contrast scrim so left-side typography in brand-navy is crisp and readable */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(245,247,251,0.96) 0%, rgba(245,247,251,0.88) 38%, rgba(245,247,251,0.28) 68%, rgba(245,247,251,0.05) 100%)',
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-32"
              style={{
                background:
                  'linear-gradient(to top, var(--color-brand-cream) 10%, rgba(245,247,251,0) 100%)',
              }}
            />
          </div>

          {/* Left Column Hero Copy */}
          <div className="container-custom relative z-10 pt-10 lg:pt-16 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl"
            >
              <span className="eyebrow inline-block mb-3 tracking-[0.22em]">
                REAL ESTATE IN KABUL
              </span>

              <h1 className="font-display font-extrabold text-brand-navy text-display tracking-tight leading-[1.06] mb-5">
                Find Your
                <br />
                Ideal Property
              </h1>

              <p className="text-neutral-600 text-base md:text-lg leading-relaxed max-w-md mb-7">
                Apartments, houses and investment opportunities in Kabul with the trust of Attaie
                Properties.
              </p>

              {/* 3 Trust Pillars */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-brand-navy">
                  <span className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <ShieldCheck size={17} />
                  </span>
                  <span>Trusted Company</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-brand-navy">
                  <span className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Building2 size={17} />
                  </span>
                  <span>Quality Projects</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-brand-navy">
                  <span className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                    <Users size={17} />
                  </span>
                  <span>Professional Agents</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating Horizontal Search Card */}
          <div className="container-custom relative z-20 pb-2">
            <motion.form
              onSubmit={handleHeroSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl p-3 md:p-4 shadow-brand-xl border border-brand-navy/8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-0 items-center"
            >
              {/* 1. Location */}
              <div className="lg:col-span-3 flex items-center gap-3 px-4 py-2 lg:border-r border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="hero-location"
                    className="block text-[11px] font-semibold text-neutral-500"
                  >
                    Location
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="hero-location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none bg-transparent font-bold text-sm text-brand-navy pr-5 focus:outline-none cursor-pointer truncate"
                    >
                      {KABUL_LOCATIONS.map((loc) => (
                        <option key={loc.label} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="text-neutral-500 pointer-events-none absolute right-0"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Property Type */}
              <div className="lg:col-span-3 flex items-center gap-3 px-4 py-2 lg:border-r border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="hero-type"
                    className="block text-[11px] font-semibold text-neutral-500"
                  >
                    Property Type
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="hero-type"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full appearance-none bg-transparent font-bold text-sm text-brand-navy pr-5 focus:outline-none cursor-pointer truncate"
                    >
                      {PROPERTY_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="text-neutral-500 pointer-events-none absolute right-0"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Bedrooms */}
              <div className="lg:col-span-2 flex items-center gap-3 px-4 py-2 lg:border-r border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                  <Bed size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="hero-beds"
                    className="block text-[11px] font-semibold text-neutral-500"
                  >
                    Bedrooms
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="hero-beds"
                      value={selectedBeds}
                      onChange={(e) => setSelectedBeds(e.target.value)}
                      className="w-full appearance-none bg-transparent font-bold text-sm text-brand-navy pr-5 focus:outline-none cursor-pointer truncate"
                    >
                      {BEDROOM_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="text-neutral-500 pointer-events-none absolute right-0"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Budget */}
              <div className="lg:col-span-2 flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                  <CircleDollarSign size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="hero-budget"
                    className="block text-[11px] font-semibold text-neutral-500"
                  >
                    Budget
                  </label>
                  <div className="relative flex items-center">
                    <select
                      id="hero-budget"
                      value={selectedBudget}
                      onChange={(e) => setSelectedBudget(e.target.value)}
                      className="w-full appearance-none bg-transparent font-bold text-sm text-brand-navy pr-5 focus:outline-none cursor-pointer truncate"
                    >
                      {BUDGET_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="text-neutral-500 pointer-events-none absolute right-0"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Search CTA Button */}
              <div className="lg:col-span-2 pl-0 lg:pl-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-gold-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <Search size={17} />
                  <span>Search Properties</span>
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>

      {/* ── 2. MIDDLE SPLIT SECTION: EXPLORE BY CATEGORY + DYNAMIC FEATURED PROJECT CAROUSEL ── */}
      <section className="py-10 bg-brand-cream">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Explore by Category (all 4 cards with architectural photography) */}
            <div className="lg:col-span-7 flex flex-col justify-between lg:pr-6 lg:border-r border-neutral-200/80">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-navy mb-5">
                Explore by Category
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isHighlighted = activeCategory === cat.id;

                  return (
                    <motion.div
                      key={cat.id}
                      whileHover={{ y: -4 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                      className="h-full"
                    >
                      <Link
                        to={cat.href}
                        onMouseEnter={() => setActiveCategory(cat.id)}
                        className={`group h-full rounded-2xl overflow-hidden bg-white transition-all duration-300 flex flex-col justify-between ${
                          isHighlighted
                            ? 'border-2 border-brand-gold shadow-brand-md'
                            : 'border border-brand-navy/10 hover:border-brand-gold shadow-brand-sm'
                        }`}
                      >
                        <div className="relative h-28 w-full overflow-hidden bg-brand-navy">
                          <img
                            src={cat.image}
                            alt={cat.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-transparent to-transparent" />
                          <span
                            className={`absolute bottom-2 left-2.5 w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-xs transition-colors ${
                              isHighlighted
                                ? 'bg-brand-gold text-white'
                                : 'bg-white/90 text-brand-navy group-hover:bg-brand-gold group-hover:text-white'
                            }`}
                          >
                            <Icon size={14} />
                          </span>
                        </div>
                        <div className="py-3.5 px-3 text-center bg-white flex items-center justify-center">
                          <span
                            className={`font-display font-bold text-sm transition-colors ${
                              isHighlighted
                                ? 'text-brand-gold'
                                : 'text-brand-navy group-hover:text-brand-gold'
                            }`}
                          >
                            {cat.label}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Dynamic 21st.dev + motion.dev Featured Project Carousel */}
            <div className="lg:col-span-5 flex">
              <FeaturedProjectMotionCarousel projects={projects} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. LATEST PROPERTIES SECTION ─────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-brand-cream">
        <div className="container-custom">
          {/* Header Row matching Stitch design */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-navy">
              Latest Properties
            </h2>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-brand-gold-dark transition-colors group"
            >
              <span>View All Properties</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const isActive = tab === activeFilter;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-brand-sm'
                      : 'bg-white text-neutral-600 border border-brand-navy/10 hover:border-brand-gold hover:text-brand-navy'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* 3-Column Property Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {loadingFeatured && filteredProperties.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm">
                  Loading properties…
                </div>
              ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.slice(0, 6).map((prop) => (
                    <PropertyCard key={prop.id} {...prop} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-400 text-sm">
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
        bullets={[
          'Free property evaluation',
          'Professional photography',
          'Targeted marketing',
          'Expert negotiation',
        ]}
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

          {loadingFeatured && featuredProjects.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 text-sm">Loading projects…</div>
          ) : featuredProjects.length > 0 ? (
            <HorizontalCarousel
              items={featuredProjects}
              cardWidth={340}
              gap={24}
              renderItem={(proj) => <ProjectCard {...proj} />}
            />
          ) : (
            <div className="py-20 text-center text-neutral-400 text-sm">
              No projects available yet.
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────────────────────────── */}
      <section
        className="relative py-28 overflow-hidden"
        style={{ background: 'var(--color-brand-navy)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(1,69,242,0.22) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 islamic-pattern opacity-25 pointer-events-none" />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(1,69,242,0.5), transparent)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(1,69,242,0.5), transparent)',
          }}
        />

        <div className="container-custom relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.3em] mb-5 flex items-center justify-center gap-3"
            style={{ color: 'var(--color-brand-gold)' }}
          >
            <span
              className="inline-block w-8 h-px"
              style={{ background: 'rgba(1,69,242,0.4)' }}
            />
            Get in Touch
            <span
              className="inline-block w-8 h-px"
              style={{ background: 'rgba(1,69,242,0.4)' }}
            />
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold text-white mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Ready to Find Your
            <br />
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
            Our local experts know every district. Whether buying, renting, or investing — we'll
            find the right property for you.
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
              style={{
                background: '#25D366',
                boxShadow: '0 8px 28px rgba(37,211,102,0.35)',
              }}
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
            <ClickToCallButton className="px-8 py-4 rounded-2xl font-bold text-base" />
          </motion.div>
        </div>
      </section>

      <NewsletterBanner />
    </>
  );
};
