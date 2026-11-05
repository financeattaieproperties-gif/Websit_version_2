import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CheckCircle, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { ClickToCallButton } from '../components/ui/ClickToCallButton';
import { createLead } from '../lib/dbService';
import { SeoHead } from '../components/seo/SeoHead';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  propertyName: z.string().optional(),
  message: z.string().min(10, 'Please provide at least 10 characters'),
});

type FormValues = z.infer<typeof schema>;

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+93 782 222 279',
    href: 'tel:+93782222279',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+93 782 222 279',
    href: 'https://wa.me/93782222279',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@attaieproperties.com',
    href: 'mailto:info@attaieproperties.com',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Street #13, Wazir Akbar Khan, Kabul, Afghanistan',
    href: undefined,
  },
  {
    icon: MapPin,
    label: 'Website',
    value: 'www.attaieproperties.com',
    href: 'https://www.attaieproperties.com',
  },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createLead({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        propertyName: data.propertyName || 'General Inquiry',
      });
      setIsSuccess(true);
      reset();
    } catch (_err) {
      setSubmitError('Something went wrong. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-lg border transition-colors duration-200 outline-none bg-white text-brand-navy placeholder:text-neutral-400 ${
      hasError
        ? 'border-red-400 focus:ring-2 focus:ring-red-400 focus:border-red-400'
        : 'border-neutral-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold'
    }`;

  return (
    <main className="min-h-screen bg-brand-cream flex flex-col">
      <SeoHead />
      <Navbar />

      {/* Hero banner */}
      <section className="relative pt-36 pb-20 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        <div className="container-custom relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <Breadcrumbs
              variant="light"
              items={[{ label: t('nav.contact', 'Contact') }]}
              className="w-auto"
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-brand-gold text-xs font-bold uppercase tracking-[0.25em] mb-4 flex items-center justify-center gap-3"
          >
            <span className="inline-block w-8 h-[1px] bg-brand-gold/50" />
            Get in Touch
            <span className="inline-block w-8 h-[1px] bg-brand-gold/50" />
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            Contact Our Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-white/60 text-lg max-w-xl mx-auto"
          >
            Fill in the form below and one of our agents will get back to you within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding flex-grow">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12 max-w-5xl mx-auto">

            {/* Contact info sidebar */}
            <aside className="w-full lg:w-80 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-brand-navy mb-6">Contact Details</h2>
                <div className="space-y-5">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-brand-gold" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-0.5">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="text-brand-navy font-semibold hover:text-brand-gold transition-colors link-underline"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-brand-navy font-semibold">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-5 rounded-2xl bg-brand-navy text-white">
                  <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2">
                    Office Hours
                  </p>
                  <p className="font-semibold">Saturday – Thursday</p>
                  <p className="text-white/60 text-sm">8:00 AM – 6:00 PM (AFT)</p>
                  <p className="font-semibold mt-3">Friday</p>
                  <p className="text-white/60 text-sm">Closed</p>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">
                    Prefer a call?
                  </p>
                  <ClickToCallButton className="w-full justify-center" />
                </div>
              </motion.div>
            </aside>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="flex-1 bg-white rounded-2xl border border-brand-gold/15 p-8"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-status-available/10 flex items-center justify-center">
                      <CheckCircle size={32} className="text-status-available" />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-navy">Message Received!</h3>
                    <p className="text-neutral-500 max-w-sm">
                      Thank you for reaching out. One of our agents will contact you within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="mt-4 text-brand-gold font-semibold text-sm link-underline"
                    >
                      Send another inquiry
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-xl font-bold text-brand-navy mb-6">Send an Inquiry</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="name"
                          {...register('name')}
                          placeholder="Ahmad Karimi"
                          className={fieldClass(!!errors.name)}
                        />
                        {errors.name && (
                          <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                            <AlertCircle size={12} aria-hidden="true" />
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
                          Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          placeholder="+93 70 123 4567"
                          className={fieldClass(!!errors.phone)}
                        />
                        {errors.phone && (
                          <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                            <AlertCircle size={12} aria-hidden="true" />
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="ahmad@example.com"
                        className={fieldClass(!!errors.email)}
                      />
                      {errors.email && (
                        <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                          <AlertCircle size={12} aria-hidden="true" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="propertyName" className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
                        Property / Project of Interest
                        <span className="text-neutral-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <input
                        id="propertyName"
                        {...register('propertyName')}
                        placeholder="e.g. Aria Residences, Wazir Akbar Khan Villa…"
                        className={fieldClass(false)}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="message"
                        {...register('message')}
                        rows={5}
                        placeholder="Tell us what you're looking for — budget, location preference, unit type, timeline…"
                        className={`${fieldClass(!!errors.message)} resize-none`}
                      />
                      {errors.message && (
                        <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                          <AlertCircle size={12} aria-hidden="true" />
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {submitError && (
                      <p className="flex items-center gap-1.5 text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle size={16} aria-hidden="true" />
                        {submitError}
                      </p>
                    )}

                    <Button type="submit" loading={isSubmitting} className="w-full">
                      {isSubmitting ? 'Sending…' : 'Send Inquiry →'}
                    </Button>

                    <p className="text-xs text-neutral-400 text-center">
                      We respond within 24 hours. No spam, ever.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
