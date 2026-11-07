import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Layers,
  Box,
  SlidersHorizontal,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Upload,
  Check,
  Building2,
  Sun,
  ArrowUpRight,
  Eye,
  MoveHorizontal,
  Grid,
  Calculator,
  X,
} from 'lucide-react';
import defaultExteriorImg from '../../assets/images/project_exterior_elevation_1793995966183.jpg';
import defaultTechnicalPlanImg from '../../assets/images/floorplan_technical_blueprint_1793995969202.jpg';
import defaultFurnishedPlanImg from '../../assets/images/floorplan_furnished_3d_1793995968986.jpg';

export type ExplorerVariant = 'variant-1' | 'variant-2' | 'variant-3';

export interface ExplorerCustomAssets {
  exteriorUrl: string;
  technicalPlanUrl: string;
  furnishedPlanUrl: string;
  projectTitle?: string;
}

export interface PremiumProjectExplorerProps {
  projectId?: number | string;
  projectName?: string;
  projectLocation?: string;
  deliveryDate?: string | null;
  initialExteriorUrl?: string | null;
  initialTechnicalPlanUrl?: string | null;
  initialFurnishedPlanUrl?: string | null;
  onRequestVisit?: (unitLabel: string) => void;
}

interface FloorSpec {
  floor: number;
  label: string;
  elevationMeters: number;
  bandTopPct: number;
  bandHeightPct: number;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  soldUnits: number;
  typologyId: 'type-a' | 'type-b' | 'penthouse';
  startingPriceUsd: number;
  status: 'available' | 'limited' | 'reserved' | 'sold';
}

interface RoomHotspot {
  id: string;
  nameEn: string;
  nameFa: string;
  areaSqm: number;
  dimensions: string;
  xPct: number;
  yPct: number;
  orientation: string;
  finishSpec: string;
  structuralNote: string;
}

interface UnitTypology {
  id: 'type-a' | 'type-b' | 'penthouse';
  code: string;
  name: string;
  nameFa: string;
  totalAreaSqm: number;
  balconyAreaSqm: number;
  beds: number;
  baths: number;
  hasMehmankhana: boolean;
  aspect: string;
  basePriceUsd: number;
  ceilingHeightM: number;
  rooms: RoomHotspot[];
}

const CUSTOM_ASSETS_STORAGE_KEY = 'attaie_custom_project_explorer_assets_v1';

