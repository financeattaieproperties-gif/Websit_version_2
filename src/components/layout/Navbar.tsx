import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toggleLanguage } from '../../i18n/index';
import { Button, cn } from '../ui/Button';
import { Menu, X, Globe, Phone } from 'lucide-react';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => setIsScrolled(window.scrollY > 60));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.properties'), href: '/properties' },
    { name: t('nav.projects'), href: '/projects' },
    { name: t('nav.agents'), href: '/agents' },
    { name: t('nav.careers'), href: '/careers' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        isScrolled
          ? 'bg-brand-navy/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] py-3'
          : 'bg-transparent py-5',
      )}
    >
      <div className="container-custom flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="group flex items-center">
            <img
              src="/logo.png"
              alt="Attaie Properties"
              className="h-16 w-auto object-contain transition-opacity duration-200 group-hover:opacity-85"
              decoding="async"
            />
          </a>
        </div>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  'relative font-medium text-sm tracking-wide transition-colors duration-200 py-1 px-3 rounded-full',
                  active
                    ? 'text-brand-gold'
                    : 'text-white/75 hover:text-white hover:bg-white/8',
                )}
              >
                {link.name}
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-3 right-3 h-[1.5px] bg-brand-gold rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Phone size={16} className="text-brand-gold" />
            <span className="font-bold text-sm">+93 782 222 279</span>
          </div>
          <div className="h-4 w-[1px] bg-white/20" />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 p-2 text-sm font-medium text-white/70 transition-colors hover:text-brand-gold"
            aria-label="Switch language"
          >
            <Globe size={16} />
            {t('nav.langToggle')}
          </button>
          <Button variant="primary" className={cn(showPulse && 'pulse-gold')} onClick={() => window.location.href = '/contact'}>
            {t('nav.enquire')}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden absolute top-full left-0 w-full bg-brand-navy/98 backdrop-blur-xl border-t border-white/10 shadow-2xl"
          >
            <div className="container-custom py-6 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg font-semibold text-white border-b border-white/8 py-3.5 hover:text-brand-gold transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-3 pt-5"
              >
                <div className="flex items-center gap-3 text-white">
                  <Phone size={18} className="text-brand-gold" />
                  <span className="font-bold">+93 782 222 279</span>
                </div>
                <Button className="w-full" onClick={() => { window.location.href = '/contact'; setIsOpen(false); }}>{t('nav.enquire')}</Button>
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/20 rounded-lg text-white font-medium hover:border-brand-gold hover:text-brand-gold transition-colors"
                >
                  <Globe size={16} /> {t('nav.langToggle')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export { Navbar };
