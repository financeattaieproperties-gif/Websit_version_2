"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createLead } from '../../lib/dbService';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  message: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export const InquiryForm = ({ propertyId, propertyName }: { propertyId?: string, propertyName?: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema)
  });

  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createLead({
        ...data,
        propertyId,
        propertyName
      });
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (_error) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-white/60 backdrop-blur-md p-6 rounded-xl border border-white/60"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      <h3 className="font-heading text-xl font-bold text-brand-navy mb-4">
        {propertyName ? `Inquire about ${propertyName}` : 'Contact an Agent'}
      </h3>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3 p-6 bg-status-available/10 rounded-xl text-center mb-4"
          >
            <CheckCircle size={32} className="text-status-available" />
            <p className="font-semibold text-status-available">Thank you! We'll be in touch shortly.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSuccess && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              {...register('name')}
              placeholder="Ahmad Karimi"
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                errors.name
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold'
              } outline-none`}
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              placeholder="ahmad@example.com"
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                errors.email
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold'
              } outline-none`}
            />
            {errors.email && (
              <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              {...register('phone')}
              type="tel"
              placeholder="+93 70 123 4567"
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                errors.phone
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold'
              } outline-none`}
            />
            {errors.phone && (
              <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
              Message (Optional)
            </label>
            <textarea
              id="message"
              {...register('message')}
              placeholder="I am interested in this property..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none resize-none transition-colors duration-200"
            />
          </div>

          {submitError && (
            <p className="flex items-center gap-1 text-red-500 text-xs font-medium">
              <AlertCircle size={12} aria-hidden="true" />
              {submitError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Sending…' : 'Send Inquiry →'}
          </Button>
        </form>
      )}
    </div>
  );
};
