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
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barra de búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtro por idioma */}
        <div>
          <label htmlFor="languageFilter" className="sr-only">
            Filtrar por idioma
          </label>
          <select
            id="languageFilter"
            aria-label="Filtrar por idioma"
            value={languageFilter}
            onChange={(e) => onLanguageFilterChange(e.target.value as Language | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div>
          <label htmlFor="mentorFilter" className="sr-only">
            Filtrar por tipo
          </label>
          <select
            id="mentorFilter"
            aria-label="Filtrar por tipo"
            value={mentorFilter}
            onChange={(e) => onMentorFilterChange(e.target.value as 'all' | 'mentor' | 'colaboradora')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="mentor">Solo Mentores</option>
            <option value="colaboradora">Solo Colaboradoras</option>
          </select>
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="statusFilter" className="sr-only">
            Filtrar por estado
          </label>
          <select
            id="statusFilter"
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'deleted')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Solo Activos</option>
            <option value="deleted">Solo Eliminados</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {/* Contador y badges de estado */}
      <div className="mt-3 text-sm text-gray-600">
        Mostrando {filteredCount} de {totalCount} applicants
        {statusFilter === 'deleted' && (
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Eliminados
          </span>
        )}
        {statusFilter === 'active' && (
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Activos
          </span>
        )}
        {statusFilter === 'all' && (
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Todos
          </span>
        )}
      </div>
    </div>
  );
}