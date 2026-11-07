import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Upload, RotateCcw, X, Image as ImageIcon, Building2, Sliders } from 'lucide-react';
import stitchHeroImg from '../../assets/images/stitch_hero_kabul_panorama.jpg';

/**
 * ============================================================================
 * HERO 2-LAYER CONFIGURATION
 * ============================================================================
 * Layer 1 (`DEFAULT_HERO_BACKGROUND_IMAGE`):
 *   Full-bleed Kabul sky, mountains, and cityscape background (without building).
 *
 * Layer 2 (`DEFAULT_HERO_BUILDING_CUTOUT_IMAGE`):
 *   Transparent PNG / WebP cutout of the building alone (background removed).
 *   Set this path to your transparent building image (e.g. '/assets/hero-building.png')
 *   or upload it directly using the "Hero Layers" button on the landing page.
 */
export const DEFAULT_HERO_BACKGROUND_IMAGE: string = stitchHeroImg;
export const DEFAULT_HERO_BUILDING_CUTOUT_IMAGE: string = '';

const STORAGE_KEY = 'attaie_hero_two_layer_config_v1';

export interface HeroTwoLayerConfig {
  backgroundImage: string;
  buildingCutoutImage: string;
  buildingScale: number;
  buildingRightPercent: number;
  buildingBottomPx: number;
}

const DEFAULT_CONFIG: HeroTwoLayerConfig = {
  backgroundImage: DEFAULT_HERO_BACKGROUND_IMAGE,
  buildingCutoutImage: DEFAULT_HERO_BUILDING_CUTOUT_IMAGE,
  buildingScale: 100,
  buildingRightPercent: 3,
  buildingBottomPx: 0,
};

