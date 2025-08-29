'use client';

import {
  Bell,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit,
  Eye,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import types
import { Applicant, TabType, UserInfo } from '../../features/types/applicant.types';

// Import hooks
import { useApplicants } from '../../features/hooks/useApplicants';
import { useApplicantFilter } from '../../features/hooks/useApplicantFilter';
import { useApplicantStats } from '../../features/hooks/useApplicantStats';
import { useApplicantServerStats } from '../../features/hooks/useApplicantServerStats';

// Import utils
import { formatDate, getUserInitials } from '../../features/applicants/utils/applicant.utils';

export default function Dashboard() {
  const router = useRouter();
  
  // Estados principales
  const [currentUser, setCurrentUser] = useState<UserInfo>({ 
    email: '', 
    displayName: '', 
    role: 'ADMIN' 
  });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Get current user credentials for API calls - with proper checks
  const [credentials, setCredentials] = useState<{email: string, password: string}>({
    email: '',
    password: ''
  });
  
  // Initialize credentials from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('demo_email') || '';
      const password = sessionStorage.getItem('demo_password') || '';
      setCredentials({ email, password });
    }
  }, []);
  
  // Using custom hooks
  const { rows: applicants, loading, error, reload } = useApplicants();
  
  // Client-side stats as fallback
  const clientStats = useApplicantStats(applicants);
  
  // Use server-side statistics only when credentials are available
  const { 
    stats: serverStats, 
    loading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useApplicantServerStats(credentials.email, credentials.password);

  // Use server stats if available and no error, otherwise use client stats
  const stats = (!statsError && credentials.email && credentials.password) ? serverStats : clientStats;
  
  const { 
    activeTab, 
    setActiveTab, 
    searchTerm, 
    setSearchTerm, 
    filteredApplicants 
  } = useApplicantFilter(applicants);

  // Combined reload function for both applicants and statistics
  const reloadAll = async () => {
    await Promise.all([
      reload(),
      refetchStats()
    ]);
  };

  // Función para obtener info del usuario actual
  const getCurrentUserInfo = (): UserInfo => {
    const email = sessionStorage.getItem('demo_email') || '';
    
    // Mapeo de usuarios reales del backend
    const userMap: Record<string, {displayName: string, role: string}> = {
      'onlyirina7@gmail.com': { displayName: 'Irina', role: 'ADMIN' },
      'geb.beg.73@gmail.com': { displayName: 'Geb', role: 'ADMIN' },
      'ainoha.barcia@gmail.com': { displayName: 'Ainoha', role: 'ADMIN' },
      'shehub.backend.team@gmail.com': { displayName: 'Backend Team', role: 'SUPER_ADMIN' },
    };

    const userInfo = userMap[email];
    if (userInfo) {
      return {
        email,
        displayName: userInfo.displayName,
        role: userInfo.role
      };
    }

    // Fallback para otros emails
    return {
      email,
      displayName: email.split('@')[0] || 'Usuario',
      role: 'ADMIN'
    };
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem('demo_email');
    sessionStorage.removeItem('demo_pass');
    router.push('/');
  };

  // Inicializar usuario actual
  useEffect(() => {
    setCurrentUser(getCurrentUserInfo());
  }, []);

  // Función para obtener saludo personalizado
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Función para exportar datos
  const handleExport = () => {
    const csvContent = [
      ['Email', 'Nombre', 'Apellido', 'Es Mentor', 'Roles', 'Idioma'].join(','),
      ...filteredApplicants.map(applicant => [
        applicant.email,
        applicant.firstName,
        applicant.lastName,
        applicant.mentor ? 'Sí' : 'No',
        applicant.roles.join('; '),
        applicant.language
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `applicants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background-light)] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background-light)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            onClick={reload}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-light)]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-purple-600">SheHub Admin</h1>
            <p className="text-sm mt-1 text-gray-500">Panel de Control</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium bg-purple-100 text-purple-700"
              title="Ver lista de espera de solicitudes"
            >
              <Users className="w-5 h-5" />
              <span>Lista de Espera</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 text-gray-600"
              title="Ver notificaciones del sistema"
            >
              <Bell className="w-5 h-5" />
              <span>Notificaciones</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50 text-gray-600"
              title="Abrir configuración del sistema"
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials(currentUser.displayName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.displayName}
                  </p>
                  {currentUser.role === 'SUPER_ADMIN' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                      SUPER
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {currentUser.email}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" title="Abrir menú de usuario">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg text-sm transition-all duration-200 cursor-pointer group"
              style={{ 
                color: 'var(--color-muted)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-red-50)';
                e.currentTarget.style.color = 'var(--color-error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-muted)';
              }}
              title="Cerrar sesión y regresar al login"
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-[var(--color-header-bg)] border-b border-gray-200 px-8 py-6 shadow-[var(--color-header-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {getGreeting()}, {currentUser.displayName}
                </h1>
                {/* Stats source indicator */}
                <div className="flex items-center space-x-1">
                  {statsLoading ? (
                    <div className="flex items-center text-xs text-[var(--color-warning)]">
                      <Clock className="w-3 h-3 mr-1" />
                      Cargando stats...
                    </div>
                  ) : statsError ? (
                    <div className="flex items-center text-xs text-[var(--color-muted)]" title="Usando estadísticas del cliente como fallback">
                      <Users className="w-3 h-3 mr-1" />
                      Cliente
                    </div>
                  ) : credentials.email && credentials.password ? (
                    <div className="flex items-center text-xs text-[var(--color-success)]" title="Estadísticas del servidor en tiempo real">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Servidor
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-[var(--color-muted)]" title="Usando estadísticas del cliente">
                      <Users className="w-3 h-3 mr-1" />
                      Cliente
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-1 text-[var(--color-muted)]">Gestiona las solicitudes de acceso a SheHub</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={reloadAll}
                disabled={loading || statsLoading}
                className={`p-2 rounded-lg transition-colors focus-square ${
                  loading || statsLoading 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-[var(--color-icon-default)] hover:text-[var(--color-icon-hover)] hover:bg-[var(--color-primary-hover)]'
                }`}
                title="Actualizar datos y estadísticas"
              >
                <RefreshCw className={`w-5 h-5 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-[var(--color-button-primary-primary-text)] bg-[var(--color-button-primary-primary-bg-default)] hover:bg-[var(--color-button-primary-primary-bg-hover)] hover:text-[var(--color-button-primary-primary-text-hover)] transition-colors flex items-center space-x-2 focus-square"
                title="Invitar un nuevo usuario al sistema"
              >
                <Plus className="w-4 h-4" />
                <span>Invitar Usuario</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="px-8 py-6">
          {/* Error indicator for statistics */}
          {statsError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-red-700">
                  Error cargando estadísticas del servidor: {statsError}
                </p>
                <button 
                  onClick={refetchStats}
                  className="ml-auto text-red-600 hover:text-red-800 underline text-sm"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-lg border border-gray-200 fade-in shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-[var(--color-avatar-primary-variant-bg)]">
                  <Users className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-card-white-description)] font-medium">Total Solicitudes</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-[var(--color-card-white-title)]">
                      {statsLoading ? '...' : stats.total}
                    </p>
                    {statsLoading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-lg border border-gray-200 fade-in delay-200 shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-[var(--color-avatar-tertairy-variant-bg)]">
                  <Clock className="w-6 h-6 text-[var(--color-tertairy)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-card-white-description)] font-medium">Pendientes</p>
                  <p className="text-xs text-[var(--color-muted)]">(de convertirse en usuarios)</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-[var(--color-card-white-title)]">
                      {statsLoading ? '...' : stats.pending}
                    </p>
                    {statsLoading && <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-lg border border-gray-200 fade-in delay-400 shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-card-white-description)] font-medium">Registradas</p>
                  <p className="text-xs text-[var(--color-muted)]">(ya convertidas en usuarios)</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-[var(--color-card-white-title)]">
                      {statsLoading ? '...' : stats.converted}
                    </p>
                    {statsLoading && <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-lg border border-gray-200 fade-in delay-600 shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-[var(--color-avatar-secondary-variant-bg)]">
                  <Star className="w-6 h-6 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-card-white-description)] font-medium">Mentoras</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-[var(--color-card-white-title)]">
                      {statsLoading ? '...' : stats.mentors}
                    </p>
                    {statsLoading && <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-[var(--color-card-white-bg-default)] rounded-lg border border-gray-200 shadow-[var(--color-card-shadow-default)]">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por email, nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-3 bg-[var(--color-button-secondary-primary-bg-default)] text-[var(--color-button-secondary-primary-text)] border border-[var(--color-button-secondary-primary-border)] rounded-lg hover:bg-[var(--color-button-secondary-primary-bg-hover)] transition-colors focus-square"
                    title="Exportar datos"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-6">
                {[
                  { key: 'all' as TabType, label: 'Todos', count: stats.total },
                  { key: 'mentors' as TabType, label: 'Mentores', count: stats.mentors },
                  { key: 'pending' as TabType, label: 'Pendientes', count: stats.pending },
                  { key: 'converted' as TabType, label: 'Registradas', count: stats.converted }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors focus-square ${
                      activeTab === tab.key
                        ? 'bg-[var(--color-toggle-bg-active)] text-[var(--color-toggle-text-active)]'
                        : 'text-[var(--color-toggle-text-default)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-toggle-bg-hover)]'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aplicante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idioma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles (ocupación actual)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-card-white-bg-default)] divide-y divide-gray-200">
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-[var(--color-card-white-bg-hover)] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[var(--color-card-white-title)]">
                            {applicant.firstName} {applicant.lastName}
                          </div>
                          <div className="text-sm text-[var(--color-card-white-description)]">{applicant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--color-card-white-title)]">
                          {applicant.language === 'SPANISH' ? '🇪🇸 ES' :
                           applicant.language === 'ENGLISH' ? '🇬🇧 EN' :
                           applicant.language === 'CATALAN' ? '🏴󐁥󐁳󐁣󐁴󐁿 CAT' : applicant.language}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          applicant.mentor 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applicant.mentor ? (
                            <>
                              <Star className="w-3 h-3 mr-1" />
                              Mentor
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3 mr-1" />
                              Colaboradora
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {applicant.roles.slice(0, 2).join(', ')}
                          {applicant.roles.length > 2 && (
                            <span className="text-gray-500">
                              {' '}+{applicant.roles.length - 2} más
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedApplicant(applicant)}
                            className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-primary-hover)] p-1 rounded transition-colors focus-square"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* TODO: Implementar edición */}}
                            className="text-[var(--color-icon-default)] hover:text-[var(--color-icon-hover)] hover:bg-gray-50 p-1 rounded transition-colors focus-square"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* TODO: Implementar eliminación */}}
                            className="text-[var(--color-error)] hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors focus-square"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredApplicants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron aplicantes
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `No hay resultados para "${searchTerm}"`
                      : 'No hay aplicantes disponibles'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 fade-in">
          <div className="bg-[var(--color-card-white-bg-default)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[var(--color-card-shadow-hover)]">
            <div className="p-6 border-b border-gray-200 bg-[var(--color-header-bg)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--color-card-white-title)]">
                  Detalles de la Colaboradora
                </h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-icon-hover)] hover:bg-[var(--color-primary-hover)] p-2 rounded-lg transition-colors focus-square"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Nombre</label>
                  <p className="text-sm text-[var(--color-card-white-title)] font-medium">{selectedApplicant.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Apellido</label>
                  <p className="text-sm text-[var(--color-card-white-title)] font-medium">{selectedApplicant.lastName}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Email</label>
                <p className="text-sm text-[var(--color-card-white-title)] font-medium">{selectedApplicant.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Tipo</label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedApplicant.mentor 
                      ? 'bg-[var(--color-avatar-secondary-variant-bg)] text-[var(--color-secondary)]'
                      : 'bg-[var(--color-avatar-primary-variant-bg)] text-[var(--color-primary)]'
                  }`}>
                    {selectedApplicant.mentor ? '⭐ Mentora' : '👥 Colaboradora'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Roles (ocupación actual)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedApplicant.roles.map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-avatar-tertairy-variant-bg)] text-[var(--color-tertairy)]"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Idioma</label>
                  <p className="text-sm text-[var(--color-card-white-title)] font-medium">
                    {selectedApplicant.language === 'SPANISH' ? '🇪🇸 Español' :
                     selectedApplicant.language === 'ENGLISH' ? '🇬🇧 Inglés' :
                     selectedApplicant.language === 'CATALAN' ? '🏴󐁥󐁳󐁣󐁴󐁿 Catalán' : selectedApplicant.language}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Fecha (de registro)</label>
                  <p className="text-sm text-[var(--color-card-white-title)] font-medium">
                    {formatDate(selectedApplicant.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-card-white-description)] mb-2">Estado de Registro</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      selectedApplicant.userId 
                        ? 'bg-green-100 text-[var(--color-success)]'
                        : 'bg-[var(--color-avatar-tertairy-variant-bg)] text-[var(--color-warning)]'
                    }`}>
                      {selectedApplicant.userId ? '✅ Ya registrada en el sistema' : '⏳ Pendiente de registro'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
