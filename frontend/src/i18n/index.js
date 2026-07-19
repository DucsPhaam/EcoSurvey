import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import vi from './locales/vi.json';
import en from './locales/en.json';

const resources = {
  vi: {
    translation: vi,
    common: vi.common,
    admin: vi.admin,
    survey: vi.survey,
    participation: vi.participation,
    auth: vi.auth,
    dashboard: vi.dashboard,
    leaderboard: vi.leaderboard,
    nav: vi.nav,
    landing: vi.landing
  },
  en: {
    translation: en,
    common: en.common,
    admin: en.admin,
    survey: en.survey,
    participation: en.participation,
    auth: en.auth,
    dashboard: en.dashboard,
    leaderboard: en.leaderboard,
    nav: en.nav,
    landing: en.landing
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Mặc định là Tiếng Việt nếu không tìm thấy
    debug: false,
    interpolation: {
      escapeValue: false // React đã tự escape chống XSS
    }
  });

export default i18n;
