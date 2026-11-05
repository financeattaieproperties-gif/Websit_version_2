import React, { useEffect, useRef, useState } from 'react';
import { X, Layers, Box, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface BlueprintViewerProps {
  propertyTitle: string;
  floorPlanUrl?: string | null;
  threeDPlanUrl?: string | null;
  onClose: () => void;
}

type PlanTab = 'floor' | '3d';

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({
  propertyTitle,
  floorPlanUrl,
  threeDPlanUrl,
  onClose,
}) => {
  const { t } = useTranslation();
  const hasFloorPlan = Boolean(floorPlanUrl);
  const hasThreeDPlan = Boolean(threeDPlanUrl);
  const hasBoth = hasFloorPlan && hasThreeDPlan;

  const [activeTab, setActiveTab] = useState<PlanTab>(hasFloorPlan ? 'floor' : '3d');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setActiveTab(hasFloorPlan ? 'floor' : '3d');
  }, [hasFloorPlan, hasThreeDPlan]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  if (!hasFloorPlan && !hasThreeDPlan) return null;

  const currentUrl =
    activeTab === 'floor' && hasFloorPlan
      ? floorPlanUrl!
      : hasThreeDPlan
      ? threeDPlanUrl!
      : floorPlanUrl!;

  const currentAlt =
    activeTab === 'floor' && hasFloorPlan
      ? t('blueprint.floorPlanAlt', { title: propertyTitle })
      : t('blueprint.threeDPlanAlt', { title: propertyTitle });

  const singleTabLabel = hasFloorPlan
    ? t('blueprint.floorPlanTab')
    : t('blueprint.threeDPlanTab');

  return (
    <div
      className="fixed inset-0 z-[120] bg-brand-navy/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="blueprint-viewer-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-brand-xl overflow-hidden border border-brand-navy/10"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5 border-b border-neutral-200 bg-brand-cream/60">
          <div className="min-w-0">
            <p className="text-brand-gold text-xs font-bold uppercase tracking-wider">
              {hasBoth ? t('blueprint.eyebrow') : singleTabLabel}
            </p>
            <h2
              id="blueprint-viewer-title"
              className="text-lg sm:text-2xl font-display font-bold text-brand-navy truncate"
            >
              {t('blueprint.title', { title: propertyTitle })}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label={t('blueprint.close')}
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-brand-navy hover:bg-neutral-200/60 transition-colors shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs when both plans exist */}
        {hasBoth && (
          <div
            role="tablist"
            aria-label={t('blueprint.eyebrow')}
            className="flex gap-2 px-5 pt-4 sm:px-7 bg-white border-b border-neutral-100 pb-3"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'floor'}
              onClick={() => setActiveTab('floor')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                activeTab === 'floor'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-brand-ivory text-neutral-600 hover:text-brand-navy'
              }`}
            >
              <Layers size={16} />
              {t('blueprint.floorPlanTab')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === '3d'}
              onClick={() => setActiveTab('3d')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                activeTab === '3d'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-brand-ivory text-neutral-600 hover:text-brand-navy'
              }`}
            >
              <Box size={16} />
              {t('blueprint.threeDPlanTab')}
            </button>
          </div>
        )}

        {/* Image viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-50 flex items-center justify-center min-h-[280px]">
          <img
            src={currentUrl}
            alt={currentAlt}
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl border border-neutral-200 bg-white shadow-sm"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-7 bg-white border-t border-neutral-200">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:underline"
          >
            <ExternalLink size={15} />
            {t('blueprint.openFullSize')}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-navy text-white text-sm font-bold hover:bg-brand-navy-light transition-colors"
          >
            {t('visitDialog.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
