// components/applicants/ApplicantList.tsx

// Helper para parsear timestamp del backend ("yyyy-MM-dd HH:mm:ss" -> Date)
// const parseApiTimestamp = (ts?: string) => {
//   if (!ts) return null;
//   const isoish = ts.replace(' ', 'T');
//   const d = new Date(isoish);
//   return isNaN(d.getTime()) ? null : d;
// };

import { AlertCircle, Pencil, RotateCcw, Trash2, User, Users, Eye, Calendar, Mail } from 'lucide-react';
import {
  ApplicantListItemDto,
  Language,
  getLanguageDisplayName,
} from '../features/types/applicant';

interface ApplicantListProps {
  applicants: ApplicantListItemDto[];
  onEdit: (applicant: ApplicantListItemDto) => void;
  onDelete: (applicant: ApplicantListItemDto) => void;
  onView?: (applicant: ApplicantListItemDto) => void;
  onRestore?: (applicant: ApplicantListItemDto) => void;
  /**
   * Mensaje a mostrar si la lista llega vacía.
   * Si no se pasa, se usa el texto por defecto.
   */
  emptyLabel?: string;
}

// Tipado fuerte: clave del record es el enum Language
const languageLabels: Record<Language, string> = {
  [Language.ES]: getLanguageDisplayName(Language.ES),
  [Language.EN]: getLanguageDisplayName(Language.EN),
  [Language.CAT]: getLanguageDisplayName(Language.CAT),
  [Language.EN_GB]: getLanguageDisplayName(Language.EN_GB),
  [Language.EN_US]: getLanguageDisplayName(Language.EN_US),
};

// Función para obtener las iniciales del nombre
const getInitials = (firstName: string, lastName: string): string => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

// Función para obtener colores del avatar basado en el nombre
const getAvatarColors = (name: string) => {
  const colors = [
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  ];
  
  const index = name.length % colors.length;
  return colors[index];
};

export function ApplicantList({ applicants, onEdit, onDelete, onView, onRestore, emptyLabel }: ApplicantListProps) {
  if (applicants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center fade-in">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <Users className="h-10 w-10 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          No hay applicants
        </h3>
        <p className="text-neutral-600">
          {emptyLabel ?? 'No hay applicants registrados en este momento'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-gradient-to-r from-neutral-50 to-purple-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider min-w-[220px]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Applicant
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider min-w-[280px]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-600" />
                  Email
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider min-w-[120px]">
                Idioma
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider min-w-[100px]">
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider min-w-[200px]">
                Roles Profesionales
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-neutral-700 uppercase tracking-wider min-w-[180px]">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-neutral-100">
            {applicants.map((applicant, index) => {
              const langKey = applicant.language as Language;
              const langLabel = languageLabels[langKey] ?? String(applicant.language);
              const fullName = `${applicant.firstName} ${applicant.lastName}`;
              const avatarColors = getAvatarColors(fullName);
              const initials = getInitials(applicant.firstName, applicant.lastName);

              return (
                <tr 
                  key={applicant.id} 
                  className={`hover:bg-neutral-50 transition-colors duration-200 ${
                    applicant.deleted ? 'opacity-75 bg-red-50' : ''
                  } fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className={`h-12 w-12 rounded-full ${avatarColors.bg} ${avatarColors.border} border-2 flex items-center justify-center transition-transform duration-200 hover:scale-105 ${
                          applicant.deleted ? 'grayscale' : ''
                        }`}>
                          <span className={`text-sm font-bold ${avatarColors.text}`}>
                            {initials}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`text-sm font-semibold ${
                            applicant.deleted ? 'text-neutral-500 line-through' : 'text-neutral-900'
                          }`}>
                            {applicant.firstName} {applicant.lastName}
                          </div>
                          {applicant.deleted && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Eliminado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono">
                          ID: {applicant.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <div className="space-y-1">
                      <div
                        className={`max-w-[280px] truncate font-medium ${
                          applicant.deleted ? 'line-through text-neutral-400' : 'text-neutral-900'
                        }`}
                        title={applicant.email}
                      >
                        {applicant.email}
                      </div>
                      {applicant.deletedAt && (
                        <div className="flex items-center gap-1 text-xs text-red-500">
                          <Calendar className="h-3 w-3" />
                          Eliminado: {new Date(applicant.deletedAt).toLocaleString('es-ES')}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {langLabel}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                        applicant.mentor 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}
                    >
                      {applicant.mentor ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Mentor
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          Colaboradora
                        </>
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <div className="max-w-[240px]">
                      {applicant.roles.length === 0 ? (
                        <span className="text-neutral-400 italic text-xs">Sin roles definidos</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                            title={applicant.roles[0]}
                          >
                            {applicant.roles[0].length > 24 ? `${applicant.roles[0].substring(0, 24)}...` : applicant.roles[0]}
                          </span>
                          {applicant.roles.length > 1 && (
                            <span 
                              className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium cursor-help"
                              title={`Roles adicionales: ${applicant.roles.slice(1).join(', ')}`}
                            >
                              +{applicant.roles.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center space-x-1">
                      {onView && (
                        <button
                          onClick={() => onView(applicant)}
                          className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                          title="Ver detalles"
                          type="button"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      {/* Editar solo si no está eliminado */}
                      {!applicant.deleted && (
                        <button
                          onClick={() => onEdit(applicant)}
                          className="inline-flex items-center p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200 group"
                          title="Editar"
                          type="button"
                        >
                          <Pencil className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      {/* Si está eliminado -> botón Restaurar; si no, Eliminar */}
                      {applicant.deleted ? (
                        onRestore && (
                          <button
                            onClick={() => onRestore(applicant)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                            title="Restaurar este applicant"
                            type="button"
                          >
                            <RotateCcw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
                            Restaurar
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => onDelete(applicant)}
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                          title="Eliminar"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer informativo */}
      <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>
            Mostrando {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Mentor</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Colaboradora</span>
            </div>
            {applicants.some(a => a.deleted) && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span>Eliminado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}