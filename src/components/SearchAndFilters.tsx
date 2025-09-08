import React from 'react';
import { Search } from 'lucide-react';
import { Language, getLanguageDisplayName } from '../features/types/applicant';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  languageFilter: Language | 'all';
  onLanguageFilterChange: (filter: Language | 'all') => void;
  mentorFilter: 'all' | 'mentor' | 'colaboradora';
  onMentorFilterChange: (filter: 'all' | 'mentor' | 'colaboradora') => void;
  statusFilter: 'all' | 'active' | 'deleted';
  onStatusFilterChange: (filter: 'all' | 'active' | 'deleted') => void;
  filteredCount: number;
  totalCount: number;
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  languageFilter,
  onLanguageFilterChange,
  mentorFilter,
  onMentorFilterChange,
  statusFilter,
  onStatusFilterChange,
  filteredCount,
  totalCount,
}: SearchAndFiltersProps) {
  return (
    <div className="bg-[var(--color-card-white-bg-default)] rounded-lg shadow-[var(--color-card-shadow-default)] mb-6 fade-in">
      {/* Header del panel de filtros */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-[var(--text-size-400)] font-medium text-[var(--color-card-white-title)]">
          Buscar y Filtrar Applicants
        </h3>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-[var(--text-size-200)] font-medium text-[var(--color-card-white-description)] mb-2">
              Búsqueda general
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)] transition-colors duration-200 group-focus-within:text-[var(--color-primary)]" />
              <input
                id="search"
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg 
                         text-[var(--text-size-300)] text-[var(--color-foreground)]
                         placeholder:text-[var(--color-muted)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                         hover:border-[var(--color-primary)] transition-all duration-200
                         bg-white"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filtro por idioma */}
            <div className="min-w-[160px]">
              <label htmlFor="languageFilter" className="block text-[var(--text-size-200)] font-medium text-[var(--color-card-white-description)] mb-2">
                Idioma
              </label>
              <select
                id="languageFilter"
                value={languageFilter}
                onChange={(e) => onLanguageFilterChange(e.target.value as Language | 'all')}
                className="w-full px-3 py-3 border border-neutral-300 rounded-lg 
                         text-[var(--text-size-300)] text-[var(--color-foreground)]
                         bg-white cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                         hover:border-[var(--color-primary)] transition-all duration-200"
              >
                <option value="all">Todos los idiomas</option>
                <option value={Language.ES}>{getLanguageDisplayName(Language.ES)}</option>
                <option value={Language.EN}>{getLanguageDisplayName(Language.EN)}</option>
                <option value={Language.CAT}>{getLanguageDisplayName(Language.CAT)}</option>
                <option value={Language.EN_GB}>{getLanguageDisplayName(Language.EN_GB)}</option>
                <option value={Language.EN_US}>{getLanguageDisplayName(Language.EN_US)}</option>
              </select>
            </div>

            {/* Filtro por tipo (mentor/colaboradora) */}
            <div className="min-w-[160px]">
              <label htmlFor="mentorFilter" className="block text-[var(--text-size-200)] font-medium text-[var(--color-card-white-description)] mb-2">
                Tipo
              </label>
              <select
                id="mentorFilter"
                value={mentorFilter}
                onChange={(e) => onMentorFilterChange(e.target.value as 'all' | 'mentor' | 'colaboradora')}
                className="w-full px-3 py-3 border border-neutral-300 rounded-lg 
                         text-[var(--text-size-300)] text-[var(--color-foreground)]
                         bg-white cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent
                         hover:border-[var(--color-secondary)] transition-all duration-200"
              >
                <option value="all">Todos los tipos</option>
                <option value="mentor">Solo Mentores</option>
                <option value="colaboradora">Solo Colaboradoras</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="min-w-[140px]">
              <label htmlFor="statusFilter" className="block text-[var(--text-size-200)] font-medium text-[var(--color-card-white-description)] mb-2">
                Estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'deleted')}
                className="w-full px-3 py-3 border border-neutral-300 rounded-lg 
                         text-[var(--text-size-300)] text-[var(--color-foreground)]
                         bg-white cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-tertairy)] focus:border-transparent
                         hover:border-[var(--color-tertairy)] transition-all duration-200"
              >
                <option value="active">Solo Activos</option>
                <option value="deleted">Solo Eliminados</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contador y badges de estado */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-size-300)] text-[var(--color-foreground)] font-medium">
              Mostrando {filteredCount} de {totalCount} applicants
            </span>
            
            {/* Badge de estado activo */}
            {statusFilter === 'deleted' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[var(--text-size-100)] font-medium 
                             bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                Eliminados
              </span>
            )}
            {statusFilter === 'active' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[var(--text-size-100)] font-medium 
                             bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                Activos
              </span>
            )}
            {statusFilter === 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[var(--text-size-100)] font-medium 
                             bg-neutral-50 text-neutral-700 border border-neutral-200">
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-2"></span>
                Todos
              </span>
            )}
          </div>

          {/* Indicador visual de filtros activos */}
          {(searchTerm || languageFilter !== 'all' || mentorFilter !== 'all') && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-size-200)] text-[var(--color-muted)]">Filtros aplicados:</span>
              <div className="flex gap-1">
                {searchTerm && (
                  <span className="px-2 py-1 bg-[var(--color-primary-hover)] text-[var(--color-primary)] rounded text-[var(--text-size-100)] font-medium">
                    Búsqueda
                  </span>
                )}
                {languageFilter !== 'all' && (
                  <span className="px-2 py-1 bg-[var(--color-primary-hover)] text-[var(--color-primary)] rounded text-[var(--text-size-100)] font-medium">
                    Idioma
                  </span>
                )}
                {mentorFilter !== 'all' && (
                  <span className="px-2 py-1 bg-[var(--color-secondary-hover)] text-[var(--color-secondary)] rounded text-[var(--text-size-100)] font-medium">
                    Tipo
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}