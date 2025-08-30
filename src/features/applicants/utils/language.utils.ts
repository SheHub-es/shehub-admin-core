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
    case 'EN_GB':
      return '🇬🇧 EN';
    case 'EN_US':
      return '🇺🇸 EN';
    case 'CAT':
      return '🟨🟥 CAT';
    default:
      return language;
  }
};