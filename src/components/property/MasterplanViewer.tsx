import React, { useState } from 'react';

interface Unit {
  id: string;
  status: 'available' | 'pending' | 'sold' | 'reserved' | 'rented';
  shapePath?: string;
  coordX?: number;
  coordY?: number;
  apartmentNumber?: string;
  beds?: number;
  area?: number;
}

interface MasterplanViewerProps {
  masterplanImage: string;
  units: Unit[];
  onUnitClick: (unit: Unit) => void;
}

export const MasterplanViewer = ({ masterplanImage, units, onUnitClick }: MasterplanViewerProps) => {
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);

  const getStatusColor = (status: Unit['status']) => {
    switch (status) {
      case 'available': return 'rgba(34, 197, 94, 0.5)'; // green
      case 'pending': return 'rgba(245, 158, 11, 0.5)'; // amber
      case 'sold': return 'rgba(239, 68, 68, 0.5)'; // red
      default: return 'rgba(0, 0, 0, 0.5)';
    }
  };

  return (
    <div className="relative w-full aspect-video bg-neutral-100 rounded-xl overflow-hidden cursor-crosshair">
      <img src={masterplanImage} alt="Masterplan" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
      
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-10">
        {units.map((unit) => {
          if (unit.shapePath) {
            return (
              <path
                key={unit.id}
                d={unit.shapePath}
                fill={getStatusColor(unit.status)}
                stroke="white"
                strokeWidth="0.5"
                className="transition-all duration-200 hover:opacity-80"
                onClick={() => onUnitClick(unit)}
                onMouseEnter={() => setHoveredUnit(unit)}
                onMouseLeave={() => setHoveredUnit(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          }
          if (unit.coordX && unit.coordY) {
            return (
              <circle
                key={unit.id}
                cx={unit.coordX}
                cy={unit.coordY}
                r="1.5"
                fill={getStatusColor(unit.status)}
                stroke="white"
                strokeWidth="0.5"
                className="transition-all duration-200 hover:r-2"
                onClick={() => onUnitClick(unit)}
                onMouseEnter={() => setHoveredUnit(unit)}
                onMouseLeave={() => setHoveredUnit(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          }
          return null;
        })}
      </svg>

      {hoveredUnit && (
        <div className="absolute top-4 right-4 z-20 bg-white p-3 rounded-lg shadow-lg pointer-events-none">
          <p className="font-bold text-brand-navy">Unit {hoveredUnit.apartmentNumber}</p>
          <p className="text-sm capitalize" style={{ color: getStatusColor(hoveredUnit.status).replace('0.5', '1') }}>
            {hoveredUnit.status}
          </p>
          <div className="flex gap-3 text-xs text-neutral-500 mt-1">
            {hoveredUnit.beds && <span>{hoveredUnit.beds} Beds</span>}
            {hoveredUnit.area && <span>{hoveredUnit.area} m²</span>}
          </div>
        </div>
      )}
    </div>
  );
};
