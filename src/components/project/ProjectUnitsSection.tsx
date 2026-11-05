import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProjectUnits, type ProjectUnit } from '@/lib/dbService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MasterplanViewer } from '@/components/property/MasterplanViewer';
import { VisitRequestDialog } from '@/components/forms/VisitRequestDialog';

interface ProjectUnitsSectionProps {
  projectId: number;
  projectName: string;
  masterplanImage?: string | null;
}

export function ProjectUnitsSection({
  projectId,
  projectName,
  masterplanImage,
}: ProjectUnitsSectionProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [units, setUnits] = useState<ProjectUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ProjectUnit | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const loadUnits = () => {
    setLoading(true);
    setError(false);
    getProjectUnits(projectId)
      .then((data) => {
        setUnits(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUnits();
  }, [projectId]);

  useEffect(() => {
    if (!loading && units.length > 0 && location.hash.startsWith('#unit-')) {
      const targetId = Number(location.hash.replace('#unit-', ''));
      if (targetId) {
        setHighlightedId(targetId);
        setTimeout(() => {
          document.getElementById(`unit-${targetId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
    }
  }, [loading, units, location.hash]);

  const handleMasterplanUnitClick = (clicked: { id: string }) => {
    const numId = Number(clicked.id);
    const found = units.find((u) => u.id === numId);
    if (found) {
      setHighlightedId(found.id);
      document.getElementById(`unit-${found.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (!['sold', 'rented'].includes(found.status)) {
        setSelectedUnit(found);
      }
    }
  };

  if (loading) {
    return (
      <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        {t('projectUnits.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-red-700 font-medium">{t('projectUnits.loadError')}</p>
        <Button size="sm" variant="outline" onClick={loadUnits}>
          {t('projectUnits.retry')}
        </Button>
      </div>
    );
  }

  if (!units.length) return null;

  const masterplanUnits = units.map((u, idx) => ({
    id: String(u.id),
    apartmentNumber: u.unit_number,
    status: u.status,
    beds: u.beds ?? undefined,
    area: u.area ?? undefined,
    coordX: 15 + ((idx * 19) % 70),
    coordY: 20 + ((idx * 23) % 60),
  }));

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            {t('projectUnits.eyebrow')}
          </p>
          <h2 className="text-2xl font-bold text-brand-navy mt-1">{t('projectUnits.title')}</h2>
        </div>
      </div>

      {masterplanImage && (
        <MasterplanViewer
          masterplanImage={masterplanImage}
          units={masterplanUnits}
          onUnitClick={handleMasterplanUnitClick}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => {
          const isHighlighted = highlightedId === unit.id;
          const badgeStatus = unit.status === 'reserved' ? 'pending' : unit.status;
          const bookable = !['sold', 'rented'].includes(unit.status);

          return (
            <div
              key={unit.id}
              id={`unit-${unit.id}`}
              className={`rounded-xl border bg-white p-5 shadow-sm transition-all flex flex-col gap-3 ${
                isHighlighted
                  ? 'border-brand-gold ring-2 ring-brand-gold/30 bg-brand-gold/5'
                  : 'border-gray-200 hover:border-brand-gold/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">
                    {projectName} — {t('projectUnits.unitPrefix', { number: unit.unit_number })}
                  </h3>
                  {unit.title && (
                    <p className="text-xs font-semibold text-neutral-500 mt-0.5">{unit.title}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {unit.floor !== null && `${t('projectUnits.floor', { floor: unit.floor })} • `}
                    {unit.beds !== null && `${t('projectUnits.beds', { count: unit.beds })} • `}
                    {unit.baths !== null && `${t('projectUnits.baths', { count: unit.baths })} • `}
                    {unit.area !== null && `${unit.area} m²`}
                  </p>
                </div>
                <Badge status={badgeStatus} />
              </div>

              {unit.price !== null && (
                <p className="text-xl font-extrabold text-brand-gold">
                  {unit.currency} {Number(unit.price).toLocaleString()}
                </p>
              )}

              {unit.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{unit.description}</p>
              )}

              <div className="pt-1">
                {bookable ? (
                  <Button size="sm" onClick={() => setSelectedUnit(unit)}>
                    {t('projectUnits.requestVisit')}
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-neutral-400">
                    {t('projectUnits.unavailableForVisit', { status: unit.status })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedUnit && (
        <VisitRequestDialog
          target={{
            label: `${projectName} — ${t('projectUnits.unitPrefix', { number: selectedUnit.unit_number })}`,
            projectId,
            projectUnitId: selectedUnit.id,
          }}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </section>
  );
}

export default ProjectUnitsSection;
