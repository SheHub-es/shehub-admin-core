// src/features/hooks/useApplicantStats.ts

import type { Applicant, ApplicantStats } from '@features/types/applicant.types';
import { useMemo } from 'react';

export const useApplicantStats = (applicants: Applicant[]): ApplicantStats => {
  return useMemo(() => ({
    total: applicants.length,
    pending: applicants.filter(a => a.userId === null).length, // En lista de espera
    converted: applicants.filter(a => a.userId !== null).length, // Registradas como usuarias
    mentors: applicants.filter(a => a.mentor === true).length, // Mentores
  }), [applicants]);
};
