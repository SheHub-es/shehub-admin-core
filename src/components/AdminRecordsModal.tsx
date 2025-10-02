"use client";

import {
  Clock,
  Edit3,
  ExternalLink,
  MapPin,
  Plus,
  User,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { adminRecordsApi } from "../features/lib/admin-records";
import {
  AccessToOptions,
  AdminRecordsCreateDTO,
  AdminRecordsDetailDTO,
  AdminRecordsPatchDTO,
  ApplicantListItemDto,
  arrayToCsv,
  Currently,
  CurrentlyDisplay,
  ProjectsOptions,
  Status,
  StatusDisplay,
} from "../features/types/applicant";

// Límites de caracteres según el backend
const CHAR_LIMITS = {
  orgNotes: 500,
  bookingLink: 2048,
  portfolio: 300,
  oneToOneNotes: 2048,
  projectInterview: 300,
  notas: 500,
};

function ModalBase({
  isOpen,
  onClose,
  title,
  children,
  size = "xl",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  };
  

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-neutral-900/60 backdrop-blur-md z-40" 
          onClick={onClose}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
        <div
          className={`inline-block w-full ${sizeClasses[size]} p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative z-50 max-h-[90vh] overflow-y-auto border border-neutral-100`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 sticky top-0 z-10 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-white/50 rounded-lg transition-all duration-200 hover:rotate-90 hover:scale-110"
              type="button"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 bg-gradient-to-b from-white to-neutral-50">{children}</div>
        </div>
      </div>
    </div>
  );
}

export interface AdminRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: ApplicantListItemDto | null;
  onRecordSaved?: (record: AdminRecordsDetailDTO) => void;
}

interface CreateFormData {
  status: Status;
  projects: string[];
  currently: Currently | "";
  ciudad: string;
  accessTo: string[];
  orgNotes: string;
  bookingLink: string;
  portfolio: string;
  oneToOneNotes: string;
  projectInterview: string;
  notas: string;
}

interface EditFormData {
  status: Status;
  projects: string[];
  currently: Currently | "";
  ciudad: string;
  accessTo: string[];
  orgNotes: string;
  bookingLink: string;
  portfolio: string;
  oneToOneNotes: string;
  projectInterview: string;
  notas: string;
}

type ViewMode = "view" | "create" | "edit";

const emptyCreateForm: CreateFormData = {
  status: Status.NE,
  projects: [],
  currently: "",
  ciudad: "",
  accessTo: [],
  orgNotes: "",
  bookingLink: "",
  portfolio: "",
  oneToOneNotes: "",
  projectInterview: "",
  notas: "",
};

