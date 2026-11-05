import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, CalendarDays, Phone, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { submitVisitRequest } from '../../lib/dbService';

export interface VisitTarget {
  label: string;
  propertyId?: number;
  projectId?: number;
  projectUnitId?: number;
}

const KABUL_OFFSET = 4.5 * 60 * 60 * 1000;
const dateInKabul = () => new Date(Date.now() + KABUL_OFFSET).toISOString().slice(0, 10);
const isFriday = (date: string) => new Date(`${date}T12:00:00+04:30`).getDay() === 5;
const nextNonFridayDate = () => {
  const today = dateInKabul();
  if (!isFriday(today)) return today;
  const tomorrow = new Date(Date.now() + KABUL_OFFSET + 24 * 60 * 60 * 1000);
  return tomorrow.toISOString().slice(0, 10);
};
const slots = Array.from({ length: 27 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

export function VisitRequestDialog({ target, onClose }: { target: VisitTarget; onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(nextNonFridayDate);
  const [time, setTime] = useState('10:00');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const friday = useMemo(() => isFriday(date), [date]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    nameInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]):not(.hidden), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (friday) {
      setError(t('visitDialog.fridayError'));
      return;
    }
    setError('');
    setStatus('sending');
    try {
      await submitVisitRequest({ name, phone, requestedAt: `${date}T${time}:00+04:30`, ...target });
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('visitDialog.defaultError'));
      setStatus('idle');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-brand-navy/75 backdrop-blur-xs p-4 flex items-center justify-center"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-brand-xl"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-wider">
              {t('visitDialog.eyebrow')}
            </p>
            <h2 id="visit-title" className="text-2xl font-bold text-brand-navy">
              {t('visitDialog.titlePrefix', { target: target.label })}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">{t('visitDialog.subtitle')}</p>
          </div>
          <button
            type="button"
            aria-label={t('visitDialog.closeLabel')}
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 hover:text-brand-navy hover:bg-neutral-100 transition-colors"
          >
            <X />
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto text-status-available mb-4" size={42} />
            <h3 className="text-xl font-bold text-brand-navy">{t('visitDialog.successTitle')}</h3>
            <p className="mt-2 text-neutral-600">{t('visitDialog.successBody')}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-5 py-3 rounded-xl bg-brand-navy text-white font-semibold hover:bg-brand-navy-light transition-colors"
            >
              {t('visitDialog.closeBtn')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold text-brand-navy">
              {t('visitDialog.fullName')}
              <input
                ref={nameInputRef}
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-semibold text-brand-navy">
              {t('visitDialog.phone')}
              <input
                required
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="07XX XXX XXXX"
                className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-sm font-semibold text-brand-navy">
                {t('visitDialog.date')}
                <input
                  required
                  min={dateInKabul()}
                  type="date"
                  value={date}
                  onChange={(event) => {
                    const selected = event.target.value;
                    setDate(selected);
                    if (selected && isFriday(selected)) {
                      setError(t('visitDialog.fridayClosed'));
                    } else {
                      setError('');
                    }
                  }}
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3"
                />
              </label>
              <label className="block text-sm font-semibold text-brand-navy">
                {t('visitDialog.time')}
                <select
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3"
                >
                  {slots.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="flex gap-2 text-xs text-neutral-500">
              <CalendarDays size={15} className="shrink-0" />
              {t('visitDialog.hoursHint')}
            </p>
            {friday && <p className="text-sm text-red-600">{t('visitDialog.fridayClosed')}</p>}
            {error && !friday && <p className="text-sm text-red-600">{error}</p>}
            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <button
              type="submit"
              disabled={status === 'sending' || friday}
              className="w-full rounded-xl bg-brand-gold px-5 py-3 font-bold text-white hover:bg-brand-gold-dark transition-colors disabled:opacity-50"
            >
              <Phone size={17} className="inline mx-2" />
              {status === 'sending' ? t('visitDialog.sending') : t('visitDialog.submitBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

