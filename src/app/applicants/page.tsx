"use client";

import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  LogOut,
  Plus,
  RefreshCw,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ApplicantForm } from "../../components/ApplicantForm";
import { ApplicantList } from "../../components/ApplicantList";
import {
  ApplicantStats,
  type ApplicantStatsRef,
} from "../../components/ApplicantStats";
import { Greeting } from "../../components/Greeting";
import { SearchAndFilters } from "../../components/SearchAndFilters";
import { useApplicantFilters } from "../../features/hooks/useApplicantFilter";
import { useApplicants } from "../../features/hooks/useApplicants";
import { applicantApi } from "../../features/lib/applicants";
import {
  ApplicantListItemDto,
  CreateApplicantDto,
  Language,
  UpdateApplicantDto,
  getLanguageDisplayName,
} from "../../features/types/applicant";

// Helper para parsear timestamp del backend
const parseApiTimestamp = (ts?: string) => {
  if (!ts) return null;
  const isoish = ts.replace(" ", "T");
  const d = new Date(isoish);
  return isNaN(d.getTime()) ? null : d;
};

type ModalType = "create" | "edit" | "delete" | "view" | null;

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<"sm" | "md" | "lg" | "xl", string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-neutral-900/50 backdrop-blur-sm z-40"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`inline-block w-full ${sizeClasses[size]} p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-xl relative z-50`}
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-purple-50">
            <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all duration-200"
              type="button"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
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
      <div className="space-y-6">
        <p className="text-neutral-700 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Procesando...
              </>
            ) : (
              "Eliminar"
            )}
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
  const [userEmail, setUserEmail] = useState<string>("");

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
  } = useApplicantFilters("active");

  // Estados para modales y UI
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantListItemDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para eliminados
  const [deletedApplicants, setDeletedApplicants] = useState<
    ApplicantListItemDto[]
  >([]);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [deletedError, setDeletedError] = useState<string | null>(null);

  // Funciones del sidebar
  useEffect(() => {
    const email = sessionStorage.getItem("demo_email") || "";
    setUserEmail(email);
  }, []);

  const menuItems = [
    { icon: Users, label: "Applicants", href: "/applicants" },
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Bell, label: "Notificaciones", href: "/notifications", badge: 3 },
    { icon: FileText, label: "Formularios", href: "/forms" },
    { icon: User, label: "Usuarios", href: "/users" },
  ];

  const [showStats, setShowStats] = useState(false);
  const handleNavigation = (href: string) => {
    if (href === "/dashboard") {
      setShowStats(true);
    } else {
      setShowStats(false);
      router.push(href);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("demo_email");
    sessionStorage.removeItem("demo_pass");
    router.push("/");
  };

  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-blue-500",
    ];
    const index = email.length % colors.length;
    return colors[index];
  };

  // Carga según statusFilter
  useEffect(() => {
    const load = async () => {
      try {
        if (filters.statusFilter === "deleted") {
          setDeletedLoading(true);
          setDeletedError(null);
          const data = await applicantApi.getDeleted();
          setDeletedApplicants(data);
        } else if (filters.statusFilter === "all") {
          setDeletedLoading(true);
          setDeletedError(null);
          const deleted = await applicantApi.getDeleted();
          await refreshActive();
          setDeletedApplicants(deleted);
        } else {
          await refreshActive();
        }
      } catch (e) {
        setDeletedError(
          e instanceof Error ? e.message : "Error cargando eliminados"
        );
      } finally {
        if (filters.statusFilter !== "active") setDeletedLoading(false);
      }
    };

    load();
  }, [filters.statusFilter, refreshActive]);

  const sourceApplicants = useMemo(() => {
    if (filters.statusFilter === "deleted") return deletedApplicants;
    if (filters.statusFilter === "all")
      return [...applicants, ...deletedApplicants];
    return applicants;
  }, [filters.statusFilter, applicants, deletedApplicants]);

  // Paginación
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const filteredApplicants = useMemo(() => {
    return applyFilters(sourceApplicants);
  }, [applyFilters, sourceApplicants]);

  const totalPages = Math.ceil(filteredApplicants.length / pageSize);
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplicants.slice(start, start + pageSize);
  }, [filteredApplicants, currentPage, pageSize]);

  const isLoading =
    applicantsLoading || (filters.statusFilter !== "active" && deletedLoading);

  const handleCreate = async (data: CreateApplicantDto) => {
    try {
      setIsSubmitting(true);
      await create(data);
      await handleRefresh();
      setActiveModal(null);
    } catch (error) {
      console.error("Error creating applicant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (applicant: ApplicantListItemDto) => {
    setSelectedApplicant(applicant);
    setActiveModal("edit");
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
      console.error("Error updating applicant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = (applicant: ApplicantListItemDto) => {
    setSelectedApplicant(applicant);
    setActiveModal("delete");
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
      console.error("Error deleting applicant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (applicant: ApplicantListItemDto) => {
    setSelectedApplicant(applicant);
    setActiveModal("view");
  };

  const handleRestore = async (applicant: ApplicantListItemDto) => {
    try {
      setIsSubmitting(true);
      await applicantApi.restore(applicant.email);
      await handleRefresh();
    } catch (error) {
      console.error("Error restoring applicant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    if (filters.statusFilter === "deleted") {
      setDeletedLoading(true);
      try {
        const data = await applicantApi.getDeleted();
        setDeletedApplicants(data);
      } finally {
        setDeletedLoading(false);
      }
    } else if (filters.statusFilter === "all") {
      setDeletedLoading(true);
      try {
        const deleted = await applicantApi.getDeleted();
        await refreshActive();
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
    if (filters.statusFilter === "deleted")
      return "No hay applicants eliminados";
    if (filters.statusFilter === "active") return "No hay applicants activos";
    return "No hay applicants";
  }, [filters.statusFilter]);

  const handleExport = () => {
    const headers = [
      "ID",
      "Email",
      "Nombre",
      "Apellido",
      "Idioma",
      "Tipo",
      "Roles",
      "Estado",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredApplicants.map((a) =>
        [
          a.id,
          a.email,
          a.firstName,
          a.lastName,
          getLanguageDisplayName((a.language as Language) ?? Language.ES),
          a.mentor ? "Mentor" : "Colaboradora",
          `"${a.roles.join(", ")}"`,
          a.deleted ? "Eliminado" : "Activo",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "applicants.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (applicantsError || deletedError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Error al cargar datos
          </h3>
          <p className="text-red-600 mb-6">{applicantsError || deletedError}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-br from-purple-50 to-pink-50 border-r border-neutral-200 flex flex-col transition-all duration-300 z-40 shadow-lg ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
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
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 group"
            title={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-900" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-neutral-600 group-hover:text-neutral-900" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div
                  className={`flex-shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-neutral-500 group-hover:text-purple-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-medium">
                    {item.badge > 9 ? "9+" : item.badge}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Perfil de usuario */}
        <div className="p-4 border-t border-neutral-200">
          <div
            className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 shadow-sm ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md border-4 border-white ${getAvatarColor(userEmail)}`}
            >
              {getUserInitials(userEmail)}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-purple-700 truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-pink-600 font-semibold mt-1">
                  Administradora
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-4 py-2 mt-4 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-md hover:from-pink-600 hover:to-purple-600 transition-all duration-200 ${sidebarCollapsed ? "justify-center" : ""}`}
            title={sidebarCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Greeting name={userEmail.split("@")[0]} />
          {/* Header */}
          <div className="mb-8 fade-in">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Gestión de Applicants
                </h1>
                <p className="text-neutral-600">
                  Administra y supervisa todos los candidatos del sistema
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    await handleRefresh();
                    if (statsRef.current) {
                      await statsRef.current.refresh();
                    }
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  type="button"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 shadow-sm"
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
                <button
                  onClick={() => setActiveModal("create")}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 shadow-md hover:shadow-lg"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Applicant
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {showStats && (
            <div id="dashboard-stats" className="mb-8">
              <ApplicantStats ref={statsRef} />
            </div>
          )}

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

          {/* Paginación */}

          {/* Botón para limpiar filtros */}
          {hasActiveFilters && (
            <div className="mb-6 fade-in">
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 underline hover:no-underline transition-colors duration-200"
                type="button"
              >
                <X className="h-3 w-3" />
                Limpiar todos los filtros
              </button>
            </div>
          )}

          {/* Contenido principal */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">
                  Cargando applicants...
                </p>
              </div>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="bg-white shadow-lg rounded-lg p-12 text-center fade-in">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {emptyLabel}
              </h3>
              <p className="text-neutral-600 mb-6">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza agregando tu primer applicant"}
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={() => setActiveModal("create")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Crear Applicant
                </button>
              )}
            </div>
          ) : (
            <>
              <ApplicantList
                applicants={paginatedApplicants}
                onEdit={handleEdit}
                onDelete={handleDeleteConfirm}
                onView={handleView}
                onRestore={handleRestore}
              />
              {/* Paginación debajo del panel */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8 fade-in">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-neutral-200 rounded-xl px-4 py-2 shadow-sm">
                  <label
                    htmlFor="page-size-select"
                    className="text-sm text-purple-700 font-semibold"
                  >
                    Mostrar
                  </label>
                  <select
                    id="page-size-select"
                    aria-label="Seleccionar cantidad por página"
                    title="Seleccionar cantidad por página"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-purple-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium text-purple-700"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-purple-700 font-semibold">
                    por página
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-neutral-200 rounded-xl px-4 py-2 shadow-sm">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg border border-purple-300 bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50 font-semibold shadow"
                    type="button"
                    aria-label="Página anterior"
                    title="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="text-sm font-bold text-purple-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 py-1 rounded-lg border border-purple-300 bg-white text-purple-700 hover:bg-purple-50 hover:text-purple-900 disabled:opacity-50 font-semibold shadow"
                    type="button"
                    aria-label="Página siguiente"
                    title="Página siguiente"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Modales */}
          <Modal
            isOpen={activeModal === "create"}
            onClose={() => setActiveModal(null)}
            title="Crear Nuevo Applicant"
            size="lg"
          >
            <ApplicantForm
              mode="create"
              onSubmit={(data) => handleCreate(data as CreateApplicantDto)}
              onCancel={() => setActiveModal(null)}
              isLoading={isSubmitting}
            />
          </Modal>

          <Modal
            isOpen={activeModal === "edit"}
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
            isOpen={activeModal === "view"}
            onClose={() => {
              setActiveModal(null);
              setSelectedApplicant(null);
            }}
            title="Detalles del Applicant"
            size="md"
          >
            {selectedApplicant && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      ID
                    </label>
                    <p className="text-sm text-neutral-900 bg-neutral-50 p-2 rounded font-mono">
                      {selectedApplicant.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-neutral-900">
                      {selectedApplicant.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Nombre
                    </label>
                    <p className="text-sm text-neutral-900">
                      {selectedApplicant.firstName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Apellido
                    </label>
                    <p className="text-sm text-neutral-900">
                      {selectedApplicant.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Idioma
                    </label>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {getLanguageDisplayName(
                        (selectedApplicant.language as Language) ?? Language.ES
                      )}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Tipo
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                        selectedApplicant.mentor
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          selectedApplicant.mentor
                            ? "bg-green-500"
                            : "bg-purple-500"
                        }`}
                      ></div>
                      {selectedApplicant.mentor ? "Mentor" : "Colaboradora"}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1">
                      Creado
                    </label>
                    <p className="text-sm text-neutral-900">
                      {(() => {
                        const dt = parseApiTimestamp(
                          selectedApplicant.timestamp as string | undefined
                        );
                        return dt ? dt.toLocaleString("es-ES") : "—";
                      })()}
                    </p>
                  </div>
                  {selectedApplicant.deletedAt && (
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1">
                        Eliminado
                      </label>
                      <p className="text-sm text-red-600 font-medium">
                        {new Date(selectedApplicant.deletedAt).toLocaleString(
                          "es-ES"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-3">
                    Roles Profesionales
                  </label>
                  {selectedApplicant.roles.length === 0 ? (
                    <p className="text-sm text-neutral-500 italic bg-neutral-50 p-4 rounded-lg">
                      Sin roles definidos
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedApplicant.roles.map((role, index) => (
                        <div
                          key={`${role}-${index}`}
                          className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm font-medium text-indigo-800">
                            {role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setSelectedApplicant(null);
                    }}
                    className="px-4 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 transition-all duration-200"
                    type="button"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </Modal>

          <ConfirmModal
            isOpen={activeModal === "delete"}
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
