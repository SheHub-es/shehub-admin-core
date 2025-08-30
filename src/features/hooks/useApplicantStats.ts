// src/features/hooks/useApplicantStats.ts

import type { Applicant, ApplicantStats } from '@features/types/applicant.types';
import { useMemo } from 'react';

export const useApplicantStats = (applicants: Applicant[]): ApplicantStats => {
  return useMemo(() => {
    const total = applicants.length;
    const mentors = applicants.filter(a => a.mentor).length;
    const colaboradoras = applicants.filter(a => !a.mentor).length;
    const pending = applicants.filter(a => !a.userId).length;
    const converted = applicants.filter(a => a.userId !== null).length;

    return {
      total,
      mentors,
      colaboradoras,
      pending,
      converted
    };
  }, [applicants]);
};
