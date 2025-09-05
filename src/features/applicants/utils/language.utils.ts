export const LANGUAGES = [
  { code: "ES", label: "Español" },
  { code: "EN", label: "English" },
  { code: "CAT", label: "Catalán" },
  { code: "EN_GB", label: "English (UK)" },
  { code: "EN_US", label: "English (US)" }
];
// utils/language.utils.ts
import type { Language } from '../../../features/types/applicant.types';

export const getLanguageDisplay = (language: Language): string => {
  switch (language) {
    case 'ES':
      return '🇪🇸 Español';
    case 'EN':
      return '🇬🇧 English';
    case 'CAT':
      return '🟨🟥 Catalán';
    case 'EN_GB':
      return '🇬🇧 English (UK)';
    case 'EN_US':
      return '🇺🇸 English (US)';
    default:
      return language;
  }
};

export const getLanguageFlag = (language: Language): string => {
  switch (language) {
    case 'ES':
      return '🇪🇸 ES';
    case 'EN':
      return '🇬🇧 EN';
    case 'EN_GB':
      return '🇬🇧 EN (UK)';
    case 'EN_US':
      return '🇺🇸 EN (US)';
    case 'CAT':
      return '🟨🟥 CAT';
    default:
      return language;
  }
};