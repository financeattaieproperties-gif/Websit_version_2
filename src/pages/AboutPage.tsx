import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Award, Users, Home } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { getBranches, type Branch } from '../lib/dbService';
import { SeoHead } from '../components/seo/SeoHead';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { useTranslation } from 'react-i18next';

const stats = [
  { icon: Home, value: '500+', label: 'Properties Listed' },
  { icon: Users, value: '1,200+', label: 'Happy Clients' },
  { icon: Award, value: '10+', label: 'Years in Kabul' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState(false);
  useEffect(() => {
    getBranches().then(setBranches).catch(() => setBranchesError(true)).finally(() => setBranchesLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-brand-cream flex flex-col">
      <SeoHead />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-20 bg-brand-navy overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        <div className="container-custom relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <Breadcrumbs
              variant="light"
              items={[{ label: t('nav.about', 'About Us') }]}
              className="w-auto"
            />
          </div>
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Kabul, Afghanistan
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            About Attaie Properties
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Kabul's premier real estate agency — trusted by Afghan families and the
            diaspora for over a decade.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-neutral-100">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <Icon size={26} className="text-brand-gold" />
                </div>
                <p className="text-3xl font-display font-bold text-brand-navy">{value}</p>
                <p className="text-neutral-500 text-sm font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-custom py-16 max-w-3xl">
        <h2 className="text-2xl font-display font-bold text-brand-navy mb-6">Our Story</h2>
        <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed space-y-4">
          <p>
            Attaie Properties was founded with a single mission: to make buying, selling, and
            renting property in Kabul transparent, trustworthy, and straightforward. We serve
            local families, returning diaspora, and international investors looking for verified
            opportunities in Afghanistan's capital.
          </p>
          <p>
            Every listing on our platform is personally verified by our team. We work
            exclusively with legal, title-clear properties and provide full documentation
            support throughout the transaction process.
          </p>
          <p>
            Our office is located in Wazir Akbar Khan — Kabul's most established residential
            and diplomatic quarter — and our agents speak Dari, Pashto, and English.
          </p>
        </div>
      </section>

      {/* Admin-managed branch directory */}
      <section className="container-custom py-16">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold mb-2">Find us</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-navy">Our Branches</h2>
        </div>
        {branchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-label="Loading branches">
            {[0, 1].map(item => <div key={item} className="h-36 rounded-2xl bg-white animate-pulse" />)}
          </div>
        ) : branchesError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">Branch information could not be loaded.</p>
        ) : branches.length === 0 ? (
          <p className="rounded-xl border border-brand-navy/10 bg-white p-6 text-neutral-500">Branch information will be added here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {branches.map(branch => <article key={branch.id} className="rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-brand-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10"><MapPin size={20} className="text-brand-gold" /></div>
                <div><h3 className="text-lg font-bold text-brand-navy">{branch.name}</h3><p className="mt-1 text-sm leading-relaxed text-neutral-600">{branch.address}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {branch.phone && <a className="inline-flex items-center gap-2 font-semibold text-brand-navy hover:text-brand-gold" href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`}><Phone size={15} />{branch.phone}</a>}
                    {branch.email && <a className="inline-flex items-center gap-2 font-semibold text-brand-navy hover:text-brand-gold" href={`mailto:${branch.email}`}><Mail size={15} />{branch.email}</a>}
                  </div>
                </div>
              </div>
            </article>)}
          </div>
        )}
      </section>

      {/* Contact strip */}
      <section className="bg-brand-navy mt-auto">
        <div className="container-custom py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, label: 'Address', value: 'Street #13, Wazir Akbar Khan, Kabul, Afghanistan' },
            { icon: Phone, label: 'Phone', value: '+93 782 222 279', href: 'tel:+93782222279' },
            { icon: Mail, label: 'Email', value: 'info@attaieproperties.com', href: 'mailto:info@attaieproperties.com' },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-gold/15 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                {href ? (
                  <a href={href} className="text-white hover:text-brand-gold transition-colors text-sm font-medium">
                    {value}
                  </a>
                ) : (
                  <p className="text-white text-sm font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
