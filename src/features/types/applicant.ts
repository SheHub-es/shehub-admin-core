// types/applicant.ts

export enum Language {
  ES = 'ES',
  EN = 'EN',
  CAT = 'CAT',
  EN_GB = 'EN_GB',
  EN_US = 'EN_US'
}

// Helper function to get display names
export const getLanguageDisplayName = (language: Language): string => {
  switch (language) {
    case Language.ES:
      return 'Español';
    case Language.EN:
      return 'English';
    case Language.CAT:
      return 'Catalán';
    case Language.EN_GB:
      return 'English (UK)';
    case Language.EN_US:
      return 'English (US)';
    default:
      return 'Español';
  }
};

export interface Applicant {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language: Language | string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  userId?: number | null;
  deleted?: boolean;
  displayRole?: string; 
  registeredUser?: boolean; 
}

export interface CreateApplicantDto {
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language?: string; 
  roles: string[];
}

export interface UpdateApplicantDto {
  firstName?: string;
  lastName?: string;
  mentor?: boolean;
  language?: Language;
  roles?: string[];
}

export interface ApplicantListItemDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language: Language | string;
  roles: string[];
  displayRole?: string;
  deleted?: boolean;
  deletedAt?: string | null;
  timestamp?: string; 
}

export interface ApplicantDetailDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language: Language | string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  timestamp?: string;
  userId?: number;
}

export interface EmailExistsDto {
  email: string;
  exists: boolean;
  isDeleted: boolean;
}

export interface ApplicantStatsDto {
  total: number;
  mentors: number;
  colaboradoras: number;
  pending: number;
  registered: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}