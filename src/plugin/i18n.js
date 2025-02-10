import { createI18n } from 'vue-i18n';
import fr from '@/locales/fr.json';
import en from '@/locales/en.json';

const messages = {
    en: en,
    fr: fr,
};

// Get the stored language from localStorage or default to 'en'
const storedLanguage = localStorage.getItem('user-language') || 'en';

const i18n = createI18n({
    legacy: false,
    locale: storedLanguage,
    fallbackLocale: 'fr',
    messages: messages,
});

export default i18n;
