// src/features/hooks/useApplicantFilter.ts

import type { Applicant, Language, TabType } from '@features/types/applicant.types';
import { useMemo, useState } from 'react';

export const useApplicantFilter = (applicants: Applicant[]) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'all'>('all');

  // Función de búsqueda mejorada
  const advancedSearch = (applicant: Applicant, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase().trim();
    const email = applicant.email.toLowerCase();
    const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
    const firstName = applicant.firstName.toLowerCase();
    const lastName = applicant.lastName.toLowerCase();
    const roles = applicant.roles.map(role => role.toLowerCase()).join(' ');

    // Búsqueda exacta por email completo
    if (term.includes('@') && email === term) {
      return true;
    }

    // Búsqueda por dominio de email
    if (term.includes('@') && term.startsWith('@')) {
      const domain = term.substring(1);
      return email.includes(domain);
    }

    // Búsqueda por usuario de email (parte antes del @)
    if (term.includes('@') && !term.startsWith('@')) {
      const [username, domain] = term.split('@');
      if (domain) {
        return email.includes(username) && email.includes(domain);
      } else {
        return email.split('@')[0].includes(username);
      }
    }

    // Búsqueda parcial en email (sin @)
    if (email.includes(term)) {
      return true;
    }

    // Búsqueda por nombre completo
    if (fullName.includes(term)) {
      return true;
    }

    // Búsqueda por nombre o apellido individual
    if (firstName.includes(term) || lastName.includes(term)) {
      return true;
    }

    // Búsqueda por iniciales (ej: "jd" para "John Doe")
    if (term.length === 2) {
      const initials = firstName.charAt(0) + lastName.charAt(0);
      if (initials === term) {
        return true;
      }
    }

    // Búsqueda en roles
    if (roles.includes(term)) {
      return true;
    }

    // Búsqueda por palabras múltiples (cada palabra debe encontrarse)
    if (term.includes(' ')) {
      const words = term.split(' ').filter(word => word.length > 0);
      return words.every(word => 
        email.includes(word) || 
        fullName.includes(word) || 
        roles.includes(word)
      );
    }

    return false;
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesSearch = advancedSearch(applicant, searchTerm);
      const matchesLanguage = selectedLanguage === 'all' || applicant.language === selectedLanguage;
      
      let matchesTab = false;
      switch(activeTab) {
        case 'all':
          matchesTab = true;
          break;
        case 'pending':
          matchesTab = applicant.userId === null;
          break;
        case 'converted':
          matchesTab = applicant.userId !== null;
          break;
        case 'mentors':
          matchesTab = applicant.mentor === true;
          break;
        case 'colaboradoras':
          matchesTab = applicant.mentor === false;
          break;
        default:
          matchesTab = true;
          break;
      }
      
      return matchesSearch && matchesTab && matchesLanguage;
    });
  }, [applicants, activeTab, searchTerm, selectedLanguage]);

  // Función para obtener sugerencias de búsqueda
  const getSearchSuggestions = (term: string, limit = 5): string[] => {
    if (!term.trim() || term.length < 2) return [];

    const suggestions = new Set<string>();
    const termLower = term.toLowerCase();

    applicants.forEach(applicant => {
      const email = applicant.email.toLowerCase();
      const fullName = `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      
      // Sugerencias de email
      if (email.includes(termLower)) {
        suggestions.add(applicant.email);
      }

      // Sugerencias de nombre
      if (fullName.includes(termLower)) {
        suggestions.add(`${applicant.firstName} ${applicant.lastName}`);
      }

      // Sugerencias de dominio
      if (termLower.includes('@')) {
        const domain = applicant.email.split('@')[1];
        if (domain.includes(termLower.replace('@', ''))) {
          suggestions.add(`@${domain}`);
        }
      }
    });

    return Array.from(suggestions).slice(0, limit);
  };

  // Obtener idiomas únicos disponibles
  const availableLanguages = useMemo(() => {
    const languages = new Set(applicants.map(applicant => applicant.language));
    return Array.from(languages).sort();
  }, [applicants]);

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedLanguage,
    setSelectedLanguage,
    availableLanguages,
    filteredApplicants,
    getSearchSuggestions
  };
};