const UNIT_TYPOLOGIES: Record<'type-a' | 'type-b' | 'penthouse', UnitTypology> = {
  'type-a': {
    id: 'type-a',
    code: 'TYPE A · RESIDENCE',
    name: '3-Bedroom + Formal Mehmankhana',
    nameFa: 'اپارتمان ۳ اتاقه + مهمان‌خانه مستقل',
    totalAreaSqm: 210,
    balconyAreaSqm: 12.5,
    beds: 3,
    baths: 3,
    hasMehmankhana: true,
    aspect: 'South-East / Mountain & Courtyard View',
    basePriceUsd: 168000,
    ceilingHeightM: 3.15,
    rooms: [
      {
        id: 'salon',
        nameEn: 'Family Living Salon',
        nameFa: 'صالون نشیمن خانوادگی',
        areaSqm: 57.8,
        dimensions: '6.80m × 8.50m',
        xPct: 24,
        yPct: 62,
        orientation: 'South Terrace Glazing',
        finishSpec: 'Herringbone Oak Parquet · Acoustic Cove Ceiling',
        structuralNote: 'Clear-span RC beam · 250×450mm perimeter columns',
      },
      {
        id: 'mehmankhana',
        nameEn: 'Formal Mehmankhana (Guest Reception)',
        nameFa: 'مهمان‌خانه رسمی با ورودی مجزا',
        areaSqm: 24.0,
        dimensions: '4.20m × 5.70m',
        xPct: 43,
        yPct: 66,
        orientation: 'South-Central',
        finishSpec: 'Hand-finished Travertine Threshold · Dual Pocket Doors',
        structuralNote: 'Direct foyer privacy separation from family wing',
      },
      {
        id: 'kitchen',
        nameEn: 'Closed & Open Dual Kitchen',
        nameFa: 'آشپزخانه مدرن با جزیره سنگ مرمر',
        areaSqm: 18.5,
        dimensions: '3.60m × 5.15m',
        xPct: 55,
        yPct: 31,
        orientation: 'North-Central',
        finishSpec: 'Calacatta Quartz Countertop · Dedicated Utility Balcony',
        structuralNote: 'Central wet-riser shaft + natural ventilation duct',
      },
      {
        id: 'master',
        nameEn: 'Master Bedroom Suite + Walk-In',
        nameFa: 'اتاق خواب ماستر با الماری و تشناب مستقل',
        areaSqm: 28.0,
        dimensions: '4.20m × 6.65m',
        xPct: 83,
        yPct: 27,
        orientation: 'East Morning Sun',
        finishSpec: 'En-suite 8.5 m² Marble Bath · 6.0 m² Walk-In Closet',
        structuralNote: 'Double-glazed thermal break aluminum curtain wall',
      },
      {
        id: 'bedroom-1',
        nameEn: 'Bedroom 2 (South Wing)',
        nameFa: 'اتاق خواب دوم (سمت آفتاب‌رخ)',
        areaSqm: 18.0,
        dimensions: '3.60m × 5.00m',
        xPct: 60,
        yPct: 64,
        orientation: 'South Daylight',
        finishSpec: 'Built-in Walnut Wardrobe · Shared 6.0 m² Bath',
        structuralNote: '200mm acoustic block partition wall',
      },
      {
        id: 'bedroom-2',
        nameEn: 'Bedroom 3 (Corner Suite)',
        nameFa: 'اتاق خواب سوم',
        areaSqm: 17.5,
        dimensions: '4.20m × 4.15m',
        xPct: 84,
        yPct: 68,
        orientation: 'South-East Corner',
        finishSpec: 'Adjacent 5.5 m² Bathroom · Full-Height Casement Windows',
        structuralNote: 'Corner shear-wall seismic reinforcement',
      },
      {
        id: 'terrace',
        nameEn: 'Landscaped Panorama Terrace',
        nameFa: 'بام‌تراس و بالکن سرتاسری',
        areaSqm: 12.5,
        dimensions: '1.80m × 6.95m',
        xPct: 30,
        yPct: 86,
        orientation: 'Full South Exposure',
        finishSpec: 'Non-slip Frost-Proof Porcelain · Integrated Planter Box',
        structuralNote: 'Cantilevered slab with thermal bridge insulation',
      },
    ],
  },
  'type-b': {
    id: 'type-b',
    code: 'TYPE B · EXECUTIVE',
    name: '2-Bedroom + Mehmankhana Corner',
    nameFa: 'اپارتمان ۲ اتاقه + مهمان‌خانه و بالکن',
    totalAreaSqm: 165,
    balconyAreaSqm: 9.8,
    beds: 2,
    baths: 2,
    hasMehmankhana: true,
    aspect: 'South-West / Sunset City View',
    basePriceUsd: 132000,
    ceilingHeightM: 3.1,
    rooms: [
      {
        id: 'salon',
        nameEn: 'Open Family Salon & Dining',
        nameFa: 'صالون نشیمن و غذاخوری',
        areaSqm: 46.5,
        dimensions: '6.20m × 7.50m',
        xPct: 26,
        yPct: 60,
        orientation: 'South-West Glazing',
        finishSpec: 'Natural Oak Plank · Recessed Linear Lighting',
        structuralNote: 'Post-tensioned flat slab · zero drop beams',
      },
      {
        id: 'mehmankhana',
        nameEn: 'Guest Mehmankhana Suite',
        nameFa: 'مهمان‌خانه مستقل',
        areaSqm: 21.0,
        dimensions: '4.00m × 5.25m',
        xPct: 44,
        yPct: 65,
        orientation: 'South',
        finishSpec: 'Acoustic Sliding Partition · Guest Powder Room Access',
        structuralNote: 'Dual-entry lobby vestibule',
      },
      {
        id: 'kitchen',
        nameEn: 'Enclosed Chef Kitchen',
        nameFa: 'آشپزخانه مجهز با تهویه طبیعی',
        areaSqm: 15.2,
        dimensions: '3.60m × 4.20m',
        xPct: 55,
        yPct: 32,
        orientation: 'North',
        finishSpec: 'Matte Anthracite Cabinetry · Turkish Granite Top',
        structuralNote: 'Dedicated utility laundry alcove (4.2 m²)',
      },
      {
        id: 'master',
        nameEn: 'Master Suite + En-suite Bath',
        nameFa: 'اتاق خواب ماستر',
        areaSqm: 26.5,
        dimensions: '4.20m × 6.30m',
        xPct: 82,
        yPct: 29,
        orientation: 'West Mountain View',
        finishSpec: 'Walk-in Dressing Room · Rain Shower En-suite',
        structuralNote: 'Triple-seal acoustic window frames',
      },
      {
        id: 'bedroom-1',
        nameEn: 'Second Bedroom',
        nameFa: 'اتاق خواب دوم',
        areaSqm: 16.8,
        dimensions: '3.60m × 4.65m',
        xPct: 62,
        yPct: 66,
        orientation: 'South',
        finishSpec: 'Full-Height Wardrobe · Balcony Access',
        structuralNote: 'Insulated exterior cavity wall',
      },
      {
        id: 'terrace',
        nameEn: 'Recessed Sky Balcony',
        nameFa: 'بالکن آفتاب‌رخ',
        areaSqm: 9.8,
        dimensions: '1.80m × 5.45m',
        xPct: 32,
        yPct: 86,
        orientation: 'South-West',
        finishSpec: 'Tempered Laminated Glass Balustrade',
        structuralNote: 'Integrated floor drainage channel',
      },
    ],
  },
  penthouse: {
    id: 'penthouse',
    code: 'SKY PENTHOUSE · LEVEL 11–12',
    name: '4-Bedroom Panorama Sky Residence',
    nameFa: 'پنت‌هاوس ۴ اتاقه با تخت‌بام اختصاصی',
    totalAreaSqm: 320,
    balconyAreaSqm: 38.0,
    beds: 4,
    baths: 4,
    hasMehmankhana: true,
    aspect: '360° Kabul Mountain & Paghman Panorama',
    basePriceUsd: 285000,
    ceilingHeightM: 3.6,
    rooms: [
      {
        id: 'salon',
        nameEn: 'Grand Double-Aspect Salon',
        nameFa: 'صالون بزرگ پنت‌هاوس',
        areaSqm: 78.0,
        dimensions: '8.20m × 9.50m',
        xPct: 25,
        yPct: 60,
        orientation: 'South & West Panorama',
        finishSpec: 'Bookmatched Marble Feature Wall · Smart Climate Zone',
        structuralNote: '3.60m clear ceiling height',
      },
      {
        id: 'mehmankhana',
        nameEn: 'Royal Mehmankhana Pavilion',
        nameFa: 'مهمان‌خانه تشریفاتی و تخت‌بام',
        areaSqm: 36.0,
        dimensions: '5.00m × 7.20m',
        xPct: 44,
        yPct: 65,
        orientation: 'South Terrace Direct Access',
        finishSpec: 'Custom Hand-Carved Cedar Ceiling Trim · Private Foyer',
        structuralNote: 'Direct elevator lobby access',
      },
      {
        id: 'kitchen',
        nameEn: 'Show Kitchen + Back Service Kitchen',
        nameFa: 'آشپزخانه سرد و گرم',
        areaSqm: 26.0,
        dimensions: '4.50m × 5.80m',
        xPct: 55,
        yPct: 30,
        orientation: 'North-East',
        finishSpec: 'Waterfall Marble Island · Pantry & Staff Utility',
        structuralNote: 'Dual exhaust & filtered fresh-air supply',
      },
      {
        id: 'master',
        nameEn: 'Presidential Master Wing',
        nameFa: 'سوئیت ماستر اختصاصی',
        areaSqm: 44.0,
        dimensions: '5.50m × 8.00m',
        xPct: 83,
        yPct: 28,
        orientation: 'East Sunrise Panorama',
        finishSpec: 'His & Hers Walk-In Closets · Freestanding Soaking Tub',
        structuralNote: 'Private east morning balcony',
      },
      {
        id: 'terrace',
        nameEn: 'Landscaped Takht-e-Bam Sky Garden',
        nameFa: 'تخت‌بام سرسبز اختصاصی با آلاچیق',
        areaSqm: 38.0,
        dimensions: '2.60m × 14.60m',
        xPct: 30,
        yPct: 86,
        orientation: 'Full Southern Horizon',
        finishSpec: 'Pergola Gazebo · Outdoor Kitchen & Heated Seating Area',
        structuralNote: 'Reinforced roof garden waterproofing membrane',
      },
    ],
  },
};

