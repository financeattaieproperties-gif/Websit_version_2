import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  X,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Send,
  Building2,
  Phone,
  Mail,
  User,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { createLead } from '../../lib/dbService';

const quickContactSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  message: z.string().min(5, 'Please include a short message'),
});

type QuickContactFormValues = z.infer<typeof quickContactSchema>;

export interface QuickContactPropertyDetails {
  id: string;
  serialNumber?: string;
  title: string;
  priceDisplay: string;
  location: string;
  type?: string;
  listingType?: 'sale' | 'rent';
  image?: string | null;
}

interface QuickContactModalProps {
  open: boolean;
  onClose: () => void;
  property: QuickContactPropertyDetails;
}

export const QuickContactModal: React.FC<QuickContactModalProps> = ({
  open,
  onClose,
  property,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  const defaultMessage = `Hello, I would like to inquire about "${property.title}"${
    property.serialNumber ? ` (Ref. ${property.serialNumber})` : ''
  } in ${property.location}, listed at ${property.priceDisplay}. Please get in touch with me with more information.`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickContactFormValues>({
    resolver: zodResolver(quickContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: defaultMessage,
    },
  });

  // Reset pre-filled message whenever the target property changes or modal re-opens
  useEffect(() => {
    if (open) {
      setIsSuccess(false);
      setSubmitError(null);
      reset({
        name: '',
        email: '',
        phone: '',
        message: defaultMessage,
      });
    }
  }, [open, defaultMessage, reset]);

  // Keyboard accessibility: Escape to close, Tab focus trap, and focus restoration
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      const firstInput = dialogRef.current?.querySelector<HTMLElement>('input, textarea, button');
      firstInput?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
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
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const onSubmit = async (data: QuickContactFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createLead({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        propertyId: property.id,
        propertyName: property.serialNumber
          ? `${property.title} (Ref. ${property.serialNumber})`
          : property.title,
      });
      setIsSuccess(true);
    } catch {
      setSubmitError('Unable to send inquiry right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] bg-brand-navy/75 backdrop-blur-xs p-4 flex items-center justify-center overflow-y-auto"
          role="presentation"
          onMouseDown={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-contact-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-brand-navy/10 overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="bg-brand-navy px-6 py-5 flex items-start justify-between gap-4 relative overflow-hidden">
              <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-brand-gold-lt text-xs font-bold uppercase tracking-[0.2em]">
                  Quick Contact
                </p>
                <h2 id="quick-contact-title" className="text-xl font-heading font-bold text-white mt-0.5">
                  Inquire About This Property
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close quick contact modal"
                onClick={onClose}
                className="relative z-10 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Pre-filled Property Summary Card */}
            <div className="px-6 py-4 bg-brand-cream border-b border-neutral-200/80 flex items-center gap-4">
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-brand-navy shrink-0 border border-brand-navy/10">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <Building2 size={22} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {property.serialNumber && (
                    <span className="font-mono text-[11px] font-bold text-brand-gold">
                      Ref. {property.serialNumber}
                    </span>
                  )}
                  {property.type && (
                    <span className="text-[11px] font-semibold text-neutral-500">
                      {property.serialNumber ? '· ' : ''}
                      {property.type}
                    </span>
                  )}
                </div>
                <p className="font-heading font-bold text-brand-navy text-sm sm:text-base truncate">
                  {property.title}
                </p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="flex items-center gap-1 text-xs text-neutral-500 truncate">
                    <MapPin size={12} className="text-brand-gold shrink-0" />
                    <span className="truncate">{property.location}</span>
                  </p>
                  <span className="font-heading font-extrabold text-brand-gold text-sm shrink-0">
                    {property.priceDisplay}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-status-available/15 text-status-available flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-navy">Inquiry Sent Successfully</h3>
                  <p className="text-sm text-neutral-600 mt-2 max-w-sm mx-auto">
                    Our property advisor has received your inquiry regarding{' '}
                    <span className="font-semibold text-brand-navy">{property.title}</span> and will
                    contact you shortly.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor={`qc-name-${property.id}`}
                      className="block text-xs font-semibold text-brand-navy uppercase tracking-wide mb-1.5"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                      />
                      <input
                        id={`qc-name-${property.id}`}
                        {...register('name')}
                        placeholder="Ahmad Karimi"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-brand-navy transition-colors outline-none ${
                          errors.name
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                        <AlertCircle size={12} />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor={`qc-email-${property.id}`}
                        className="block text-xs font-semibold text-brand-navy uppercase tracking-wide mb-1.5"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <input
                          id={`qc-email-${property.id}`}
                          type="email"
                          {...register('email')}
                          placeholder="ahmad@example.com"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-brand-navy transition-colors outline-none ${
                            errors.email
                              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                          <AlertCircle size={12} />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`qc-phone-${property.id}`}
                        className="block text-xs font-semibold text-brand-navy uppercase tracking-wide mb-1.5"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                        />
                        <input
                          id={`qc-phone-${property.id}`}
                          type="tel"
                          {...register('phone')}
                          placeholder="+93 70 123 4567"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-brand-navy transition-colors outline-none ${
                            errors.phone
                              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : 'border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                          <AlertCircle size={12} />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`qc-message-${property.id}`}
                      className="flex items-center justify-between text-xs font-semibold text-brand-navy uppercase tracking-wide mb-1.5"
                    >
                      <span>Pre-filled Property Inquiry</span>
                      <MessageSquare size={13} className="text-brand-gold" />
                    </label>
                    <textarea
                      id={`qc-message-${property.id}`}
                      {...register('message')}
                      rows={3}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-brand-navy transition-colors outline-none resize-none ${
                        errors.message
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-neutral-300 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20'
                      }`}
                    />
                    {errors.message && (
                      <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                        <AlertCircle size={12} />
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <p className="flex items-center gap-1.5 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle size={14} className="shrink-0" />
                      {submitError}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:text-brand-navy hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button type="submit" loading={isSubmitting} className="gap-2 rounded-xl px-6">
                      <Send size={15} />
                      <span>{isSubmitting ? 'Sending…' : 'Send Inquiry'}</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
