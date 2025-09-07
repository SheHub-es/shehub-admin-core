'use client';

import { Download, Plus, RefreshCw, Users, Bell, FileText, LogOut, ChevronLeft, ChevronRight, User, BarChart3 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ApplicantForm } from '../../components/ApplicantForm';
import { ApplicantList } from '../../components/ApplicantList';
import { ApplicantStats, type ApplicantStatsRef } from '../../components/ApplicantStats';
import { SearchAndFilters } from '../../components/SearchAndFilters';
import { useApplicantFilters } from '../../features/hooks/useApplicantFilter';
import { useApplicants } from '../../features/hooks/useApplicants';
import { applicantApi } from '../../features/lib/applicants';
import {
  ApplicantListItemDto,
  CreateApplicantDto,
  Language,
  UpdateApplicantDto,
  getLanguageDisplayName,
} from '../../features/types/applicant';

// Helper para parsear timestamp del backend
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
  const router = useRouter();
  const pathname = usePathname();
  const statsRef = useRef<ApplicantStatsRef>(null);
  
  // Estados del sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Hook para manejar applicants
  const {
    applicants,
    loading: applicantsLoading,
    error: applicantsError,
    refresh: refreshActive,
    create,
    updateById,
    deleteById,
  } = useApplicants();

  // Hook para manejar filtros
  const {
    filters,
    setSearchTerm,
    setLanguageFilter,
    setMentorFilter,
    setStatusFilter,
    clearAllFilters,
    applyFilters,
    hasActiveFilters,
  } = useApplicantFilters('active');

  // Estados para modales y UI
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantListItemDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para eliminados
  const [deletedApplicants, setDeletedApplicants] = useState<ApplicantListItemDto[]>([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [deletedError, setDeletedError] = useState<string | null>(null);

  // Funciones del sidebar
  useEffect(() => {
    const email = sessionStorage.getItem('demo_email') || '';
    setUserEmail(email);
  }, []);

  const menuItems = [
    { icon: Users, label: 'Applicants', href: '/applicants', badge: 0 },
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard', badge: 0 },
    { icon: Bell, label: 'Notificaciones', href: '/notifications', badge: 3 },
    { icon: FileText, label: 'Formularios', href: '/forms', badge: 0 },
    { icon: User, label: 'Usuarios', href: '/users', badge: 0 },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('demo_email');
    sessionStorage.removeItem('demo_pass');
    router.push('/');
  };

  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Carga según statusFilter
  useEffect(() => {
    const load = async () => {
      try {
        if (filters.statusFilter === 'deleted') {
          setDeletedLoading(true);
          setDeletedError(null);
          const data = await applicantApi.getDeleted();
          setDeletedApplicants(data);
        } else if (filters.statusFilter === 'all') {
          setDeletedLoading(true);
          setDeletedError(null);
          const [_, deleted] = await Promise.all([
            refreshActive(),
            applicantApi.getDeleted(),
          ]);
          setDeletedApplicants(deleted);
        } else {
          await refreshActive();
        }
      } catch (e) {
        setDeletedError(e instanceof Error ? e.message : 'Error cargando eliminados');
      } finally {
        if (filters.statusFilter !== 'active') setDeletedLoading(false);
      }
    };

    load();
  }, [filters.statusFilter, refreshActive]);

  const sourceApplicants = useMemo(() => {
    if (filters.statusFilter === 'deleted') return deletedApplicants;
    if (filters.statusFilter === 'all') return [...applicants, ...deletedApplicants];
    return applicants;
  }, [filters.statusFilter, applicants, deletedApplicants]);

  const filteredApplicants = useMemo(() => {
    return applyFilters(sourceApplicants);
  }, [applyFilters, sourceApplicants]);

  const isLoading = applicantsLoading || (filters.statusFilter !== 'active' && deletedLoading);

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
    if (filters.statusFilter === 'deleted') {
      setDeletedLoading(true);
      try {
        const data = await applicantApi.getDeleted();
        setDeletedApplicants(data);
      } finally {
        setDeletedLoading(false);
      }
    } else if (filters.statusFilter === 'all') {
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
    
    if (statsRef.current) {
      await statsRef.current.refresh();
    }
  };

  const totalBase = useMemo(() => sourceApplicants.length, [sourceApplicants]);

  const emptyLabel = useMemo(() => {
    if (filters.statusFilter === 'deleted') return 'No hay applicants eliminados';
    if (filters.statusFilter === 'active') return 'No hay applicants activos';
    return 'No hay applicants';
  }, [filters.statusFilter]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-light)' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {applicantsError || deletedError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-white rounded-md hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-light)' }}>
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full border-r border-gray-200 flex flex-col transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{ backgroundColor: 'var(--color-background-light)' }}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-shehub.png"
                alt="SheHub"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
            </div>
          )}
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-primary)' } : {}}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {sidebarCollapsed && item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Perfil de usuario */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {getUserInitials(userEmail)}
            </div>
            
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                <p className="text-xs text-gray-500">Administradora</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
                Gestión de Applicants
              </h1>
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
                  className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Applicant
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-8">
            <ApplicantStats ref={statsRef} />
          </div>

          {/* Filtros */}
          <SearchAndFilters
            searchTerm={filters.searchTerm}
            onSearchChange={setSearchTerm}
            languageFilter={filters.languageFilter}
            onLanguageFilterChange={setLanguageFilter}
            mentorFilter={filters.mentorFilter}
            onMentorFilterChange={setMentorFilter}
            statusFilter={filters.statusFilter}
            onStatusFilterChange={setStatusFilter}
            filteredCount={filteredApplicants.length}
            totalCount={totalBase}
          />

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <div className="mb-4">
              <button
                onClick={clearAllFilters}
                className="text-sm underline hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}
                type="button"
              >
                Limpiar filtros de búsqueda
              </button>
            </div>
          )}

          {/* Contenido principal */}
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

          {/* Modales */}
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
                          className="inline-block mr-2 mb-2 px-3 py-1 text-sm rounded-md font-medium"
                          style={{ 
                            backgroundColor: 'var(--color-primary-hover)', 
                            color: 'var(--color-primary)' 
                          }}
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
    </div>
  );
}