const TOWER_FLOORS: FloorSpec[] = [
  {
    floor: 12,
    label: 'Level 12 · Sky Penthouse North/South',
    elevationMeters: 41.5,
    bandTopPct: 9.5,
    bandHeightPct: 5.5,
    totalUnits: 2,
    availableUnits: 1,
    reservedUnits: 1,
    soldUnits: 0,
    typologyId: 'penthouse',
    startingPriceUsd: 295000,
    status: 'limited',
  },
  {
    floor: 11,
    label: 'Level 11 · Sky Penthouse Lower',
    elevationMeters: 37.8,
    bandTopPct: 15.2,
    bandHeightPct: 5.4,
    totalUnits: 2,
    availableUnits: 2,
    reservedUnits: 0,
    soldUnits: 0,
    typologyId: 'penthouse',
    startingPriceUsd: 285000,
    status: 'available',
  },
  {
    floor: 10,
    label: 'Level 10 · High-Zone Residence',
    elevationMeters: 34.4,
    bandTopPct: 21.0,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 3,
    reservedUnits: 1,
    soldUnits: 0,
    typologyId: 'type-a',
    startingPriceUsd: 182000,
    status: 'available',
  },
  {
    floor: 9,
    label: 'Level 09 · High-Zone Residence',
    elevationMeters: 31.1,
    bandTopPct: 26.7,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 2,
    reservedUnits: 1,
    soldUnits: 1,
    typologyId: 'type-a',
    startingPriceUsd: 178000,
    status: 'available',
  },
  {
    floor: 8,
    label: 'Level 08 · Panorama Residence',
    elevationMeters: 27.8,
    bandTopPct: 32.4,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 4,
    reservedUnits: 0,
    soldUnits: 0,
    typologyId: 'type-a',
    startingPriceUsd: 174000,
    status: 'available',
  },
  {
    floor: 7,
    label: 'Level 07 · Mid-Rise Executive',
    elevationMeters: 24.5,
    bandTopPct: 38.1,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 1,
    reservedUnits: 2,
    soldUnits: 1,
    typologyId: 'type-a',
    startingPriceUsd: 170000,
    status: 'limited',
  },
  {
    floor: 6,
    label: 'Level 06 · Mid-Rise Executive',
    elevationMeters: 21.2,
    bandTopPct: 43.8,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 3,
    reservedUnits: 0,
    soldUnits: 1,
    typologyId: 'type-b',
    startingPriceUsd: 138000,
    status: 'available',
  },
  {
    floor: 5,
    label: 'Level 05 · Courtyard View',
    elevationMeters: 17.9,
    bandTopPct: 49.5,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 2,
    reservedUnits: 2,
    soldUnits: 0,
    typologyId: 'type-b',
    startingPriceUsd: 135000,
    status: 'available',
  },
  {
    floor: 4,
    label: 'Level 04 · Courtyard View',
    elevationMeters: 14.6,
    bandTopPct: 55.2,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 0,
    reservedUnits: 1,
    soldUnits: 3,
    typologyId: 'type-b',
    startingPriceUsd: 132000,
    status: 'reserved',
  },
  {
    floor: 3,
    label: 'Level 03 · Garden Canopy Residence',
    elevationMeters: 11.3,
    bandTopPct: 60.9,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 2,
    reservedUnits: 1,
    soldUnits: 1,
    typologyId: 'type-a',
    startingPriceUsd: 168000,
    status: 'available',
  },
  {
    floor: 2,
    label: 'Level 02 · Podium Residence',
    elevationMeters: 8.0,
    bandTopPct: 66.6,
    bandHeightPct: 5.4,
    totalUnits: 4,
    availableUnits: 0,
    reservedUnits: 0,
    soldUnits: 4,
    typologyId: 'type-b',
    startingPriceUsd: 128000,
    status: 'sold',
  },
  {
    floor: 1,
    label: 'Level 01 · Grand Lobby & Concierge',
    elevationMeters: 4.5,
    bandTopPct: 72.5,
    bandHeightPct: 7.5,
    totalUnits: 2,
    availableUnits: 1,
    reservedUnits: 1,
    soldUnits: 0,
    typologyId: 'type-a',
    startingPriceUsd: 165000,
    status: 'limited',
  },
];

