import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageCircle, Camera, Briefcase, Video, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-brand-ivory border-t-2 border-brand-gold/20 pt-20 pb-10">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div>
            <div className="group mb-6">
              <span className="text-2xl font-display font-bold block text-brand-navy transition-all duration-300">
                ATTAIE <span className="text-brand-gold">PROPERTIES</span>
              </span>
            </div>
            <p className="text-neutral-600 mb-8 leading-relaxed text-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="p-2.5 bg-brand-gold/10 rounded-full text-brand-gold hover:bg-brand-gold hover:text-white transition-colors shadow-sm hover:shadow-gold-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="p-2.5 bg-brand-gold/10 rounded-full text-brand-gold hover:bg-brand-gold hover:text-white transition-colors shadow-sm hover:shadow-gold-sm"
                aria-label="Instagram"
              >
                <Camera size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="p-2.5 bg-brand-gold/10 rounded-full text-brand-gold hover:bg-brand-gold hover:text-white transition-colors shadow-sm hover:shadow-gold-sm"
                aria-label="LinkedIn"
              >
                <Briefcase size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.15, rotate: 12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="p-2.5 bg-brand-gold/10 rounded-full text-brand-gold hover:bg-brand-gold hover:text-white transition-colors shadow-sm hover:shadow-gold-sm"
                aria-label="YouTube"
              >
                <Video size={18} />
              </motion.a>
            </div>
          </div>

          {/* Quick links column */}
          <div>
            <h4 className="text-sm font-bold mb-6 text-brand-navy uppercase tracking-wider border-b-2 border-brand-gold/30 pb-2 inline-block">
              {t('footer.quickLinks')}
            </h4>
            <motion.ul
              className="flex flex-col gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  {t('nav.home')}
                </a>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/about" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  {t('nav.about')}
                </a>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/properties" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  {t('nav.properties')}
                </a>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/projects" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  {t('nav.projects')}
                </a>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/careers" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  {t('nav.careers')}
                </a>
              </motion.li>
            </motion.ul>
          </div>

          {/* Properties section column */}
          <div>
            <h4 className="text-sm font-bold mb-6 text-brand-navy uppercase tracking-wider border-b-2 border-brand-gold/30 pb-2 inline-block">
              {t('footer.propertiesSection')}
            </h4>
            <motion.ul
              className="flex flex-col gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/properties?purpose=buy" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  Buy Property
                </a>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/properties?purpose=rent" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  Rent Property
                </a>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}>
                <a href="/properties?type=Commercial" className="text-neutral-600 hover:text-brand-gold transition-colors text-sm link-underline">
                  Commercial
                </a>
              </motion.li>
            </motion.ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="text-sm font-bold mb-6 text-brand-navy uppercase tracking-wider border-b-2 border-brand-gold/30 pb-2 inline-block">
              {t('footer.contactUs')}
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-3 text-neutral-600 text-sm">
                <MapPin size={18} className="text-brand-gold shrink-0 mt-0.5" />
                <span>Street #13, Wazir Akbar Khan, Kabul, Afghanistan</span>
              </li>
              <li className="flex gap-3 text-neutral-600 text-sm">
                <Phone size={18} className="text-brand-gold shrink-0" />
                <span>+93 782 222 279</span>
              </li>
              <li className="flex gap-3 text-neutral-600 text-sm">
                <Mail size={18} className="text-brand-gold shrink-0" />
                <span>info@attaieproperties.com</span>
              </li>
              <li className="flex gap-3 text-neutral-600 text-sm">
                <span className="text-brand-gold shrink-0 font-bold">@</span>
                <a href="https://www.attaieproperties.com" className="hover:text-brand-gold transition-colors">www.attaieproperties.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative pt-8 mt-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>{t('footer.rights')}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-brand-gold transition-colors link-underline">
                {t('footer.privacy')}
              </a>
              <a href="#" className="hover:text-brand-gold transition-colors link-underline">
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