export default function AdminRecordsModal({
  isOpen,
  onClose,
  applicant,
  onRecordSaved,
}: AdminRecordsModalProps) {
  const [mode, setMode] = useState<ViewMode>("view");
  const [adminRecord, setAdminRecord] = useState<AdminRecordsDetailDTO | null>(
    null
  );
  const [hasRecord, setHasRecord] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);

  useEffect(() => {
    if (applicant && isOpen) {
      setMode("view");
      setAdminRecord(null);
      setHasRecord(false);
      setEditForm(null);
      loadAdminRecord(applicant.id);
    }
  }, [applicant, isOpen]);

  const loadAdminRecord = async (applicantId: number) => {
    try {
      setLoading(true);

      const record = await adminRecordsApi.getByApplicantId(applicantId);

      setAdminRecord(record);
      setHasRecord(true);
    } catch {
      setAdminRecord(null);
      setHasRecord(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!applicant) return;

    try {
      setSaving(true);

      const dto: AdminRecordsCreateDTO = {
        status: createForm.status,
        projects: arrayToCsv(createForm.projects),
        ciudad: createForm.ciudad,
        accessTo: arrayToCsv(createForm.accessTo),
        orgNotes: createForm.orgNotes,
        bookingLink: createForm.bookingLink,
        portfolio: createForm.portfolio,
        oneToOneNotes: createForm.oneToOneNotes,
        projectInterview: createForm.projectInterview,
        notas: createForm.notas,
        applicantId: applicant.id,
        ...(createForm.currently !== "" && { currently: createForm.currently }),
      };

      const created = await adminRecordsApi.create(dto);

      setAdminRecord(created);
      setHasRecord(true);
      onRecordSaved?.(created);
      setCreateForm(emptyCreateForm);
      setMode("view");
    } catch (error) {
      console.error("❌ Error creando Seguimiento:", error);
      if (error instanceof Error) {
        alert(`Error al crear seguimiento: ${error.message}`);
      } else {
        alert("Error desconocido al crear seguimiento");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!adminRecord || !editForm) return;

    try {
      setSaving(true);

      const dto: AdminRecordsPatchDTO = {
        status: editForm.status,
        projects: arrayToCsv(editForm.projects),
        ciudad: editForm.ciudad,
        accessTo: arrayToCsv(editForm.accessTo),
        orgNotes: editForm.orgNotes,
        bookingLink: editForm.bookingLink,
        portfolio: editForm.portfolio,
        oneToOneNotes: editForm.oneToOneNotes,
        projectInterview: editForm.projectInterview,
        notas: editForm.notas,
        ...(editForm.currently !== "" && { currently: editForm.currently }),
      };

      const updated = await adminRecordsApi.updatePartial(adminRecord.id, dto);
      setAdminRecord(updated);
      onRecordSaved?.(updated);
      setEditForm(null);
      setMode("view");
    } catch (error) {
      console.error("Error editando AdminRecord:", error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    if (!adminRecord) return;
    const form: EditFormData = {
      status: adminRecord.status || Status.NE,
      projects: adminRecord.projects?.map((p) => p.title) || [],
      currently: adminRecord.currently || "",
      ciudad: adminRecord.ciudad || "",
      accessTo: adminRecord.accessTo?.map((a) => a.title) || [],
      orgNotes: adminRecord.orgNotes || "",
      bookingLink: adminRecord.bookingLink || "",
      portfolio: adminRecord.portfolio || "",
      oneToOneNotes: adminRecord.oneToOneNotes || "",
      projectInterview: adminRecord.projectInterview || "",
      notas: adminRecord.notas || "",
    };
    setEditForm(form);
    setMode("edit");
  };

  const getStatusBadge = (status: Status) => {
    const colors: Record<Status, string> = {
      [Status.AP]: "bg-green-100 text-green-800 border-green-200",
      [Status.EG]: "bg-blue-100 text-blue-800 border-blue-200",
      [Status.RO]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [Status.NE]: "bg-neutral-100 text-neutral-800 border-neutral-200",
      [Status.NN]: "bg-orange-100 text-orange-800 border-orange-200",
      [Status.CP]: "bg-purple-100 text-purple-800 border-purple-200",
      [Status.BR]: "bg-pink-100 text-pink-800 border-pink-200",
      [Status.CC]: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}
      >
        {StatusDisplay[status]}
      </span>
    );
  };

  const renderModeTitle = () => {
    if (!applicant) return "Seguimiento";

    switch (mode) {
      case "view":
        return hasRecord
          ? `Seguimiento - ${applicant.firstName} ${applicant.lastName}`
          : `Sin Seguimiento - ${applicant.firstName} ${applicant.lastName}`;
      case "create":
        return `Crear Seguimiento - ${applicant.firstName} ${applicant.lastName}`;
      case "edit":
        return `Editar Seguimiento - ${applicant.firstName} ${applicant.lastName}`;
      default:
        return "Seguimiento";
    }
  };

  if (!applicant) {
    return null;
  }

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
          {applicant.firstName?.charAt(0)}
          {applicant.lastName?.charAt(0)}
        </div>
        <div>
          <h4 className="text-xl font-semibold text-neutral-900">
            {applicant.firstName} {applicant.lastName}
          </h4>
          <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
            <span>{applicant.email}</span>
            <span className="text-neutral-400">•</span>
            <span>ID: {applicant.id}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : hasRecord && adminRecord ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-neutral-700">
                  Status
                </span>
              </div>
              {adminRecord.status && getStatusBadge(adminRecord.status)}
            </div>

            <div className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-neutral-700">
                  Actualmente
                </span>
              </div>
              <span className="text-neutral-900 font-medium">
                {adminRecord.currently
                  ? CurrentlyDisplay[adminRecord.currently]
                  : "—"}
              </span>
            </div>

            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-neutral-700">
                  Ciudad
                </span>
              </div>
              <span className="text-neutral-900 font-medium">
                {adminRecord.ciudad || "—"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
            <h5 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              Proyectos Asignados
            </h5>
            {adminRecord.projects && adminRecord.projects.length > 0 ? (
              <div className="space-y-2">
                {adminRecord.projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white border border-purple-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all duration-200"
                  >
                    <span className="font-semibold text-purple-900">
                      {project.title}
                    </span>
                    {project.link && (
                      <button
                        onClick={() => window.open(project.link, "_blank")}
                        className="text-purple-600 hover:text-purple-800 hover:scale-110 transition-all duration-200"
                        title="Abrir enlace"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 italic text-center py-4">Sin proyectos asignados</p>
            )}
          </div>

          {adminRecord.accessTo && adminRecord.accessTo.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-lg p-4">
              <h5 className="font-semibold text-neutral-900 mb-3">Accesos</h5>
              <div className="flex flex-wrap gap-2">
                {adminRecord.accessTo.map((access, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="text-blue-900">{access.title}</span>
                    {access.link && (
                      <button
                        onClick={() => window.open(access.link, "_blank")}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Abrir enlace"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {adminRecord.orgNotes && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h6 className="font-medium text-neutral-900 mb-2">
                  Notas de Organización
                </h6>
                <p className="text-neutral-700 text-sm">
                  {adminRecord.orgNotes}
                </p>
              </div>
            )}

            {adminRecord.bookingLink && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h6 className="font-medium text-neutral-900 mb-2">
                  Enlace de Cita
                </h6>
                <a
                  href={adminRecord.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 text-sm break-all"
                >
                  {adminRecord.bookingLink}
                </a>
              </div>
            )}

            {adminRecord.portfolio && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h6 className="font-medium text-neutral-900 mb-2">Portfolio</h6>
                <p className="text-neutral-700 text-sm">
                  {adminRecord.portfolio}
                </p>
              </div>
            )}

            {adminRecord.oneToOneNotes && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h6 className="font-medium text-neutral-900 mb-2">Notas 1:1</h6>
                <p className="text-neutral-700 text-sm">
                  {adminRecord.oneToOneNotes}
                </p>
              </div>
            )}

            {adminRecord.projectInterview && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h6 className="font-medium text-neutral-900 mb-2">
                  Entrevista de Proyecto
                </h6>
                <p className="text-neutral-700 text-sm">
                  {adminRecord.projectInterview}
                </p>
              </div>
            )}

            {adminRecord.notas && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h6 className="font-medium text-neutral-900 mb-2">Notas</h6>
                <p className="text-neutral-700 text-sm">{adminRecord.notas}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-neutral-200">
            <button
              onClick={startEdit}
              className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-200"
            >
              <Edit3 className="inline h-4 w-4 mr-2" />
              Editar Seguimiento
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-neutral-50 border border-neutral-200 rounded-xl">
          <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Sin Seguimiento
          </h3>
          <p className="text-neutral-600 mb-4">
            Este applicant no tiene un registro de seguimiento todavía.
          </p>
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-2 mx-auto px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Crear Seguimiento
          </button>
        </div>
      )}
    </div>
  );

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Plus className="h-6 w-6 text-green-600" />
        <div>
          <h4 className="text-lg font-semibold text-neutral-900">
            Crear Datos Seguimiento
          </h4>
          <p className="text-sm text-neutral-600">
            Para: {applicant.firstName} {applicant.lastName} ({applicant.email})
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="create-status"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Status
            </label>
            <select
              id="create-status"
              value={createForm.status}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  status: e.target.value as Status,
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {Object.values(Status).map((status) => (
                <option key={status} value={status}>
                  {StatusDisplay[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="create-currently"
              className="block text-sm font-semibold text-neutral-700 mb-2"
            >
              Currently
            </label>
            <select
              id="create-currently"
              value={createForm.currently}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  currently: e.target.value as Currently | "",
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">— Selecciona —</option>
              {Object.values(Currently).map((curr) => (
                <option key={curr} value={curr}>
                  {CurrentlyDisplay[curr]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Ciudad
            </label>
            <input
              value={createForm.ciudad}
              onChange={(e) =>
                setCreateForm({ ...createForm, ciudad: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Madrid, Barcelona..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Proyectos
            </label>
            <div className="space-y-2">
              {ProjectsOptions.map((project) => (
                <label key={project} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.projects.includes(project)}
                    onChange={(e) => {
                      const newProjects = e.target.checked
                        ? [...createForm.projects, project]
                        : createForm.projects.filter((p) => p !== project);
                      setCreateForm({ ...createForm, projects: newProjects });
                    }}
                    className="rounded border-neutral-300 text-purple-600 focus:ring-purple-400"
                  />
                  <span className="text-sm text-neutral-700">{project}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Acceso a
            </label>
            <div className="space-y-2">
              {AccessToOptions.map((access) => (
                <label key={access} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createForm.accessTo.includes(access)}
                    onChange={(e) => {
                      const newAccessTo = e.target.checked
                        ? [...createForm.accessTo, access]
                        : createForm.accessTo.filter((a) => a !== access);
                      setCreateForm({ ...createForm, accessTo: newAccessTo });
                    }}
                    className="rounded border-neutral-300 text-purple-600 focus:ring-purple-400"
                  />
                  <span className="text-sm text-neutral-700">{access}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Notas de Organización
            </label>
            <textarea
              value={createForm.orgNotes}
              onChange={(e) =>
                setCreateForm({ ...createForm, orgNotes: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
              placeholder="Notas internas de la organización..."
            />
            <div className={`text-xs mt-1 flex justify-between items-center ${
              createForm.orgNotes.length > CHAR_LIMITS.orgNotes * 0.9
                ? 'text-orange-600 font-medium'
                : createForm.orgNotes.length > CHAR_LIMITS.orgNotes * 0.7
                ? 'text-yellow-600'
                : 'text-neutral-500'
            }`}>
              <span>
                {createForm.orgNotes.length} / {CHAR_LIMITS.orgNotes} caracteres
              </span>
              {createForm.orgNotes.length > CHAR_LIMITS.orgNotes * 0.9 && (
                <span className="text-xs">⚠️ Cerca del límite</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Enlace de Cita
            </label>
            <input
              value={createForm.bookingLink}
              onChange={(e) =>
                setCreateForm({ ...createForm, bookingLink: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="https://calendly.com/..."
            />
            <div className="text-xs text-neutral-500 mt-1">
              {createForm.bookingLink.length} / {CHAR_LIMITS.bookingLink} caracteres
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Portfolio
            </label>
            <input
              value={createForm.portfolio}
              onChange={(e) =>
                setCreateForm({ ...createForm, portfolio: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Descripción del portfolio..."
            />
            <div className="text-xs text-neutral-500 mt-1">
              {createForm.portfolio.length} / {CHAR_LIMITS.portfolio} caracteres
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Notas 1:1
            </label>
            <input
              value={createForm.oneToOneNotes}
              onChange={(e) =>
                setCreateForm({ ...createForm, oneToOneNotes: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="URL de notas de reuniones 1:1..."
            />
            <div className="text-xs text-neutral-500 mt-1">
              {createForm.oneToOneNotes.length} / {CHAR_LIMITS.oneToOneNotes} caracteres
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Entrevista de Proyecto
            </label>
            <input
              value={createForm.projectInterview}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  projectInterview: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Resultados de la entrevista..."
            />
            <div className="text-xs text-neutral-500 mt-1">
              {createForm.projectInterview.length} / {CHAR_LIMITS.projectInterview} caracteres
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Notas
            </label>
            <textarea
              value={createForm.notas}
              onChange={(e) =>
                setCreateForm({ ...createForm, notas: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
              placeholder="Notas adicionales..."
            />
            <div className="text-xs text-neutral-500 mt-1">
              {createForm.notas.length} / {CHAR_LIMITS.notas} caracteres
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
        <button
          onClick={() => setMode("view")}
          className="px-6 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 transition-all duration-200"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
          disabled={saving}
        >
          {saving ? "Creando..." : "Crear Seguimiento"}
        </button>
      </div>
    </div>
  );

  const renderEditForm = () => {
    if (!editForm || !adminRecord) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
            {applicant.firstName?.charAt(0)}
            {applicant.lastName?.charAt(0)}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-neutral-900">
              Editando: {applicant.firstName} {applicant.lastName}
            </h4>
            <p className="text-sm text-neutral-600">
              Modifica los campos necesarios y guarda los cambios
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-status"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Status
              </label>
              <select
                id="edit-status"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value as Status })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {StatusDisplay[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-currently"
                className="block text-sm font-semibold text-neutral-700 mb-2"
              >
                Currently
              </label>
              <select
                id="edit-currently"
                value={editForm.currently}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    currently: e.target.value as Currently | "",
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">— Selecciona —</option>
                {Object.values(Currently).map((curr) => (
                  <option key={curr} value={curr}>
                    {CurrentlyDisplay[curr]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Ciudad
              </label>
              <input
                value={editForm.ciudad}
                onChange={(e) =>
                  setEditForm({ ...editForm, ciudad: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Madrid, Barcelona..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Proyectos
              </label>
              <div className="space-y-2">
                {ProjectsOptions.map((project) => (
                  <label key={project} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.projects.includes(project)}
                      onChange={(e) => {
                        const newProjects = e.target.checked
                          ? [...editForm.projects, project]
                          : editForm.projects.filter((p) => p !== project);
                        setEditForm({ ...editForm, projects: newProjects });
                      }}
                      className="rounded border-neutral-300 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-sm text-neutral-700">{project}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Acceso a
              </label>
              <div className="space-y-2">
                {AccessToOptions.map((access) => (
                  <label key={access} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.accessTo.includes(access)}
                      onChange={(e) => {
                        const newAccessTo = e.target.checked
                          ? [...editForm.accessTo, access]
                          : editForm.accessTo.filter((a) => a !== access);
                        setEditForm({ ...editForm, accessTo: newAccessTo });
                      }}
                      className="rounded border-neutral-300 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="text-sm text-neutral-700">{access}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Notas de Organización
              </label>
              <textarea
                value={editForm.orgNotes}
                onChange={(e) =>
                  setEditForm({ ...editForm, orgNotes: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
                placeholder="Notas internas de la organización..."
              />
              <div className="text-xs text-neutral-500 mt-1">
                {editForm.orgNotes.length} / {CHAR_LIMITS.orgNotes} caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Enlace de Cita
              </label>
              <input
                value={editForm.bookingLink}
                onChange={(e) =>
                  setEditForm({ ...editForm, bookingLink: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="https://calendly.com/..."
              />
              <div className="text-xs text-neutral-500 mt-1">
                {editForm.bookingLink.length} / {CHAR_LIMITS.bookingLink} caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Portfolio
              </label>
              <input
                value={editForm.portfolio}
                onChange={(e) =>
                  setEditForm({ ...editForm, portfolio: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Descripción del portfolio..."
              />
              <div className="text-xs text-neutral-500 mt-1">
                {editForm.portfolio.length} / {CHAR_LIMITS.portfolio} caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Notas 1:1
              </label>
              <input
                value={editForm.oneToOneNotes}
                onChange={(e) =>
                  setEditForm({ ...editForm, oneToOneNotes: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="URL de notas de reuniones 1:1..."
              />
              <div className="text-xs text-neutral-500 mt-1">
                {editForm.oneToOneNotes.length} / {CHAR_LIMITS.oneToOneNotes} caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Entrevista de Proyecto
              </label>
              <input
                value={editForm.projectInterview}
                onChange={(e) =>
                  setEditForm({ ...editForm, projectInterview: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Resultados de la entrevista..."
              />
              <div className="text-xs text-neutral-500 mt-1">
                {editForm.projectInterview.length} / {CHAR_LIMITS.projectInterview} caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Notas
              </label>
              <textarea
                value={editForm.notas}
                onChange={(e) =>
                  setEditForm({ ...editForm, notas: e.target.value })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
                placeholder="Notas adicionales..."
              />
              <div className="text-xs text-neutral-500 mt-1">
                {editForm.notas.length} / {CHAR_LIMITS.notas} caracteres
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-neutral-200">
          <button
            onClick={() => {
              setEditForm(null);
              setMode("view");
            }}
            className="px-6 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 transition-all duration-200"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleEdit}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={renderModeTitle()}
      size="2xl"
    >
      {mode === "view" && renderViewMode()}
      {mode === "create" && renderCreateForm()}
      {mode === "edit" && renderEditForm()}
    </ModalBase>
  );
}