import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from '../locales/fr.json';
import en from '../locales/en.json';

const LANGUAGE_KEY = '@app_language';

// Fonction pour récupérer la langue sauvegardée
const getStoredLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    const locales = getLocales();
    return storedLang || locales[0]?.languageCode || 'fr'; // Langue du système par défaut
  } catch {
    return 'fr'; // Français par défaut en cas d'erreur
  }
};

// Fonction pour sauvegarder la langue
export const saveLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Initialisation d'i18n
const initI18n = async () => {
  const storedLanguage = await getStoredLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        fr: { translation: fr },
        en: { translation: en },
      },
      lng: storedLanguage,
      fallbackLng: 'fr',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
