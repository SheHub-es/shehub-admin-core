// src/features/hooks/useApplicantFilter.ts

import type { Applicant, TabType } from '@features/types/applicant.types';
import { useMemo, useState } from 'react';

export const useApplicantFilter = (applicants: Applicant[]) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      const matchesSearch = applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fullName.includes(searchTerm.toLowerCase());
      
      let matchesTab = false;
      switch(activeTab) {
        case 'all':
          matchesTab = true;
          break;
        case 'pending':
          matchesTab = applicant.userId === null; // En lista de espera
          break;
        case 'converted':
          matchesTab = applicant.userId !== null; // Registradas como usuarias
          break;
        case 'mentors':
          matchesTab = applicant.mentor === true; // Mentores
          break;
      }
      
      return matchesSearch && matchesTab;
    });
  }, [applicants, activeTab, searchTerm]);

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredApplicants
  };
};
