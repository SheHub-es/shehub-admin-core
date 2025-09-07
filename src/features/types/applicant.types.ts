
// export type Language = 'ES' | 'EN' | 'CAT' | 'EN_GB' | 'EN_US';

// export interface Applicant {
//   id: number;
//   email: string;
//   firstName: string;
//   lastName: string;
//   mentor: boolean;
//   displayRole: string;
//   language: Language;   
//   roles: string[];
//   timestamp: string;    
//   deleted: boolean;
//   deletedAt: string | null;
//   userId: number | null;
// }

// export interface ApplicantStats {
//   total: number;
//   pending: number;
//   converted: number;
//   mentors: number;
//   colaboradoras: number;
// }

// export type TabType = 'all' | 'pending' | 'converted' | 'mentors' | 'colaboradoras';

// export interface UserInfo {
//   email: string;
//   displayName: string;
//   role: string;
// }

// export const getLanguageDisplayName = (language: Language): string => {
//   switch (language) {
//     case 'ES': return 'Español';
//     case 'EN': return 'English';
//     case 'CAT': return 'Catalán';
//     case 'EN_GB': return 'English (UK)';
//     case 'EN_US': return 'English (US)';
//     default: return 'Español';
//   }
// };

// export const getLanguageCode = (language: Language): string => {
//   return language; 
// };


// export const parseLanguageFromBackend = (languageCode: string | null | undefined): Language => {
//   if (!languageCode) return 'ES';
  
//   const normalized = languageCode.trim().toUpperCase();
//   switch (normalized) {
//     case 'ES': return 'ES';
//     case 'EN': return 'EN';
//     case 'CAT': return 'CAT';
//     case 'EN_GB':
//     case 'EN-GB': return 'EN_GB';
//     case 'EN_US':
//     case 'EN-US': return 'EN_US';
//     default: return 'ES';
//   }
// };