export const PremiumProjectExplorer: React.FC<PremiumProjectExplorerProps> = ({
  projectName = 'Attaie Signature Towers — Wazir Akbar Khan',
  projectLocation = 'Street 10, Wazir Akbar Khan, Kabul',
  deliveryDate = 'Q4 2027',
  initialExteriorUrl,
  initialTechnicalPlanUrl,
  initialFurnishedPlanUrl,
  onRequestVisit,
}) => {
  // Active Direction Variant ('variant-1' | 'variant-2' | 'variant-3')
  const [activeVariant, setActiveVariant] = useState<ExplorerVariant>('variant-1');

  // Custom or default architectural assets
  const [customAssets, setCustomAssets] = useState<ExplorerCustomAssets>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ASSETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ExplorerCustomAssets>;
        return {
          exteriorUrl: parsed.exteriorUrl || initialExteriorUrl || defaultExteriorImg,
          technicalPlanUrl: parsed.technicalPlanUrl || initialTechnicalPlanUrl || defaultTechnicalPlanImg,
          furnishedPlanUrl: parsed.furnishedPlanUrl || initialFurnishedPlanUrl || defaultFurnishedPlanImg,
        };
      }
    } catch {
      // ignore storage errors
    }
    return {
      exteriorUrl: initialExteriorUrl || defaultExteriorImg,
      technicalPlanUrl: initialTechnicalPlanUrl || defaultTechnicalPlanImg,
      furnishedPlanUrl: initialFurnishedPlanUrl || defaultFurnishedPlanImg,
    };
  });

  const [assetDrawerOpen, setAssetDrawerOpen] = useState(false);

  // Shared Explorer State across the 3 variants
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(8);
  const [hoveredFloorNum, setHoveredFloorNum] = useState<number | null>(null);
  const [selectedTypologyId, setSelectedTypologyId] = useState<'type-a' | 'type-b' | 'penthouse'>('type-a');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('salon');

  // Variant 1: Split X-Ray Slider (0 = 100% Furnished 3D, 100 = 100% Technical CAD)
  const [splitPct, setSplitPct] = useState<number>(48);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitMotion = useMotionValue(48);
  const smoothSplit = useSpring(splitMotion, { stiffness: 320, damping: 32 });
  const clipPathRight = useTransform(smoothSplit, (v) => `inset(0 ${100 - v}% 0 0)`);
  const splitHandleLeft = useTransform(smoothSplit, (v) => `${v}%`);

  // Variant 2: 3D Isometric Stack & Camera Controls
  const [isoViewMode, setIsoViewMode] = useState<'3d-stack' | '2d-plate'>('3d-stack');
  const [isoPlanLayer, setIsoPlanLayer] = useState<'furnished' | 'technical'>('furnished');
  const [isoSpread, setIsoSpread] = useState<number>(22);
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number }>({ x: 200, y: 120 });

  // Variant 3: Architectural Blueprint Workbench Controls
  const [workbenchMode, setWorkbenchMode] = useState<'technical' | 'furnished' | 'side-by-side'>('side-by-side');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showDimensionPins, setShowDimensionPins] = useState<boolean>(true);
  const [solarHour, setSolarHour] = useState<number>(15.5); // 07:00 to 18:30
  const [downPaymentPct, setDownPaymentPct] = useState<number>(30);
  const [installmentMonths, setInstallmentMonths] = useState<number>(24);

  const activeFloor =
    TOWER_FLOORS.find((f) => f.floor === (hoveredFloorNum ?? selectedFloorNum)) || TOWER_FLOORS[4];
  const lockedFloor =
    TOWER_FLOORS.find((f) => f.floor === selectedFloorNum) || TOWER_FLOORS[4];
  const activeTypology = UNIT_TYPOLOGIES[selectedTypologyId];
  const activeRoom =
    activeTypology.rooms.find((r) => r.id === selectedRoomId) || activeTypology.rooms[0];

  // Sync typology when user clicks a floor
  const handleSelectFloor = (floorSpec: FloorSpec) => {
    setSelectedFloorNum(floorSpec.floor);
    setSelectedTypologyId(floorSpec.typologyId);
    const nextTypology = UNIT_TYPOLOGIES[floorSpec.typologyId];
    if (!nextTypology.rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(nextTypology.rooms[0].id);
    }
  };

  // Update motion value when splitPct changes
  useEffect(() => {
    splitMotion.set(splitPct);
  }, [splitPct, splitMotion]);

  const updateSplitFromClientX = useCallback((clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(4, Math.min(96, rawPct));
    setSplitPct(Math.round(clamped));
  }, []);

  useEffect(() => {
    if (!isDraggingSplit) return;
    const onMove = (e: MouseEvent) => updateSplitFromClientX(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateSplitFromClientX(e.touches[0].clientX);
    };
    const onUp = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingSplit, updateSplitFromClientX]);

  // Handle local image file upload (reads as Data URL and saves to state + localStorage)
  const handleFileUpload = (
    slot: keyof Pick<ExplorerCustomAssets, 'exteriorUrl' | 'technicalPlanUrl' | 'furnishedPlanUrl'>,
    file: File | undefined
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      setCustomAssets((prev) => {
        const next = { ...prev, [slot]: result };
        try {
          localStorage.setItem(CUSTOM_ASSETS_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore if data URL exceeds localStorage quota
        }
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleResetAssets = () => {
    const defaults: ExplorerCustomAssets = {
      exteriorUrl: initialExteriorUrl || defaultExteriorImg,
      technicalPlanUrl: initialTechnicalPlanUrl || defaultTechnicalPlanImg,
      furnishedPlanUrl: initialFurnishedPlanUrl || defaultFurnishedPlanImg,
    };
    setCustomAssets(defaults);
    try {
      localStorage.removeItem(CUSTOM_ASSETS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Financial math for Variant 3
  const unitPrice = lockedFloor.startingPriceUsd || activeTypology.basePriceUsd;
  const downPaymentUsd = Math.round((unitPrice * downPaymentPct) / 100);
  const financedUsd = unitPrice - downPaymentUsd;
  const monthlyPaymentUsd = Math.round(financedUsd / installmentMonths);
  const pricePerSqm = Math.round(unitPrice / activeTypology.totalAreaSqm);

  // Solar angle calculation for Variant 3
  const solarProgress = (solarHour - 7) / 11.5; // 0 (East 7am) to 1 (West 6:30pm)
  const solarAzimuthDeg = Math.round(95 + solarProgress * 170);
  const solarTimeFormatted = `${String(Math.floor(solarHour)).padStart(2, '0')}:${
    solarHour % 1 >= 0.5 ? '30' : '00'
  }`;

  return (
    <section
      id="interactive-project-explorer"
      className="my-12 rounded-2xl bg-brand-navy-deep text-white border border-white/10 overflow-hidden shadow-brand-xl"
    >
      {/* Top Studio Bar: Title + 3-Direction Variant Switcher + Custom Asset Studio Button */}
      <div className="border-b border-white/10 bg-brand-navy px-5 py-5 sm:px-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mb-1.5">
              <span className="font-semibold text-brand-gold-lt">Interactive Architectural Explorer</span>
              <span aria-hidden="true">·</span>
              <span>{projectLocation}</span>
              {deliveryDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Delivery {deliveryDate}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {projectName}
            </h2>
          </div>

          {/* 3-Direction Segmented Switcher (Motion layoutId shared tab indicator) */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="tablist"
              aria-label="Project Explorer Design Directions"
              className="inline-flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-brand-navy-deep border border-white/10"
            >
              {(
                [
                  {
                    id: 'variant-1' as const,
                    index: '01',
                    label: 'Elevation + X-Ray Split',
                    icon: SlidersHorizontal,
                  },
                  {
                    id: 'variant-2' as const,
                    index: '02',
                    label: '3D Isometric Stack + Bento',
                    icon: Box,
                  },
                  {
                    id: 'variant-3' as const,
                    index: '03',
                    label: 'Blueprint CAD Workbench',
                    icon: Layers,
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeVariant === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveVariant(tab.id)}
                    className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                      isActive ? 'text-white' : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="explorer-variant-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 rounded-lg bg-brand-gold shadow-sm"
                      />
                    )}
                    <span className="relative z-10 font-mono text-[11px] opacity-80">{tab.index}.</span>
                    <Icon size={14} className="relative z-10 shrink-0" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setAssetDrawerOpen((v) => !v)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-2 ${
                assetDrawerOpen
                  ? 'bg-white text-brand-navy border-white'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/15'
              }`}
            >
              <Upload size={14} />
              <span>Custom Project Images</span>
            </button>
          </div>
        </div>

        {/* Collapsible Custom Project Asset Uploader Drawer */}
        <AnimatePresence initial={false}>
          {assetDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Load Your Project Exterior, Technical Floor Plan & Furnished Floor Plan
                    </h3>
                    <p className="text-xs text-white/65">
                      Upload local files or paste image URLs below. All three explorer variants update immediately.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetAssets}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/85 transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Default Assets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssetDrawerOpen(false)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/75 cursor-pointer"
                      aria-label="Close Custom Images Drawer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    [
                      {
                        key: 'exteriorUrl' as const,
                        title: '01. Exterior Building Elevation',
                        subtitle: 'Used in Tower Floor Selector & 3D Reference',
                        value: customAssets.exteriorUrl,
                      },
                      {
                        key: 'technicalPlanUrl' as const,
                        title: '02. Technical CAD Floor Plan',
                        subtitle: '2D Architectural Blueprint with Dimensions',
                        value: customAssets.technicalPlanUrl,
                      },
                      {
                        key: 'furnishedPlanUrl' as const,
                        title: '03. Furnished Apartment Floor Plan',
                        subtitle: '3D Top-Down Dollhouse / Interior Layout',
                        value: customAssets.furnishedPlanUrl,
                      },
                    ] as const
                  ).map((slot) => (
                    <div
                      key={slot.key}
                      className="rounded-xl bg-brand-navy-deep/90 border border-white/10 p-3.5 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={slot.value}
                          alt={slot.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-12 rounded-lg object-cover border border-white/15 bg-brand-navy shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{slot.title}</p>
                          <p className="text-[11px] text-white/55 truncate">{slot.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
                          <Upload size={12} />
                          <span>Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(slot.key, e.target.files?.[0])}
                          />
                        </label>
                        <input
                          type="url"
                          value={slot.value.startsWith('data:') ? '' : slot.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomAssets((prev) => ({ ...prev, [slot.key]: val }));
                          }}
                          placeholder="Or paste image URL…"
                          className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-white/35 focus:border-brand-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared KPI Telemetry Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 border-b border-white/10 bg-brand-navy-deep/70 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        <div className="px-5 py-3.5">
          <p className="text-[11px] text-white/55">Selected Floor Plate</p>
          <p className="text-base font-bold text-white mt-0.5 tabular-nums">
            Floor {String(lockedFloor.floor).padStart(2, '0')} · +{lockedFloor.elevationMeters}m
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[11px] text-white/55">Apartment Typology</p>
          <p className="text-base font-bold text-white mt-0.5 truncate">
            {activeTypology.totalAreaSqm} m² · {activeTypology.beds} Bed + Mehmankhana
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[11px] text-white/55">Floor Availability</p>
          <p className="text-base font-bold text-white mt-0.5 tabular-nums">
            {lockedFloor.availableUnits} Available · {lockedFloor.reservedUnits} Reserved
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-[11px] text-white/55">Active Room Focus</p>
          <p className="text-base font-bold text-brand-gold-lt mt-0.5 truncate tabular-nums">
            {activeRoom.nameEn.split(' ')[0]} · {activeRoom.areaSqm} m²
          </p>
        </div>
        <div className="px-5 py-3.5 col-span-2 lg:col-span-1 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-white/55">Starting Valuation</p>
            <p className="text-base font-bold text-white mt-0.5 tabular-nums">
              ${unitPrice.toLocaleString()}
            </p>
          </div>
          {onRequestVisit && (
            <button
              type="button"
              onClick={() =>
                onRequestVisit(
                  `${projectName} — Floor ${lockedFloor.floor} (${activeTypology.name})`
                )
              }
              className="px-3.5 py-2 rounded-lg bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
            >
              <span>Book Viewing</span>
              <ArrowUpRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Variant Stage */}
      <AnimatePresence mode="wait">
        {activeVariant === 'variant-1' && (
          <motion.div
            key="variant-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 sm:p-8"
          >
            {/* Variant 01 Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-brand-gold-lt">
                  01. Interactive Tower Elevation & Spring X-Ray Floor Plan Stage
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  Hover or select any residential floor on the tower facade, then drag the X-Ray curtain to compare Technical CAD vs. Furnished 3D
                </h3>
              </div>

              {/* Quick Split Presets */}
              <div className="flex items-center gap-1.5 bg-brand-navy p-1 rounded-xl border border-white/10 self-start">
                <button
                  type="button"
                  onClick={() => setSplitPct(96)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    splitPct > 80 ? 'bg-brand-gold text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Technical Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setSplitPct(50)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    splitPct >= 25 && splitPct <= 80
                      ? 'bg-brand-gold text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  50/50 X-Ray Split
                </button>
                <button
                  type="button"
                  onClick={() => setSplitPct(4)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    splitPct < 25 ? 'bg-brand-gold text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Furnished 3D Plan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 5 Cols: Interactive Exterior Elevation Facade */}
              <div className="lg:col-span-5 flex flex-col rounded-xl bg-brand-navy border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Building2 size={15} className="text-brand-gold-lt" />
                    <span>Exterior Elevation Selector</span>
                  </span>
                  <span className="text-white/60 tabular-nums">12 Stories · 42 Units</span>
                </div>

                <div className="relative flex-1 min-h-[440px] bg-brand-navy-deep overflow-hidden select-none">
                  <img
                    src={customAssets.exteriorUrl}
                    alt={`${projectName} Exterior Elevation`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-deep/90 via-brand-navy-deep/20 to-brand-navy-deep/50" />

                  {/* Interactive Horizontal Floor Bands Overlay */}
                  <div className="absolute inset-x-6 inset-y-0">
                    {TOWER_FLOORS.map((f) => {
                      const isSelected = f.floor === selectedFloorNum;
                      const isHovered = f.floor === hoveredFloorNum;
                      const isActive = isSelected || isHovered;
                      const isSoldOut = f.availableUnits === 0;

                      return (
                        <button
                          key={f.floor}
                          type="button"
                          onClick={() => handleSelectFloor(f)}
                          onMouseEnter={() => setHoveredFloorNum(f.floor)}
                          onMouseLeave={() => setHoveredFloorNum(null)}
                          style={{
                            top: `${f.bandTopPct}%`,
                            height: `${f.bandHeightPct}%`,
                          }}
                          className={`group absolute left-0 right-0 rounded-md transition-all duration-150 flex items-center justify-between px-3 cursor-pointer ${
                            isActive
                              ? 'bg-brand-gold/55 border border-white shadow-md'
                              : 'bg-brand-navy/20 hover:bg-brand-gold/35 border border-white/15'
                          }`}
                          aria-label={`Select Floor ${f.floor}`}
                        >
                          <span className="text-[11px] font-mono font-bold text-white drop-shadow tabular-nums">
                            F{String(f.floor).padStart(2, '0')}
                          </span>
                          <span className="text-[11px] font-semibold text-white drop-shadow tabular-nums">
                            {isSoldOut
                              ? 'Fully Reserved'
                              : `${f.availableUnits} of ${f.totalUnits} Open · $${(
                                  f.startingPriceUsd / 1000
                                ).toFixed(0)}k`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Active Floor Callout Bar */}
                  <div className="absolute bottom-3 inset-x-3 rounded-xl bg-brand-navy-deep/95 backdrop-blur-md border border-white/15 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-white">
                        {activeFloor.label}
                      </p>
                      <p className="text-[11px] text-white/65 mt-0.5 tabular-nums">
                        Elevation +{activeFloor.elevationMeters}m · {activeFloor.availableUnits} Available ·{' '}
                        {activeFloor.reservedUnits} Reserved · {activeFloor.soldUnits} Sold
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-gold-lt tabular-nums shrink-0">
                      ${activeFloor.startingPriceUsd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Interactive X-Ray Split Curtain + Room Pins */}
              <div className="lg:col-span-7 flex flex-col rounded-xl bg-brand-navy border border-white/10 overflow-hidden">
                {/* Typology Selector Bar */}
                <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {(Object.values(UNIT_TYPOLOGIES) as UnitTypology[]).map((typ) => {
                      const active = typ.id === selectedTypologyId;
                      return (
                        <button
                          key={typ.id}
                          type="button"
                          onClick={() => {
                            setSelectedTypologyId(typ.id);
                            setSelectedRoomId(typ.rooms[0].id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                            active
                              ? 'bg-brand-gold text-white'
                              : 'bg-white/5 text-white/70 hover:text-white'
                          }`}
                        >
                          {typ.id === 'type-a'
                            ? 'Type A · 210 m²'
                            : typ.id === 'type-b'
                            ? 'Type B · 165 m²'
                            : 'Penthouse · 320 m²'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/70">
                    <button
                      type="button"
                      onClick={() => setShowDimensionPins((v) => !v)}
                      className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Eye size={14} className="text-brand-gold-lt" />
                      <span>{showDimensionPins ? 'Hide Room Pins' : 'Show Room Pins'}</span>
                    </button>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">X-Ray: {splitPct}% CAD</span>
                  </div>
                </div>

                {/* Interactive Split-Curtain Canvas */}
                <div
                  ref={splitContainerRef}
                  onMouseDown={(e) => {
                    setIsDraggingSplit(true);
                    updateSplitFromClientX(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    setIsDraggingSplit(true);
                    if (e.touches[0]) updateSplitFromClientX(e.touches[0].clientX);
                  }}
                  className="relative flex-1 min-h-[400px] bg-neutral-900 overflow-hidden select-none cursor-ew-resize"
                >
                  {/* Base Layer: Furnished 3D Floor Plan */}
                  <img
                    src={customAssets.furnishedPlanUrl}
                    alt={`${activeTypology.name} Furnished 3D Floor Plan`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-full object-contain bg-neutral-100"
                  />

                  {/* Top Clipped Layer: Technical CAD Blueprint */}
                  <motion.div
                    style={{ clipPath: clipPathRight }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <img
                      src={customAssets.technicalPlanUrl}
                      alt={`${activeTypology.name} Technical CAD Floor Plan`}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-contain bg-white"
                    />
                  </motion.div>

                  {/* Corner Layer Labels */}
                  <div className="absolute top-3 left-3 pointer-events-none px-2.5 py-1 rounded-md bg-brand-navy-deep/85 text-[11px] font-bold text-white border border-white/15">
                    Technical CAD Blueprint (2D Dimensions)
                  </div>
                  <div className="absolute top-3 right-3 pointer-events-none px-2.5 py-1 rounded-md bg-brand-navy-deep/85 text-[11px] font-bold text-white border border-white/15">
                    Furnished Apartment Plan (3D Layout)
                  </div>

                  {/* Interactive Room Pins */}
                  {showDimensionPins &&
                    activeTypology.rooms.map((room) => {
                      const isRoomSelected = room.id === activeRoom.id;
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoomId(room.id);
                          }}
                          style={{ left: `${room.xPct}%`, top: `${room.yPct}%` }}
                          className={`-translate-x-1/2 -translate-y-1/2 absolute z-20 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-transform duration-150 cursor-pointer flex items-center gap-1.5 shadow-md ${
                            isRoomSelected
                              ? 'bg-brand-gold text-white scale-110 ring-2 ring-white'
                              : 'bg-brand-navy-deep/90 text-white hover:scale-105 border border-white/25'
                          }`}
                        >
                          <span>{room.nameEn.split(' ')[0]}</span>
                          <span className="font-mono text-[10px] opacity-85 tabular-nums">
                            {room.areaSqm}m²
                          </span>
                        </button>
                      );
                    })}

                  {/* Draggable Vertical Curtain Divider Handle */}
                  <motion.div
                    style={{ left: splitHandleLeft }}
                    className="absolute inset-y-0 z-30 -translate-x-1/2 w-0.5 bg-brand-gold pointer-events-none flex items-center justify-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-gold text-white shadow-lg border-2 border-white flex items-center justify-center">
                      <MoveHorizontal size={16} />
                    </div>
                  </motion.div>
                </div>

                {/* Selected Room Architectural Specification Strip */}
                <div className="p-4 bg-brand-navy-deep/90 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-white">{activeRoom.nameEn}</span>
                      <span aria-hidden="true" className="text-white/40">·</span>
                      <span className="font-arabic text-brand-gold-lt">{activeRoom.nameFa}</span>
                      <span aria-hidden="true" className="text-white/40">·</span>
                      <span className="font-mono text-white/80 tabular-nums">
                        {activeRoom.dimensions} ({activeRoom.areaSqm} m²)
                      </span>
                    </div>
                    <p className="text-xs text-white/65 mt-1">
                      {activeRoom.finishSpec} · {activeRoom.structuralNote}
                    </p>
                  </div>
                  <div className="text-xs text-white/70 shrink-0 font-mono tabular-nums">
                    Orientation: {activeRoom.orientation}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeVariant === 'variant-2' && (
          <motion.div
            key="variant-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 sm:p-8"
          >
            {/* Variant 02 Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-brand-gold-lt">
                  02. 3D Isometric Floor Plate Stack & Spotlight Room Matrix
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  Inspect exploded 3D floor plates in perspective space and explore room-by-room architectural specifications
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-brand-navy p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsoViewMode('3d-stack')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isoViewMode === '3d-stack'
                        ? 'bg-brand-gold text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    3D Isometric Stack
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsoViewMode('2d-plate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isoViewMode === '2d-plate'
                        ? 'bg-brand-gold text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Orthographic Top Plate
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-brand-navy p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsoPlanLayer('furnished')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isoPlanLayer === 'furnished'
                        ? 'bg-white text-brand-navy'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Furnished 3D Texture
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsoPlanLayer('technical')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isoPlanLayer === 'technical'
                        ? 'bg-white text-brand-navy'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Technical CAD Texture
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 6 Cols: Interactive 3D Isometric Exploded Floor Plates */}
              <div className="lg:col-span-6 rounded-xl bg-brand-navy border border-white/10 p-5 flex flex-col justify-between min-h-[480px] relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 z-10">
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isoViewMode === '3d-stack'
                        ? 'Interactive 3D Exploded Floor Stack'
                        : `Level ${lockedFloor.floor} Orthographic Floor Plate`}
                    </p>
                    <p className="text-[11px] text-white/60">
                      Click any story plate or use the vertical floor rail to isolate a floor
                    </p>
                  </div>

                  {isoViewMode === '3d-stack' && (
                    <div className="flex items-center gap-2 text-xs text-white/75">
                      <span>Plate Separation</span>
                      <input
                        type="range"
                        min={14}
                        max={34}
                        value={isoSpread}
                        onChange={(e) => setIsoSpread(Number(e.target.value))}
                        className="w-20 accent-brand-gold cursor-pointer"
                        aria-label="3D Floor Plate Separation"
                      />
                    </div>
                  )}
                </div>

                {/* Center 3D Isometric Stage */}
                <div className="flex-1 flex items-center justify-center my-4 relative">
                  {isoViewMode === '3d-stack' ? (
                    <div
                      className="relative w-full max-w-[380px] h-[340px] flex items-center justify-center"
                      style={{ perspective: '1200px' }}
                    >
                      {[12, 10, 8, 6, 4, 2].map((floorNum, idx) => {
                        const floorObj =
                          TOWER_FLOORS.find((f) => f.floor === floorNum) || TOWER_FLOORS[0];
                        const isSelected = selectedFloorNum === floorNum;
                        const isAboveSelected = floorNum > selectedFloorNum;
                        const verticalOffset =
                          (idx - 2.5) * isoSpread + (isAboveSelected ? -26 : 0);

                        return (
                          <motion.button
                            key={floorNum}
                            type="button"
                            onClick={() => handleSelectFloor(floorObj)}
                            initial={false}
                            animate={{
                              y: verticalOffset,
                              scale: isSelected ? 1.06 : 0.92,
                              opacity: isAboveSelected ? 0.38 : isSelected ? 1 : 0.78,
                            }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                            style={{
                              transformStyle: 'preserve-3d',
                              rotateX: 54,
                              rotateZ: -28,
                              zIndex: 20 - idx,
                            }}
                            className={`w-64 h-44 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer shadow-2xl ${
                              isSelected
                                ? 'border-brand-gold ring-4 ring-brand-gold/30'
                                : 'border-white/30 hover:border-white/70'
                            }`}
                          >
                            <img
                              src={
                                isoPlanLayer === 'furnished'
                                  ? customAssets.furnishedPlanUrl
                                  : customAssets.technicalPlanUrl
                              }
                              alt={`Floor ${floorNum} Plate`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-brand-navy/25 flex items-end justify-between p-2.5">
                              <span className="px-2 py-0.5 rounded bg-brand-navy-deep/90 text-[11px] font-mono font-bold text-white tabular-nums">
                                Level {String(floorNum).padStart(2, '0')}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-brand-gold text-[10px] font-bold text-white tabular-nums">
                                {floorObj.availableUnits} Open
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-[330px] rounded-xl overflow-hidden bg-white border border-white/15 relative"
                    >
                      <img
                        src={
                          isoPlanLayer === 'furnished'
                            ? customAssets.furnishedPlanUrl
                            : customAssets.technicalPlanUrl
                        }
                        alt="Selected Orthographic Plate"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Bottom Quick Floor Selector Strip */}
                <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-white/10 overflow-x-auto">
                  {TOWER_FLOORS.map((f) => {
                    const active = f.floor === selectedFloorNum;
                    return (
                      <button
                        key={f.floor}
                        type="button"
                        onClick={() => handleSelectFloor(f)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 tabular-nums ${
                          active
                            ? 'bg-brand-gold text-white'
                            : 'bg-white/5 text-white/65 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        F{String(f.floor).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 6 Cols: 21st.dev Spotlight Room Bento Grid */}
              <div
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setSpotlightPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                className="lg:col-span-6 rounded-xl bg-brand-navy border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden"
                style={{
                  backgroundImage: `radial-gradient(380px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(1, 69, 242, 0.16), transparent 80%)`,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="text-xs font-bold text-white">
                      {activeTypology.code} — {activeTypology.name}
                    </p>
                    <p className="text-xs font-arabic text-brand-gold-lt mt-0.5">
                      {activeTypology.nameFa} · سقف {activeTypology.ceilingHeightM} متر
                    </p>
                  </div>
                  <span className="text-xs font-mono text-white/75 tabular-nums">
                    Total {activeTypology.totalAreaSqm} m²
                  </span>
                </div>

                {/* Room Bento Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto">
                  {activeTypology.rooms.map((room, index) => {
                    const isSelected = room.id === activeRoom.id;
                    const pctOfTotal = Math.round(
                      (room.areaSqm / activeTypology.totalAreaSqm) * 100
                    );
                    return (
                      <motion.button
                        key={room.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                          index === 0 ? 'sm:col-span-2' : ''
                        } ${
                          isSelected
                            ? 'bg-brand-gold/20 border-brand-gold text-white'
                            : 'bg-brand-navy-deep/80 border-white/10 text-white/85 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-white">{room.nameEn}</p>
                            <p className="text-[11px] font-arabic text-white/65 mt-0.5">
                              {room.nameFa}
                            </p>
                          </div>
                          <span className="text-sm font-mono font-bold text-brand-gold-lt tabular-nums shrink-0">
                            {room.areaSqm} m²
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px] text-white/60 font-mono tabular-nums mb-1">
                            <span>{room.dimensions}</span>
                            <span>{pctOfTotal}% of floorplate</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, pctOfTotal * 2)}%` }}
                              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full bg-brand-gold rounded-full"
                            />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected Room Structural & Finish Footer */}
                <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/75">
                  <span>
                    <strong className="text-white">{activeRoom.nameEn}:</strong> {activeRoom.finishSpec}
                  </span>
                  <span className="font-mono text-brand-gold-lt tabular-nums shrink-0">
                    {activeRoom.orientation}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeVariant === 'variant-3' && (
          <motion.div
            key="variant-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 sm:p-8"
          >
            {/* Variant 03 Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold text-brand-gold-lt">
                  03. Architectural CAD Blueprint Workbench, Solar Orientation & Payment Studio
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  Inspect side-by-side Technical CAD and Furnished plans with zoom, Kabul sun-path simulation, and installment planning
                </h3>
              </div>

              {/* Workbench View Mode Switcher + Zoom Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-brand-navy p-1 rounded-xl border border-white/10">
                  {(
                    [
                      ['side-by-side', 'Side-by-Side Sync'],
                      ['technical', 'Technical CAD Only'],
                      ['furnished', 'Furnished 3D Only'],
                    ] as const
                  ).map(([modeKey, label]) => (
                    <button
                      key={modeKey}
                      type="button"
                      onClick={() => setWorkbenchMode(modeKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        workbenchMode === modeKey
                          ? 'bg-brand-gold text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-brand-navy p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                    className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold text-white tabular-nums">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2.25, Number((z + 0.25).toFixed(2))))}
                    className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
                    aria-label="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="px-2 py-1 rounded-lg text-[11px] text-white/65 hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left 8 Cols: Synchronized CAD / Furnished Workbench Stage + Solar Scrubber */}
              <div className="lg:col-span-8 flex flex-col rounded-xl bg-brand-navy border border-white/10 overflow-hidden">
                {/* Solar Path & Compass Toolbar */}
                <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-brand-navy-deep/60">
                  <div className="flex items-center gap-2 text-xs">
                    <Sun size={15} className="text-amber-400 shrink-0" />
                    <span className="font-bold text-white">Kabul Sun-Path Daylight Scrubber:</span>
                    <span className="font-mono text-brand-gold-lt tabular-nums">
                      {solarTimeFormatted} ({solarAzimuthDeg}° Azimuth)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 max-w-xs">
                    <span className="text-[11px] text-white/55 font-mono">07:00 E</span>
                    <input
                      type="range"
                      min={7}
                      max={18.5}
                      step={0.5}
                      value={solarHour}
                      onChange={(e) => setSolarHour(Number(e.target.value))}
                      className="flex-1 accent-brand-gold cursor-pointer"
                      aria-label="Kabul Solar Daylight Time"
                    />
                    <span className="text-[11px] text-white/55 font-mono">18:30 W</span>
                  </div>
                </div>

                {/* Dual or Single Plan Viewport */}
                <div
                  className={`relative flex-1 min-h-[390px] grid ${
                    workbenchMode === 'side-by-side' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  } divide-y md:divide-y-0 md:divide-x divide-white/10 bg-neutral-900 overflow-hidden`}
                >
                  {(workbenchMode === 'technical' || workbenchMode === 'side-by-side') && (
                    <div className="relative overflow-auto flex items-center justify-center bg-white p-3">
                      <motion.img
                        src={customAssets.technicalPlanUrl}
                        alt="Technical CAD Blueprint"
                        referrerPolicy="no-referrer"
                        animate={{ scale: zoomScale }}
                        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                        className="max-h-[360px] w-auto object-contain origin-center"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-brand-navy text-white text-[11px] font-bold">
                        Technical CAD Plan · 1:100
                      </span>
                    </div>
                  )}

                  {(workbenchMode === 'furnished' || workbenchMode === 'side-by-side') && (
                    <div className="relative overflow-auto flex items-center justify-center bg-neutral-100 p-3">
                      <motion.img
                        src={customAssets.furnishedPlanUrl}
                        alt="Furnished 3D Floor Plan"
                        referrerPolicy="no-referrer"
                        animate={{ scale: zoomScale }}
                        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                        className="max-h-[360px] w-auto object-contain origin-center"
                      />
                      {/* Dynamic Solar Sunlight Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                        style={{
                          background: `linear-gradient(${solarAzimuthDeg}deg, rgba(251, 191, 36, 0.22) 0%, rgba(251, 191, 36, 0.04) 55%, rgba(2, 14, 58, 0.18) 100%)`,
                        }}
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-brand-navy text-white text-[11px] font-bold">
                        Furnished 3D Layout · Daylight {solarTimeFormatted}
                      </span>
                    </div>
                  )}
                </div>

                {/* Room Selector Pills */}
                <div className="px-4 py-3 bg-brand-navy-deep/90 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-white/55 shrink-0 flex items-center gap-1">
                    <Grid size={13} />
                    <span>Inspect Room:</span>
                  </span>
                  {activeTypology.rooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                        r.id === activeRoom.id
                          ? 'bg-brand-gold text-white'
                          : 'bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      {r.nameEn.split(' ')[0]} ({r.areaSqm} m²)
                    </button>
                  ))}
                </div>
              </div>

              {/* Right 4 Cols: Unit Typology & Construction Installment Configurator */}
              <div className="lg:col-span-4 rounded-xl bg-brand-navy border border-white/10 p-5 flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-brand-gold-lt flex items-center gap-1.5">
                      <Calculator size={14} />
                      <span>Unit & Payment Configurator</span>
                    </span>
                    <span className="text-xs font-mono text-white/65 tabular-nums">
                      ${pricePerSqm.toLocaleString()} / m²
                    </span>
                  </div>

                  {/* Typology Selector */}
                  <div className="grid grid-cols-3 gap-1.5 mb-4">
                    {(Object.values(UNIT_TYPOLOGIES) as UnitTypology[]).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTypologyId(t.id)}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                          selectedTypologyId === t.id
                            ? 'bg-brand-gold border-brand-gold text-white'
                            : 'bg-brand-navy-deep border-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        <div>{t.id === 'penthouse' ? 'Penthouse' : t.id.toUpperCase()}</div>
                        <div className="font-mono text-[11px] opacity-80 tabular-nums">
                          {t.totalAreaSqm} m²
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Down Payment Slider */}
                  <div className="space-y-3 bg-brand-navy-deep/80 rounded-xl p-4 border border-white/10">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Down Payment ({downPaymentPct}%)</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          ${downPaymentUsd.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={70}
                        step={5}
                        value={downPaymentPct}
                        onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                        className="w-full accent-brand-gold cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Installment Term</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {installmentMonths} Months (0% Interest)
                        </span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={36}
                        step={6}
                        value={installmentMonths}
                        onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                        className="w-full accent-brand-gold cursor-pointer"
                      />
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                      <span className="text-xs text-white/70">Estimated Monthly</span>
                      <span className="text-xl font-mono font-extrabold text-brand-gold-lt tabular-nums">
                        ${monthlyPaymentUsd.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spec Summary & Primary CTA */}
                <div className="space-y-3">
                  <div className="text-xs text-white/70 space-y-1 font-mono tabular-nums">
                    <div className="flex justify-between">
                      <span>Gross Internal Area:</span>
                      <span className="text-white font-bold">{activeTypology.totalAreaSqm} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terrace / Balcony Area:</span>
                      <span className="text-white font-bold">{activeTypology.balconyAreaSqm} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Formal Mehmankhana:</span>
                      <span className="text-emerald-400 font-bold">Included (Separate Entry)</span>
                    </div>
                  </div>

                  {onRequestVisit && (
                    <button
                      type="button"
                      onClick={() =>
                        onRequestVisit(
                          `${projectName} — Floor ${lockedFloor.floor} (${activeTypology.name} · ${activeTypology.totalAreaSqm}m²)`
                        )
                      }
                      className="w-full py-3 px-4 rounded-xl bg-brand-gold hover:bg-brand-gold-dark text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Compass size={15} />
                      <span>Request Floor Plan PDF & Private Viewing</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PremiumProjectExplorer;
