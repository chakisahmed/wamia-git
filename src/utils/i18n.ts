// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';

import { I18nManager } from 'react-native';

const LANGUAGE_KEY = 'selectedLanguage';

// Function to get saved language or fallback to device language
const getSavedLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  return savedLanguage || Localization.locale.split('-')[0] || 'en'; // Fallback to 'en'
};

// Initialize i18n   
(async () => {
  const initialLanguage = await getSavedLanguage();
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        fr: { translation: fr },
        ar: { translation: ar },
        es: { translation: es },
        de: { translation: de },
        it: { translation: it },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: true, // This is the key change
      },
    });
})();

export const changeLanguage = async (language:string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  i18n.changeLanguage(language);
};

export default i18n;
