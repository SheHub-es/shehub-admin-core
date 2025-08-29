'use client';

import { getApplicants } from '@/features/applicants/api/applicants.api';
import {
  Bell,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Users,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Applicant = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  roles: string[];
  language?: 'SPANISH' | 'ENGLISH' | 'CATALAN';
  timestamp: string;
  deleted: boolean;
  userId?: number | null;
  deletedAt?: string | null;
};

type TabType = 'all' | 'pending' | 'converted' | 'mentors';

type UserInfo = {
  email: string;
  role: string;
  displayName: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<Applicant[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // Función para normalizar los datos de la API
  type ApiApplicantsResponse = Applicant[] | { content: Applicant[] };

  const normalizeApiData = (apiData: ApiApplicantsResponse): Applicant[] => {
    // Si es un objeto con content (formato Page)
    if (apiData && typeof apiData === 'object' && Array.isArray((apiData as { content?: Applicant[] }).content)) {
      return (apiData as { content: Applicant[] }).content;
    }
    
    // Si es directamente un array
    if (Array.isArray(apiData)) {
      return apiData;
    }
    
    // Si no hay datos, retornar array vacío
    return [];
  };

  // Función para recargar los datos de applicants
  const reloadApplicants = async () => {
    const email = sessionStorage.getItem('demo_email') || '';
    const pass = sessionStorage.getItem('demo_pass') || '';
    
    if (!email || !pass) return;

    setLoading(true);
    try {
      const data = await getApplicants(email, pass, 0, 100);
      console.log('Datos recargados desde API:', data);
      const normalizedData = normalizeApiData(data);
      console.log('Datos normalizados:', normalizedData);
      setRows(normalizedData);
    } catch (error) {
      console.error('Error al recargar applicants:', error);
      // Mantener los datos existentes en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Obtener saludo automático
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
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

  // Obtener iniciales para el avatar
  const getUserInitials = (displayName: string) => {
    return displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Datos simulados que coinciden con tu modelo Applicant real
  const mockData: Applicant[] = [
    { 
      id: 1, 
      email: 'ana.garcia@email.com', 
      firstName: 'Ana', 
      lastName: 'García',
      mentor: false,
      roles: ['Frontend Developer', 'React Specialist'],
      language: 'SPANISH',
      timestamp: '2024-08-25T10:30:00Z', 
      deleted: false,
      userId: null
    },
    { 
      id: 2, 
      email: 'laura.martinez@email.com', 
      firstName: 'Laura', 
      lastName: 'Martínez',
      mentor: true,
      roles: ['UX Designer', 'Design Mentor'],
      language: 'ENGLISH',
      timestamp: '2024-08-24T14:20:00Z', 
      deleted: false,
      userId: 123
    },
    { 
      id: 3, 
      email: 'sofia.lopez@email.com', 
      firstName: 'Sofía', 
      lastName: 'López',
      mentor: false,
      roles: ['Product Manager'],
      language: 'SPANISH',
      timestamp: '2024-08-23T09:15:00Z', 
      deleted: false,
      userId: null
    },
    { 
      id: 4, 
      email: 'maria.rodriguez@email.com', 
      firstName: 'María', 
      lastName: 'Rodríguez',
      mentor: true,
      roles: ['Data Scientist', 'AI Mentor'],
      language: 'CATALAN',
      timestamp: '2024-08-22T16:45:00Z', 
      deleted: false,
      userId: null
    },
    { 
      id: 5, 
      email: 'carmen.sanchez@email.com', 
      firstName: 'Carmen', 
      lastName: 'Sánchez',
      mentor: false,
      roles: ['Marketing Digital', 'Social Media'],
      language: 'SPANISH',
      timestamp: '2024-08-21T11:30:00Z', 
      deleted: false,
      userId: 456
    },
  ];

  useEffect(() => {
    const email = sessionStorage.getItem('demo_email') || '';
    const pass = sessionStorage.getItem('demo_pass') || '';
    
    if (!email || !pass) { 
      setErr('No hay credenciales'); 
      setLoading(false);
      return; 
    }

    // Configurar información del usuario actual
    setCurrentUser(getCurrentUserInfo());

    // Cargar datos reales desde la API
    getApplicants(email, pass, 0, 100)
      .then(d => {
        console.log('Datos iniciales recibidos de la API:', d);
        const normalizedData = normalizeApiData(d);
        console.log('Datos iniciales normalizados:', normalizedData);
        setRows(normalizedData);
        setLoading(false);
      })
      .catch(e => {
        console.error('Error al cargar applicants:', e);
        // Si falla la API, usar datos simulados como fallback
        console.log('Usando datos simulados como fallback');
        setRows(mockData);
        setLoading(false);
        // No mostrar error, solo usar los datos mock
      });
    
  }, []);

  // Filtrar datos según tab activo y búsqueda
  const filteredRows = rows.filter(row => {
    const fullName = `${row.firstName} ${row.lastName}`.toLowerCase();
    const matchesSearch = row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fullName.includes(searchTerm.toLowerCase());
    
    let matchesTab = false;
    switch(activeTab) {
      case 'all':
        matchesTab = true;
        break;
      case 'pending':
        matchesTab = row.userId === null; // No convertido a usuario aún
        break;
      case 'converted':
        matchesTab = row.userId !== null; // Ya convertido a usuario
        break;
      case 'mentors':
        matchesTab = row.mentor === true;
        break;
    }
    
    return matchesSearch && matchesTab;
  });

  // Estadísticas basadas en tu modelo real
  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.userId === null).length,
    converted: rows.filter(r => r.userId !== null).length,
    mentors: rows.filter(r => r.mentor === true).length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (applicant: Applicant) => {
    if (applicant.userId !== null) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
          Usuario Registrado
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
        Pendiente
      </span>
    );
  };

  const getLanguageBadge = (language?: string) => {
    if (!language) return null;
    const colors = {
      SPANISH: 'bg-blue-100 text-blue-800 border-blue-200',
      ENGLISH: 'bg-purple-100 text-purple-800 border-purple-200', 
      CATALAN: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    const labels = {
      SPANISH: 'ES',
      ENGLISH: 'EN',
      CATALAN: 'CA'
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${colors[language as keyof typeof colors] || colors.SPANISH}`}>
        {labels[language as keyof typeof labels] || language}
      </span>
    );
  };

  if (err) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <XCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Error de Autenticación</h2>
          </div>
          <p className="text-gray-600 mb-4">{err}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            title="Reintentar la carga de datos"
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
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg" style={{ borderRight: '1px solid var(--color-disabled)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--color-disabled)' }}>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>SheHub Admin</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Panel de Control</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium"
              style={{ 
                backgroundColor: 'var(--color-primary-hover)', 
                color: 'var(--color-primary)' 
              }}
              title="Ver lista de espera de solicitudes"
            >
              <Users className="w-5 h-5" />
              <span>Lista de Espera</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50"
              style={{ color: 'var(--color-muted)' }}
              title="Ver notificaciones del sistema"
            >
              <Bell className="w-5 h-5" />
              <span>Notificaciones</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg hover:bg-gray-50"
              style={{ color: 'var(--color-muted)' }}
              title="Abrir configuración del sistema"
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
          </nav>

          {/* User Info */}
          <div className="p-4" style={{ borderTop: '1px solid var(--color-disabled)' }}>
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-hover)' }}
              >
                <span className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>
                  {currentUser ? getUserInitials(currentUser.displayName) : 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                    {currentUser?.displayName || 'Usuario'}
                  </p>
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: 'var(--color-secondary-hover)', 
                        color: 'var(--color-secondary)' 
                      }}
                    >
                      SUPER
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {currentUser?.email || 'usuario@shehub.com'}
                </p>
              </div>
              <button className="btn-muted hover:opacity-70" title="Abrir menú de usuario">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
              style={{ color: 'var(--color-muted)' }}
              title="Cerrar sesión y regresar al login"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-6" style={{ borderBottom: '1px solid var(--color-disabled)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
                {getGreeting()}, {currentUser?.displayName || 'Usuario'}
              </h1>
              <p className="mt-1" style={{ color: 'var(--color-muted)' }}>Gestiona las solicitudes de acceso a SheHub</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="px-4 py-2 rounded-lg text-white transition-colors flex items-center space-x-2 hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm" style={{ border: '1px solid var(--color-disabled)' }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-primary-hover)' }}
                >
                  <Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Total Solicitudes</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm" style={{ border: '1px solid var(--color-disabled)' }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-yellow-100)' }}
                >
                  <Clock className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Pendientes</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{stats.pending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm" style={{ border: '1px solid var(--color-disabled)' }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-green-100)' }}
                >
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Convertidas</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{stats.converted}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm" style={{ border: '1px solid var(--color-disabled)' }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-secondary-hover)' }}
                >
                  <Users className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Mentoras</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{stats.mentors}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow-sm" style={{ border: '1px solid var(--color-disabled)' }}>
            {/* Table Header */}
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-disabled)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>Lista de Espera</h2>
                  <button 
                    onClick={reloadApplicants}
                    disabled={loading}
                    className="flex items-center space-x-1 px-3 py-1 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    title="Recargar datos desde el servidor"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                    <input
                      type="text"
                      placeholder="Buscar por email o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg w-64 focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        border: '1px solid var(--color-disabled)' 
                      }}
                    />
                  </div>
                  <button 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:opacity-75"
                    style={{ border: '1px solid var(--color-disabled)' }}
                    title="Abrir opciones de filtrado"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:opacity-75"
                    style={{ border: '1px solid var(--color-disabled)' }}
                    title="Exportar datos en formato CSV o Excel"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-4">
                {[
                  { key: 'all', label: 'Todas', count: stats.total },
                  { key: 'pending', label: 'Pendientes', count: stats.pending },
                  { key: 'converted', label: 'Convertidas', count: stats.converted },
                  { key: 'mentors', label: 'Mentoras', count: stats.mentors },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: activeTab === tab.key ? 'var(--color-primary-hover)' : 'transparent',
                      color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-muted)'
                    }}
                    title={`Ver pestaña ${tab.label}`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center space-x-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Cargando datos...</span>
                  </div>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron solicitudes</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Solicitante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {row.firstName.charAt(0)}{row.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {row.firstName} {row.lastName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>{row.email}</span>
                                {getLanguageBadge(row.language)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {row.roles.length > 0 ? (
                              <div className="space-y-1">
                                {row.roles.slice(0, 2).map((role, index) => (
                                  <div key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">
                                    {role}
                                  </div>
                                ))}
                                {row.roles.length > 2 && (
                                  <div className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
                                    +{row.roles.length - 2}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Sin roles</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {row.mentor ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                Mentora
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                Colaboradora
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(row)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(row.timestamp)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => setSelectedApplicant(row)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          {row.userId === null && (
                            <button className="text-green-600 hover:text-green-900 p-1 rounded" title="Convertir a Usuario">
                              <Users className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-900 p-1 rounded" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detalles de Solicitud</h3>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Cerrar ventana de detalles"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Información Personal</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Nombre</label>
                      <p className="text-sm font-medium">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-sm">{selectedApplicant.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Idioma</label>
                      <p className="text-sm">{selectedApplicant.language || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Tipo</label>
                      <p className="text-sm font-medium">{selectedApplicant.mentor ? 'Mentora' : 'Colaboradora'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Sistema</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Roles</label>
                      <div className="mt-1">
                        {selectedApplicant.roles.length > 0 ? (
                          <div className="space-y-1">
                            {selectedApplicant.roles.map((role, index) => (
                              <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin roles asignados</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Estado</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedApplicant)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">ID de Usuario</label>
                      <p className="text-sm">{selectedApplicant.userId || 'No convertido'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Fecha de Solicitud</label>
                      <p className="text-sm">{formatDate(selectedApplicant.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                title="Cerrar ventana de detalles"
              >
                Cerrar
              </button>
              {selectedApplicant.userId === null && (
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  title="Convertir solicitud a usuario registrado"
                >
                  Convertir a Usuario
                </button>
              )}
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                title="Editar información de la solicitud"
              >
                Editar
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                title="Eliminar solicitud permanentemente"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
