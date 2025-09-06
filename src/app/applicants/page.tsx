'use client';

import { Download, Plus, RefreshCw, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { ApplicantForm } from '../../components/ApplicantForm';
import { ApplicantList } from '../../components/ApplicantList';
import { useApplicants } from '../../features/hooks/useApplicants';
import { applicantApi } from '../../features/lib/applicants';
import {
  ApplicantListItemDto,
  CreateApplicantDto,
  Language,
  UpdateApplicantDto,
  getLanguageDisplayName,
} from '../../features/types/applicant';

// Helper para parsear timestamp del backend ("yyyy-MM-dd HH:mm:ss" -> Date)
const parseApiTimestamp = (ts?: string) => {
  if (!ts) return null;
  const isoish = ts.replace(' ', 'T');
  const d = new Date(isoish);
  return isNaN(d.getTime()) ? null : d;
};

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative z-50`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              type="button"
              aria-label="Cerrar"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            type="button"
          >
            {isLoading ? 'Procesando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Page() {
  const {
    applicants,
    loading: applicantsLoading,
    error: applicantsError,
    refresh: refreshActive,
    create,
    updateById,
    deleteById,
  } = useApplicants();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantListItemDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<Language | 'all'>('all');
  const [mentorFilter, setMentorFilter] = useState<'all' | 'mentor' | 'colaboradora'>('all');
  // Estado de vista: activos, eliminados o todos
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('active');

  // Estado para eliminados traídos desde BE
  const [deletedApplicants, setDeletedApplicants] = useState<ApplicantListItemDto[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [deletedError, setDeletedError] = useState<string | null>(null);

  // Carga según statusFilter
  useEffect(() => {
    const load = async () => {
      try {
        if (statusFilter === 'deleted') {
          setDeletedLoading(true);
          setDeletedError(null);
          const data = await applicantApi.getDeleted();
          setDeletedApplicants(data);
        } else if (statusFilter === 'all') {
          // Cargar ambos conjuntos
          setDeletedLoading(true);
          setDeletedError(null);
          const [_, deleted] = await Promise.all([
            refreshActive(),
            applicantApi.getDeleted(),
          ]);
          setDeletedApplicants(deleted);
        } else {
          // Solo activos
          await refreshActive();
        }
      } catch (e) {
        setDeletedError(e instanceof Error ? e.message : 'Error cargando eliminados');
      } finally {
        if (statusFilter !== 'active') setDeletedLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, refreshActive]);

  // Fuente según status
  const sourceApplicants = useMemo(() => {
    if (statusFilter === 'deleted') return deletedApplicants;
    if (statusFilter === 'all') return [...applicants, ...deletedApplicants];
    return applicants; // active
  }, [statusFilter, applicants, deletedApplicants]);

  const filteredApplicants = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return sourceApplicants.filter((applicant) => {
      const matchesSearch =
        q === '' ||
        applicant.firstName.toLowerCase().includes(q) ||
        applicant.lastName.toLowerCase().includes(q) ||
        applicant.email.toLowerCase().includes(q);

      const matchesLanguage =
        languageFilter === 'all' || applicant.language === (languageFilter as Language);

      const matchesMentor =
        mentorFilter === 'all' ||
        (mentorFilter === 'mentor' && applicant.mentor) ||
        (mentorFilter === 'colaboradora' && !applicant.mentor);

      // Cuando statusFilter = 'all' dejamos que el filtro de estado se exprese con applicant.deleted
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !applicant.deleted) ||
        (statusFilter === 'deleted' && applicant.deleted);

      return matchesSearch && matchesLanguage && matchesMentor && matchesStatus;
    });
  }, [sourceApplicants, searchTerm, languageFilter, mentorFilter, statusFilter]);

  const isLoading = applicantsLoading || (statusFilter !== 'active' && deletedLoading);

  const handleCreate = async (data: CreateApplicantDto) => {
    try {
      setIsSubmitting(true);
      await create(data);
      await handleRefresh();
      setActiveModal(null);
    } catch (error) {
      console.error('Error creating applicant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (applicant: ApplicantListItemDto) => {
    setSelectedApplicant(applicant);
    setActiveModal('edit');
  };

  const handleUpdate = async (data: UpdateApplicantDto) => {
    if (!selectedApplicant) return;
    try {
      setIsSubmitting(true);
      await updateById(selectedApplicant.id, data);
      await handleRefresh();
      setActiveModal(null);
      setSelectedApplicant(null);
    } catch (error) {
      console.error('Error updating applicant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = (applicant: ApplicantListItemDto) => {
    setSelectedApplicant(applicant);
    setActiveModal('delete');
  };

  const handleDelete = async () => {
    if (!selectedApplicant) return;
    try {
      setIsSubmitting(true);
      await deleteById(selectedApplicant.id);
      await handleRefresh();
      setActiveModal(null);
      setSelectedApplicant(null);
    } catch (error) {
      console.error('Error deleting applicant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (applicant: ApplicantListItemDto) => {
    setSelectedApplicant(applicant);
    setActiveModal('view');
  };

  const handleRestore = async (applicant: ApplicantListItemDto) => {
    try {
      setIsSubmitting(true);
      await applicantApi.restore(applicant.email);
      await handleRefresh();
    } catch (error) {
      console.error('Error restoring applicant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    if (statusFilter === 'deleted') {
      setDeletedLoading(true);
      try {
        const data = await applicantApi.getDeleted();
        setDeletedApplicants(data);
      } finally {
        setDeletedLoading(false);
      }
    } else if (statusFilter === 'all') {
      setDeletedLoading(true);
      try {
        const [_, deleted] = await Promise.all([
          refreshActive(),
          applicantApi.getDeleted(),
        ]);
        setDeletedApplicants(deleted);
      } finally {
        setDeletedLoading(false);
      }
    } else {
      await refreshActive();
    }
  };

  const totalBase = useMemo(() => sourceApplicants.length, [sourceApplicants]);

  const emptyLabel = useMemo(() => {
    if (statusFilter === 'deleted') return 'No hay applicants eliminados';
    if (statusFilter === 'active') return 'No hay applicants activos';
    return 'No hay applicants';
  }, [statusFilter]);

  const handleExport = () => {
    const headers = ['ID', 'Email', 'Nombre', 'Apellido', 'Idioma', 'Tipo', 'Roles', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...filteredApplicants.map((a) =>
        [
          a.id,
          a.email,
          a.firstName,
          a.lastName,
          getLanguageDisplayName((a.language as Language) ?? Language.ES),
          a.mentor ? 'Mentor' : 'Colaboradora',
          `"${a.roles.join(', ')}"`,
          a.deleted ? 'Eliminado' : 'Activo',
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'applicants.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (applicantsError || deletedError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {applicantsError || deletedError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Applicants</h1>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                type="button"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => setActiveModal('create')}
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Applicant
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="languageFilter" className="sr-only">
                Filtrar por idioma
              </label>
              <select
                id="languageFilter"
                aria-label="Filtrar por idioma"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as Language | 'all')}
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

            <div>
              <label htmlFor="mentorFilter" className="sr-only">
                Filtrar por tipo
              </label>
              <select
                id="mentorFilter"
                aria-label="Filtrar por tipo"
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value as 'all' | 'mentor' | 'colaboradora')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="mentor">Solo Mentores</option>
                <option value="colaboradora">Solo Colaboradoras</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="statusFilter" className="sr-only">
                Filtrar por estado
              </label>
              <select
                id="statusFilter"
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'deleted')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Solo Activos</option>
                <option value="deleted">Solo Eliminados</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Mostrando {filteredApplicants.length} de {totalBase} applicants
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

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Cargando applicants...</span>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-10 text-center text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          <ApplicantList
            applicants={filteredApplicants}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
            onView={handleView}
            onRestore={handleRestore}
          />
        )}

        {/* Modals */}
        <Modal isOpen={activeModal === 'create'} onClose={() => setActiveModal(null)} title="Crear Nuevo Applicant" size="lg">
          <ApplicantForm
            mode="create"
            onSubmit={(data) => handleCreate(data as CreateApplicantDto)}
            onCancel={() => setActiveModal(null)}
            isLoading={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={activeModal === 'edit'}
          onClose={() => {
            setActiveModal(null);
            setSelectedApplicant(null);
          }}
          title="Editar Applicant"
          size="lg"
        >
          {selectedApplicant && (
            <ApplicantForm
              mode="update"
              initialData={selectedApplicant}
              onSubmit={(data) => handleUpdate(data as UpdateApplicantDto)}
              onCancel={() => {
                setActiveModal(null);
                setSelectedApplicant(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </Modal>

        <Modal
          isOpen={activeModal === 'view'}
          onClose={() => {
            setActiveModal(null);
            setSelectedApplicant(null);
          }}
          title="Detalles del Applicant"
          size="md"
        >
          {selectedApplicant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID</label>
                  <p className="text-sm text-gray-900">{selectedApplicant.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedApplicant.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-sm text-gray-900">{selectedApplicant.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <p className="text-sm text-gray-900">{selectedApplicant.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Idioma</label>
                  <p className="text-sm text-gray-900">
                    {getLanguageDisplayName((selectedApplicant.language as Language) ?? Language.ES)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-sm text-gray-900">{selectedApplicant.mentor ? 'Mentor' : 'Colaboradora'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado</label>
                  <p className="text-sm text-gray-900">
                    {(() => {
                      const dt = parseApiTimestamp(selectedApplicant.timestamp as string | undefined);
                      return dt ? dt.toLocaleString('es-ES') : '—';
                    })()}
                  </p>
                </div>
                {selectedApplicant.deletedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Eliminado</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedApplicant.deletedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles Profesionales</label>
                {selectedApplicant.roles.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Sin roles definidos</p>
                ) : (
                  <div className="space-y-2">
                    {selectedApplicant.roles.map((role, index) => (
                      <span
                        key={`${role}-${index}`}
                        className="inline-block mr-2 mb-2 px-3 py-1 text-sm rounded-md bg-indigo-100 text-indigo-800 font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedApplicant(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  type="button"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Modal>

        <ConfirmModal
          isOpen={activeModal === 'delete'}
          onClose={() => {
            setActiveModal(null);
            setSelectedApplicant(null);
          }}
          onConfirm={handleDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar el applicant "${selectedApplicant?.firstName} ${selectedApplicant?.lastName}"? Esta acción no se puede deshacer.`}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}



