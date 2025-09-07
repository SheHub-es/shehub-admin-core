// hooks/useApplicantFilters.ts
import { useMemo, useState } from 'react';
import { ApplicantListItemDto, Language } from '../types/applicant';

interface ApplicantFilters {
  searchTerm: string;
  languageFilter: Language | 'all';
  mentorFilter: 'all' | 'mentor' | 'colaboradora';
  statusFilter: 'all' | 'active' | 'deleted';
}

interface UseApplicantFiltersResult {
  // Estados de filtros
  filters: ApplicantFilters;
  
  // Setters individuales
  setSearchTerm: (term: string) => void;
  setLanguageFilter: (filter: Language | 'all') => void;
  setMentorFilter: (filter: 'all' | 'mentor' | 'colaboradora') => void;
  setStatusFilter: (filter: 'all' | 'active' | 'deleted') => void;
  
  // Función para limpiar todos los filtros
  clearAllFilters: () => void;
  
  // Función para aplicar filtros a una lista de applicants
  applyFilters: (applicants: ApplicantListItemDto[]) => ApplicantListItemDto[];
  
  // Función auxiliar para verificar si hay filtros activos
  hasActiveFilters: boolean;
}

export function useApplicantFilters(initialStatusFilter: 'all' | 'active' | 'deleted' = 'active'): UseApplicantFiltersResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [mentorFilter, setMentorFilter] = useState<'all' | 'mentor' | 'colaboradora'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>(initialStatusFilter);

  const filters: ApplicantFilters = {
    searchTerm,
    languageFilter,
    mentorFilter,
    statusFilter,
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLanguageFilter('all');
    setMentorFilter('all');
    // No reseteamos statusFilter porque es el filtro principal de la vista
  };

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || languageFilter !== 'all' || mentorFilter !== 'all';
  }, [searchTerm, languageFilter, mentorFilter]);

  const applyFilters = (applicants: ApplicantListItemDto[]): ApplicantListItemDto[] => {
    const q = searchTerm.toLowerCase();
    
    return applicants.filter((applicant) => {
      // Filtro de búsqueda por texto
      const matchesSearch =
        q === '' ||
        applicant.firstName.toLowerCase().includes(q) ||
        applicant.lastName.toLowerCase().includes(q) ||
        applicant.email.toLowerCase().includes(q);

      // Filtro por idioma
      const matchesLanguage =
        languageFilter === 'all' || applicant.language === (languageFilter as Language);

      // Filtro por tipo (mentor/colaboradora)
      const matchesMentor =
        mentorFilter === 'all' ||
        (mentorFilter === 'mentor' && applicant.mentor) ||
        (mentorFilter === 'colaboradora' && !applicant.mentor);

      // Filtro por estado (activo/eliminado/todos)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !applicant.deleted) ||
        (statusFilter === 'deleted' && applicant.deleted);

      return matchesSearch && matchesLanguage && matchesMentor && matchesStatus;
    });
  };

  return {
    filters,
    setSearchTerm,
    setLanguageFilter,
    setMentorFilter,
    setStatusFilter,
    clearAllFilters,
    applyFilters,
    hasActiveFilters,
  };
}

// Hook adicional para obtener información de filtros aplicados
export function useFilterSummary(filters: ApplicantFilters, filteredCount: number, totalCount: number) {
  return useMemo(() => {
    const activeFiltersCount = [
      filters.searchTerm !== '',
      filters.languageFilter !== 'all',
      filters.mentorFilter !== 'all',
    ].filter(Boolean).length;

    const statusBadge = {
      'active': { text: 'Activos', color: 'bg-green-100 text-green-800' },
      'deleted': { text: 'Eliminados', color: 'bg-red-100 text-red-800' },
      'all': { text: 'Todos', color: 'bg-gray-100 text-gray-800' },
    }[filters.statusFilter];

    return {
      activeFiltersCount,
      statusBadge,
      summaryText: `Mostrando ${filteredCount} de ${totalCount} applicants`,
      isFiltered: filteredCount !== totalCount,
    };
  }, [filters, filteredCount, totalCount]);
}
