import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, Images } from 'lucide-react';

interface Props {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, prev, next]);

  if (!images.length) return null;

  const single = images.length === 1;

  return (
    <>
      {/* Main image */}
      <div className="relative w-full h-[60vh] min-h-[420px] overflow-hidden bg-neutral-900 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`${alt} — photo ${active + 1}`}
            className={`w-full h-full object-cover transition-[filter] duration-500 ${loaded[active] ? 'blur-0' : 'blur-sm'}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onLoad={() => setLoaded(p => ({ ...p, [active]: true }))}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/75 via-brand-navy/15 to-transparent pointer-events-none" />
        <div className="absolute inset-0 islamic-pattern opacity-15 pointer-events-none" />

        {/* Zoom button */}
        <button
          onClick={() => setLightbox(true)}
          aria-label="View full screen"
          className="absolute top-4 right-4 p-2.5 rounded-xl glass text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20"
        >
          <ZoomIn size={18} />
        </button>

        {/* Arrow controls */}
        {!single && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl glass text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl glass text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Counter */}
        {!single && (
          <div className="absolute bottom-20 right-4 px-3 py-1 rounded-lg glass text-white text-xs font-bold">
            {active + 1} / {images.length}
          </div>
        )}

        {/* Gallery icon badge */}
        {!single && (
          <div className="absolute bottom-20 left-4 flex items-center gap-1.5 px-3 py-1 rounded-lg glass text-white text-xs font-bold">
            <Images size={13} />
            {images.length} Photos
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {!single && (
        <div className="flex gap-2 overflow-x-auto py-3 px-0 scrollbar-none">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === active
                  ? 'border-brand-gold shadow-gold-sm scale-105'
                  : 'border-transparent opacity-60 hover:opacity-90 hover:scale-[1.02]'
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
              onClick={() => setLightbox(false)}
            >
              <X size={22} />
            </button>

            {/* Main lightbox image */}
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={active}
                  src={images[active]}
                  alt={`${alt} — photo ${active + 1}`}
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>

              {!single && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-[-3.5rem] top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 text-white hover:bg-white/25 transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={26} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-[-3.5rem] top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 text-white hover:bg-white/25 transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight size={26} />
                  </button>
                </>
              )}
            </motion.div>

            {/* Lightbox counter */}
            {!single && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                {active + 1} / {images.length}
              </div>
            )}

            {/* Lightbox thumbnails */}
            {!single && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] py-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setActive(i); }}
                    className={`shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all duration-150 ${
                      i === active ? 'border-brand-gold' : 'border-white/20 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
