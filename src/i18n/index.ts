import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fa from './locales/fa.json';

const savedLang = localStorage.getItem('lang') ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    fa: { common: fa },
  },
  lng: savedLang,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === 'fa' ? 'rtl' : 'ltr';

export function toggleLanguage() {
  const next = i18n.language === 'en' ? 'fa' : 'en';
  i18n.changeLanguage(next);
  localStorage.setItem('lang', next);
  document.documentElement.lang = next;
  document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr';
}

export default i18n;
