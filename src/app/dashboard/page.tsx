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
  X,
  TrendingUp,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

// Import types
import { Applicant, TabType, UserInfo } from '../../features/types/applicant.types';

// Import hooks
import { useApplicantFilter } from '../../features/hooks/useApplicantFilter';
import { useApplicants } from '../../features/hooks/useApplicants';
import { useApplicantStats } from '../../features/hooks/useApplicantStats';

// Import utils
import { formatDate, getUserInitials } from '../../features/applicants/utils/applicant.utils';
import { getLanguageDisplay, getLanguageFlag } from '../../features/applicants/utils/language.utils';

export default function Dashboard() {
  const router = useRouter();
  
  // Estados principales
  const [currentUser, setCurrentUser] = useState<UserInfo>({ 
    email: '', 
    displayName: '', 
    role: 'ADMIN' 
  });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Using custom hooks - simulando paginación por ahora
  const { rows: allApplicants, loading, error, reload } = useApplicants();
  
  // Simulación de datos paginados hasta que conectemos con el backend real
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const applicants = allApplicants.slice(startIndex, endIndex);
  
  // Actualizar total de páginas cuando cambien los datos
  useEffect(() => {
    setTotalElements(allApplicants.length);
    setTotalPages(Math.ceil(allApplicants.length / pageSize));
  }, [allApplicants.length, pageSize]);
  
  const stats = useApplicantStats(allApplicants); // Usar todos los applicants para stats
  const { 
    activeTab, 
    setActiveTab, 
    searchTerm, 
    setSearchTerm, 
    filteredApplicants 
  } = useApplicantFilter(applicants); // Usar datos paginados para filtros

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
        getLanguageDisplay(applicant.language)
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

  // Funciones de paginación
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset a la primera página cuando cambia el tamaño
  };

  const goToFirstPage = () => handlePageChange(0);
  const goToLastPage = () => handlePageChange(totalPages - 1);
  const goToPreviousPage = () => handlePageChange(currentPage - 1);
  const goToNextPage = () => handlePageChange(currentPage + 1);

  // Datos para los gráficos
  const doughnutData = {
    labels: ['Mentores', 'Colaboradoras'],
    datasets: [{
      data: [stats.mentors, stats.colaboradoras],
      backgroundColor: ['var(--color-secondary)', 'var(--color-primary)'],
      borderColor: ['#ffffff', '#ffffff'],
      borderWidth: 3,
      hoverOffset: 10
    }]
  };

  const barData = {
    labels: ['Total', 'Pendientes', 'Registradas', 'Mentores', 'Colaboradoras'],
    datasets: [{
      label: 'Cantidad',
      data: [stats.total, stats.pending, stats.converted, stats.mentors, stats.colaboradoras],
      backgroundColor: [
        'var(--color-primary)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-secondary)',
        'var(--color-tertairy)'
      ],
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  // Datos simulados para tendencia mensual
  const lineData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Nuevas solicitudes',
      data: [12, 19, 15, 25, 22, 30],
      borderColor: 'var(--color-primary)',
      backgroundColor: 'rgba(120, 88, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'var(--color-primary)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#292929',
        bodyColor: '#292929',
        borderColor: '#7858ff',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13,
          weight: 'normal' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(209, 209, 209, 0.3)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-[var(--color-primary)] rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-[var(--color-muted)] font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background-light)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-[var(--color-red-50)] border border-[var(--color-red-200)] text-[var(--color-error)] px-6 py-4 rounded-xl mb-6 shadow-sm">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            onClick={() => reload()}
            className="bg-[var(--color-button-primary-primary-bg-default)] hover:bg-[var(--color-button-primary-primary-bg-hover)] text-[var(--color-button-primary-primary-text)] hover:text-[var(--color-button-primary-primary-text-hover)] font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-light)]">
      {/* Enhanced Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-sm shadow-xl border-r border-[var(--color-disabled)]">
        <div className="flex flex-col h-full">
          {/* Enhanced Logo */}
          <div className="p-6 border-b border-[var(--color-disabled)] bg-gradient-to-r from-[var(--color-background-footer)] to-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[image:var(--color-button-bg-gradient)] flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-[image:var(--color-button-bg-gradient)] bg-clip-text text-transparent">
                  SheHub Admin
                </h1>
                <p className="text-sm mt-1 text-[var(--color-muted)] font-medium">Panel de Control</p>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-6 space-y-3">
            <button 
              className="w-full flex items-center space-x-4 px-4 py-4 text-left rounded-xl font-medium bg-gradient-to-r from-[var(--color-primary-hover)] to-[var(--color-secondary-hover)] text-[var(--color-primary)] border border-[var(--color-primary)] shadow-sm hover:shadow-md transition-all duration-300"
              title="Ver lista de espera de solicitudes"
            >
              <div className="p-2 rounded-lg bg-[var(--color-primary)] text-white shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <span>Lista de Espera</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
            </button>
            
            <button 
              className="w-full flex items-center space-x-4 px-4 py-4 text-left rounded-xl hover:bg-[var(--color-primary-hover)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-all duration-300 group"
              title="Ver notificaciones del sistema"
            >
              <div className="p-2 rounded-lg bg-[var(--color-disabled)] group-hover:bg-[var(--color-primary)] text-[var(--color-muted)] group-hover:text-white transition-all duration-300 shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <span>Notificaciones</span>
              <div className="ml-auto">
                <span className="w-6 h-6 rounded-full bg-[var(--color-error)] text-white text-xs font-bold flex items-center justify-center shadow-sm animate-bounce">
                  3
                </span>
              </div>
            </button>
            
            <button 
              className="w-full flex items-center space-x-4 px-4 py-4 text-left rounded-xl hover:bg-[var(--color-primary-hover)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-all duration-300 group"
              title="Abrir configuración del sistema"
            >
              <div className="p-2 rounded-lg bg-[var(--color-disabled)] group-hover:bg-[var(--color-primary)] text-[var(--color-muted)] group-hover:text-white transition-all duration-300 shadow-sm">
                <Settings className="w-5 h-5" />
              </div>
              <span>Configuración</span>
            </button>
          </nav>

          {/* Enhanced User Info */}
          <div className="p-6 border-t border-[var(--color-disabled)] bg-gradient-to-r from-[var(--color-background-footer)] to-white">
            <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-white/50">
              <div className="w-12 h-12 bg-[image:var(--color-button-bg-gradient)] rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                {getUserInitials(currentUser.displayName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-bold text-[var(--color-foreground)]">
                    {currentUser.displayName}
                  </p>
                  {currentUser.role === 'SUPER_ADMIN' && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-[var(--color-secondary)] text-white shadow-sm">
                      SUPER
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-muted)] font-medium">
                  {currentUser.email}
                </p>
              </div>
              <button className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors" title="Abrir menú de usuario">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl text-sm transition-all duration-300 hover:bg-[var(--color-red-50)] text-[var(--color-muted)] hover:text-[var(--color-error)] group"
              title="Cerrar sesión y regresar al login"
            >
              <div className="p-1.5 rounded-lg bg-[var(--color-disabled)] group-hover:bg-[var(--color-red-100)] transition-all duration-300">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-72">
        {/* Enhanced Header */}
        <header className="bg-[var(--color-header-bg)] backdrop-blur-sm border-b border-[var(--color-disabled)] px-8 py-6 shadow-[var(--color-header-shadow)] sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-1">
                {getGreeting()}, {currentUser.displayName}
              </h1>
              <p className="text-[var(--color-muted)] font-medium">Gestiona las solicitudes de acceso a SheHub</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => reload()}
                className="p-3 text-[var(--color-icon-default)] hover:text-[var(--color-icon-hover)] hover:bg-[var(--color-primary-hover)] rounded-xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                title="Actualizar datos"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button 
                className="px-6 py-3 rounded-xl text-[var(--color-button-primary-primary-text)] bg-[image:var(--color-button-bg-gradient)] hover:opacity-90 transition-all duration-300 flex items-center space-x-2 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                title="Invitar un nuevo usuario al sistema"
              >
                <Plus className="w-4 h-4" />
                <span>Invitar Usuario</span>
              </button>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              { title: 'Total Solicitudes', value: stats.total, icon: Users, color: 'var(--color-primary)', bg: 'var(--color-avatar-primary-variant-bg)' },
              { title: 'Pendientes', value: stats.pending, icon: Clock, color: 'var(--color-warning)', bg: 'var(--color-avatar-tertairy-variant-bg)' },
              { title: 'Registradas', value: stats.converted, icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-green-100)' },
              { title: 'Mentores', value: stats.mentors, icon: Star, color: 'var(--color-secondary)', bg: 'var(--color-avatar-secondary-variant-bg)' },
              { title: 'Colaboradoras', value: stats.colaboradoras, icon: Users, color: 'var(--color-tertairy)', bg: 'var(--color-avatar-tertairy-variant-bg)' }
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-[var(--color-card-white-bg-default)] p-6 rounded-2xl border border-[var(--color-disabled)] shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-card-white-description)] font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-card-white-title)] group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Doughnut Chart */}
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-2xl border border-[var(--color-disabled)] shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--color-card-white-title)] flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                  <span>Distribución</span>
                </h3>
              </div>
              <div className="h-48 relative">
                <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '60%' }} />
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-2xl border border-[var(--color-disabled)] shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--color-card-white-title)] flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span>Estadísticas</span>
                </h3>
              </div>
              <div className="h-48 relative">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-[var(--color-card-white-bg-default)] p-6 rounded-2xl border border-[var(--color-disabled)] shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--color-card-white-title)] flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[var(--color-tertairy)]" />
                  <span>Tendencia</span>
                </h3>
              </div>
              <div className="h-48 relative">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Enhanced Main Content Card */}
          <div className="bg-[var(--color-card-white-bg-default)] rounded-2xl border border-[var(--color-disabled)] shadow-[var(--color-card-shadow-default)] hover:shadow-[var(--color-card-shadow-hover)] transition-shadow duration-300">
            {/* Toolbar */}
            <div className="p-8 border-b border-[var(--color-disabled)] bg-gradient-to-r from-[var(--color-background-footer)] to-white rounded-t-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-muted)] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por email, nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-[var(--color-disabled)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-6 py-4 bg-[var(--color-button-secondary-primary-bg-default)] text-[var(--color-button-secondary-primary-text)] border border-[var(--color-button-secondary-primary-border)] rounded-xl hover:bg-[var(--color-button-secondary-primary-bg-hover)] transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:scale-105"
                    title="Exportar datos"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Tabs */}
              <div className="flex flex-wrap gap-2 mt-8 p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50">
                {[
                  { key: 'all' as TabType, label: 'Todos', count: stats.total },
                  { key: 'mentors' as TabType, label: 'Mentores', count: stats.mentors },
                  { key: 'colaboradoras' as TabType, label: 'Colaboradoras', count: stats.colaboradoras },
                  { key: 'pending' as TabType, label: 'Pendientes', count: stats.pending },
                  { key: 'converted' as TabType, label: 'Registradas', count: stats.converted }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 text-sm font-bold rounded-lg transition-all duration-300 hover:scale-105 ${
                      activeTab === tab.key
                        ? 'bg-[var(--color-toggle-bg-active)] text-[var(--color-toggle-text-active)] shadow-md'
                        : 'text-[var(--color-toggle-text-default)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-toggle-bg-hover)] shadow-sm'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[var(--color-background-footer)] to-white">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      Aplicante
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      Idioma
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      Roles (ocupación actual)
                    </th>
                    <th className="px-8 py-6 text-right text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-card-white-bg-default)] divide-y divide-[var(--color-disabled)]">
                  {filteredApplicants.map((applicant, index) => (
                    <tr key={applicant.id} className="hover:bg-[var(--color-card-white-bg-hover)] transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[image:var(--color-button-bg-gradient)] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {getUserInitials(`${applicant.firstName} ${applicant.lastName}`)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[var(--color-card-white-title)]">
                              {applicant.firstName} {applicant.lastName}
                            </div>
                            <div className="text-sm text-[var(--color-card-white-description)]">
                              {applicant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xl">
                          {getLanguageFlag(applicant.language)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                          applicant.mentor 
                            ? 'bg-[var(--color-avatar-secondary-variant-bg)] text-[var(--color-secondary)]'
                            : 'bg-[var(--color-avatar-primary-variant-bg)] text-[var(--color-primary)]'
                        }`}>
                          {applicant.mentor ? (
                            <>
                              <Star className="w-3 h-3 mr-1.5" />
                              Mentor
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3 mr-1.5" />
                              Colaboradora
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {applicant.roles.slice(0, 2).map((role, roleIndex) => (
                            <span
                              key={roleIndex}
                              className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-disabled)] text-[var(--color-foreground)]"
                            >
                              {role}
                            </span>
                          ))}
                          {applicant.roles.length > 2 && (
                            <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-avatar-tertairy-variant-bg)] text-[var(--color-tertairy)]">
                              +{applicant.roles.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedApplicant(applicant)}
                            className="p-2 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors duration-200"
                            aria-label={`Ver detalles de ${applicant.firstName} ${applicant.lastName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* TODO: Implementar edición */}}
                            className="p-2 rounded-lg text-[var(--color-icon-default)] hover:bg-gray-50 transition-colors duration-200"
                            aria-label={`Editar información de ${applicant.firstName} ${applicant.lastName}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* TODO: Implementar eliminación */}}
                            className="p-2 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-red-50)] transition-colors duration-200"
                            aria-label={`Eliminar solicitud de ${applicant.firstName} ${applicant.lastName}`}
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
                <div className="text-center py-16 bg-gradient-to-b from-white to-[var(--color-background-footer)]">
                  <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-disabled)] to-[var(--color-neutral-200)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Users className="w-12 h-12 text-[var(--color-muted)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
                    No se encontraron aplicantes
                  </h3>
                  <p className="text-[var(--color-muted)] font-medium">
                    {searchTerm 
                      ? `No hay resultados para "${searchTerm}"`
                      : 'No hay aplicantes disponibles'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Controles de Paginación */}
            {totalElements > 0 && (
              <div className="px-8 py-6 border-t border-[var(--color-disabled)] bg-gradient-to-r from-[var(--color-background-footer)] to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Información de paginación */}
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-[var(--color-muted)] font-medium">
                      Mostrando {Math.min(startIndex + 1, totalElements)} - {Math.min(endIndex, totalElements)} de {totalElements} aplicantes
                    </div>
                    
                    {/* Selector de tamaño de página */}
                    <div className="flex items-center space-x-2">
                      <label htmlFor="page-size-select" className="text-sm font-medium text-[var(--color-muted)]">
                        Por página:
                      </label>
                      <select
                        id="page-size-select"
                        title="Selecciona el número de elementos por página"
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="px-3 py-2 border border-[var(--color-disabled)] rounded-lg text-sm font-medium bg-white hover:bg-[var(--color-primary-hover)] transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* Controles de navegación */}
                  <div className="flex items-center space-x-2">
                    {/* Ir a primera página */}
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 0}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === 0
                          ? 'text-[var(--color-muted)] bg-[var(--color-disabled)] cursor-not-allowed'
                          : 'text-[var(--color-foreground)] bg-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md'
                      }`}
                      aria-label="Ir a la primera página"
                    >
                      Primero
                    </button>

                    {/* Página anterior */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage === 0
                          ? 'text-[var(--color-muted)] bg-[var(--color-disabled)] cursor-not-allowed'
                          : 'text-[var(--color-foreground)] bg-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md'
                      }`}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Indicador de página actual */}
                    <div className="flex items-center space-x-2">
                      <span className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold shadow-sm">
                        {currentPage + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-muted)]">
                        de {totalPages}
                      </span>
                    </div>

                    {/* Página siguiente */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage >= totalPages - 1
                          ? 'text-[var(--color-muted)] bg-[var(--color-disabled)] cursor-not-allowed'
                          : 'text-[var(--color-foreground)] bg-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md'
                      }`}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Ir a última página */}
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage >= totalPages - 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage >= totalPages - 1
                          ? 'text-[var(--color-muted)] bg-[var(--color-disabled)] cursor-not-allowed'
                          : 'text-[var(--color-foreground)] bg-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md'
                      }`}
                      aria-label="Ir a la última página"
                    >
                      Último
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-card-white-bg-default)] backdrop-blur-xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-[var(--color-disabled)] bg-gradient-to-r from-[var(--color-background-footer)] to-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[image:var(--color-button-bg-gradient)] rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getUserInitials(`${selectedApplicant.firstName} ${selectedApplicant.lastName}`)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
                      {selectedApplicant.firstName} {selectedApplicant.lastName}
                    </h2>
                    <p className="text-[var(--color-muted)] font-medium">{selectedApplicant.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-3 text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-red-50)] rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
                  aria-label="Cerrar ventana de detalles"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-bold shadow-lg ${
                  selectedApplicant.userId 
                    ? 'bg-gradient-to-r from-[var(--color-green-100)] to-[var(--color-green-200)] text-[var(--color-success)] border border-[var(--color-green-300)]'
                    : 'bg-gradient-to-r from-[var(--color-avatar-tertairy-variant-bg)] to-[var(--color-orange-200)] text-[var(--color-warning)] border border-[var(--color-orange-300)]'
                }`}>
                  {selectedApplicant.userId ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Ya registrada en el sistema
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Pendiente de registro
                    </>
                  )}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Nombre', value: selectedApplicant.firstName },
                  { label: 'Apellido', value: selectedApplicant.lastName },
                  { 
                    label: 'Idioma', 
                    value: (
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getLanguageFlag(selectedApplicant.language)}</span>
                        <span className="font-medium">{getLanguageDisplay(selectedApplicant.language)}</span>
                      </div>
                    )
                  },
                  { label: 'Fecha de registro', value: formatDate(selectedApplicant.timestamp) }
                ].map((item, index) => (
                  <div key={index} className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[var(--color-disabled)] hover:shadow-md transition-all duration-300 hover:scale-105">
                    <label className="block text-sm font-bold text-[var(--color-muted)] mb-3 uppercase tracking-wider">
                      {item.label}
                    </label>
                    <div className="text-lg font-bold text-[var(--color-foreground)]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Email Section */}
              <div className="p-6 bg-gradient-to-r from-[var(--color-avatar-primary-variant-bg)] to-[var(--color-purple-100)] rounded-2xl border border-[var(--color-purple-200)] shadow-sm">
                <label className="block text-sm font-bold text-[var(--color-primary)] mb-3 uppercase tracking-wider">
                  Email de contacto
                </label>
                <div className="text-lg font-bold text-[var(--color-primary)] break-all">
                  {selectedApplicant.email}
                </div>
              </div>
              
              {/* Type Section */}
              <div className="p-6 bg-gradient-to-r from-[var(--color-avatar-secondary-variant-bg)] to-[var(--color-pink-100)] rounded-2xl border border-[var(--color-pink-200)] shadow-sm">
                <label className="block text-sm font-bold text-[var(--color-secondary)] mb-4 uppercase tracking-wider">
                  Tipo de participación
                </label>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-bold shadow-md ${
                    selectedApplicant.mentor 
                      ? 'bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-pink-600)] text-white'
                      : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-purple-600)] text-white'
                  }`}>
                    {selectedApplicant.mentor ? (
                      <>
                        <Star className="w-5 h-5 mr-2" />
                        Mentora
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Colaboradora
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Roles Section */}
              <div className="p-6 bg-gradient-to-r from-[var(--color-avatar-tertairy-variant-bg)] to-[var(--color-orange-100)] rounded-2xl border border-[var(--color-orange-200)] shadow-sm">
                <label className="block text-sm font-bold text-[var(--color-tertairy)] mb-4 uppercase tracking-wider">
                  Roles y ocupación actual
                </label>
                <div className="flex flex-wrap gap-3">
                  {selectedApplicant.roles.map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--color-tertairy)] to-[var(--color-orange-600)] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-[var(--color-disabled)]">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-[var(--color-muted)] border border-[var(--color-disabled)] rounded-2xl hover:bg-[var(--color-disabled)] hover:text-[var(--color-foreground)] hover:shadow-md transition-all duration-300 hover:scale-105 font-bold"
                >
                  Cerrar
                </button>
                <button className="px-8 py-4 bg-[image:var(--color-button-bg-gradient)] text-white rounded-2xl hover:opacity-90 hover:shadow-lg transition-all duration-300 hover:scale-105 font-bold flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Editar Información</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

