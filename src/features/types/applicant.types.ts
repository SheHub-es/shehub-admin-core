// src/features/types/applicant.types.ts

export type Applicant = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  roles: string[];
  language?: 'SPANISH' | 'ENGLISH' | 'CATALAN';
  timestamp: string;
  deleted: boolean;
  userId?: number | null;
  deletedAt?: string | null;
};

export type TabType = 'all' | 'pending' | 'converted' | 'mentors';

export type UserInfo = {
  email: string;
  role: string;
  displayName: string;
};

export type ApplicantStats = {
  total: number;
  pending: number;
  converted: number;
  mentors: number;
};