function loadStoredConfig(): HeroTwoLayerConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<HeroTwoLayerConfig>;
    return {
      backgroundImage: parsed.backgroundImage || DEFAULT_HERO_BACKGROUND_IMAGE,
      buildingCutoutImage:
        parsed.buildingCutoutImage !== undefined
          ? parsed.buildingCutoutImage
          : DEFAULT_HERO_BUILDING_CUTOUT_IMAGE,
      buildingScale:
        typeof parsed.buildingScale === 'number' ? parsed.buildingScale : DEFAULT_CONFIG.buildingScale,
      buildingRightPercent:
        typeof parsed.buildingRightPercent === 'number'
          ? parsed.buildingRightPercent
          : DEFAULT_CONFIG.buildingRightPercent,
      buildingBottomPx:
        typeof parsed.buildingBottomPx === 'number'
          ? parsed.buildingBottomPx
          : DEFAULT_CONFIG.buildingBottomPx,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export interface HeroBuildingLayerProps {
  /** Transparent PNG/WebP building image (without background) */
  buildingImage?: string | null;
  alt?: string;
  /** Scale percentage (default 100) */
  scale?: number;
  /** Horizontal offset from right in percentage (default 3%) */
  rightPercent?: number;
  /** Vertical offset from bottom in pixels (default 0px) */
  bottomPx?: number;
  className?: string;
}

/**
 * LAYER 2: Standalone Building Cutout Component
 * Renders a transparent-background building image anchored on the right side
 * of the hero section over the background panorama layer.
 */
export const HeroBuildingLayer: React.FC<HeroBuildingLayerProps> = ({
  buildingImage = DEFAULT_HERO_BUILDING_CUTOUT_IMAGE,
  alt = 'Attaie Properties Featured Signature Building',
  scale = 100,
  rightPercent = 3,
  bottomPx = 0,
  className = '',
}) => {
  if (!buildingImage || !buildingImage.trim()) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 right-0 z-[5] flex items-end justify-end overflow-visible select-none ${className}`}
      style={{
        right: `${rightPercent}%`,
        bottom: `${bottomPx}px`,
        width: 'min(52vw, 760px)',
      }}
      data-hero-layer="building-cutout"
    >
      <motion.img
        key={buildingImage}
        src={buildingImage}
        alt={alt}
        initial={{ opacity: 0, y: 24, scale: (scale / 100) * 0.96 }}
        animate={{ opacity: 1, y: 0, scale: scale / 100 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'bottom center' }}
        className="max-h-[96%] w-auto max-w-full object-contain object-bottom drop-shadow-[0_24px_48px_rgba(2,14,58,0.38)]"
      />
    </div>
  );
};

export interface HeroBackgroundLayerProps {
  /** Full-bleed background panorama image (without the foreground building) */
  backgroundImage?: string;
  alt?: string;
}

/**
 * LAYER 1: Standalone Background Panorama Component (Sky, Mountains & Cityscape without building)
 */
export const HeroBackgroundLayer: React.FC<HeroBackgroundLayerProps> = ({
  backgroundImage = DEFAULT_HERO_BACKGROUND_IMAGE,
  alt = 'Attaie Properties — Kabul Panorama Background Layer',
}) => {
  const resolvedBg = backgroundImage?.trim() || DEFAULT_HERO_BACKGROUND_IMAGE;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      data-hero-layer="background-panorama"
    >
      <img
        src={resolvedBg}
        alt={alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-right-top transition-opacity duration-500"
      />
      {/* Measured contrast scrim so left-side typography in brand-navy is crisp and readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(245,247,251,0.96) 0%, rgba(245,247,251,0.88) 38%, rgba(245,247,251,0.28) 68%, rgba(245,247,251,0.05) 100%)',
        }}
      />
    </div>
  );
};

export interface HeroTwoLayerBackdropProps {
  /** Optional explicit override for Layer 1 background image */
  backgroundImage?: string;
  /** Optional explicit override for Layer 2 transparent building cutout image */
  buildingCutoutImage?: string;
}

/**
 * Composes both independent Hero layers:
 *   - Layer 1 (`HeroBackgroundLayer`): The background panorama without the building
 *   - Layer 2 (`HeroBuildingLayer`): The foreground building cutout component (transparent PNG/WebP)
 * Plus an interactive "Hero 2-Layer Studio" switcher so you can insert/replace either layer anytime.
 */
export const HeroTwoLayerBackdrop: React.FC<HeroTwoLayerBackdropProps> = ({
  backgroundImage,
  buildingCutoutImage,
}) => {
  const [config, setConfig] = useState<HeroTwoLayerConfig>(() => loadStoredConfig());
  const [studioOpen, setStudioOpen] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const buildingFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore storage quota errors
    }
  }, [config]);

  const activeBackground = backgroundImage || config.backgroundImage || DEFAULT_HERO_BACKGROUND_IMAGE;
  const activeBuildingCutout =
    buildingCutoutImage !== undefined ? buildingCutoutImage : config.buildingCutoutImage;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetLayer: 'background' | 'building'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;
      setConfig((prev) =>
        targetLayer === 'background'
          ? { ...prev, backgroundImage: result }
          : { ...prev, buildingCutoutImage: result }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* LAYER 1: Background Image (Sky / Mountains / Cityscape without building) */}
      <HeroBackgroundLayer backgroundImage={activeBackground} />

      {/* LAYER 2: Building Cutout Component (Transparent PNG / WebP of just the building) */}
      <HeroBuildingLayer
        buildingImage={activeBuildingCutout}
        scale={config.buildingScale}
        rightPercent={config.buildingRightPercent}
        bottomPx={config.buildingBottomPx}
      />

      {/* Bottom smooth fade into page cream background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-32"
        style={{
          background:
            'linear-gradient(to top, var(--color-brand-cream) 10%, rgba(245,247,251,0) 100%)',
        }}
      />

      {/* Subtle Floating Toggle Button to customize Layer 1 (Background) & Layer 2 (Building Cutout) */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={() => setStudioOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-navy/80 hover:bg-brand-navy text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-brand-md transition-all cursor-pointer"
          title="Customize Hero Background Layer & Building Cutout Layer"
        >
          <Layers size={14} className="text-brand-gold-lt" />
          <span>Hero Layers (2-Layer)</span>
        </button>
      </div>

      {/* Interactive 2-Layer Customizer Popover */}
      <AnimatePresence>
        {studioOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 z-40 w-[340px] sm:w-[380px] rounded-2xl bg-white/98 backdrop-blur-xl border border-brand-navy/15 shadow-brand-xl p-5 text-brand-navy"
          >
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center">
                  <Layers size={15} />
                </span>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy">
                    Hero 2-Layer Manager
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Separate Background &amp; Building Cutout
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudioOpen(false)}
                aria-label="Close Hero Layer Manager"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-brand-navy hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* LAYER 1 CONTROLS: Background without building */}
              <div className="p-3.5 rounded-xl bg-brand-cream/80 border border-brand-navy/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy">
                    <ImageIcon size={14} className="text-brand-gold" />
                    Layer 1: Background (No Building)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-navy/10 text-brand-navy">
                    Back Layer
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Insert or upload your sky/mountain/cityscape background image without the building.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={
                      config.backgroundImage.startsWith('data:')
                        ? '(Uploaded Custom Background)'
                        : config.backgroundImage
                    }
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, backgroundImage: e.target.value }))
                    }
                    placeholder="/assets/hero-background.jpg"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-brand-navy focus:outline-none focus:border-brand-gold"
                  />
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'background')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-gold transition-colors cursor-pointer shrink-0"
                  >
                    <Upload size={12} />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* LAYER 2 CONTROLS: Foreground Building Cutout (Transparent PNG/WebP) */}
              <div className="p-3.5 rounded-xl bg-brand-cream/80 border border-brand-navy/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy">
                    <Building2 size={14} className="text-brand-gold" />
                    Layer 2: Building Cutout (PNG)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">
                    Front Layer
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Insert your transparent building image (with background removed). It sits on top of Layer 1.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={
                      config.buildingCutoutImage.startsWith('data:')
                        ? '(Uploaded Building Cutout PNG)'
                        : config.buildingCutoutImage
                    }
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, buildingCutoutImage: e.target.value }))
                    }
                    placeholder="/assets/building-cutout.png"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs text-brand-navy focus:outline-none focus:border-brand-gold"
                  />
                  <input
                    ref={buildingFileInputRef}
                    type="file"
                    accept="image/png,image/webp,image/*"
                    onChange={(e) => handleFileUpload(e, 'building')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => buildingFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shrink-0"
                  >
                    <Upload size={12} />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Position & Scale Fine-Tuning when a Building Cutout is active */}
                {config.buildingCutoutImage && (
                  <div className="pt-2 mt-2 border-t border-neutral-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600">
                      <span className="inline-flex items-center gap-1">
                        <Sliders size={11} className="text-brand-gold" />
                        Building Scale
                      </span>
                      <span className="tabular-nums font-bold text-brand-navy">
                        {config.buildingScale}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={config.buildingScale}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          buildingScale: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-brand-gold cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600">
                      <span>Right Position Offset</span>
                      <span className="tabular-nums font-bold text-brand-navy">
                        {config.buildingRightPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-10}
                      max={25}
                      value={config.buildingRightPercent}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          buildingRightPercent: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-brand-gold cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset Layers</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-gold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
