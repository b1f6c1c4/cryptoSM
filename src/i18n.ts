import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en_US from './data/lang/en_US/index';
import zh_CN from './data/lang/zh_CN/index';
import zh_HK from './data/lang/zh_HK/index';

const resources = {
  en_US,
  zh_CN,
  zh_HK,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'zh_CN',
    interpolation: {
      escapeValue: false,
    },
    resources,
  });
