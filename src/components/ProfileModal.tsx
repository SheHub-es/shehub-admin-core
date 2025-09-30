"use client";

import {
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Github,
  Lightbulb,
  Linkedin,
  Mail,
  MapPin,
  User,
  X,
  AlertTriangle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { applicantProfileApi } from "../features/lib/applicants";
import {
  ApplicantListItemDto,
  ApplicantProfile,
  DESIRED_ROLES,
  Disponibilidad,
  getDisponibilidadDisplayName,
  getLanguageDisplayName,
  Language,
  UpdateApplicantProfileDto,
  validateGitHubUrl,
  validateLinkedInUrl,
} from "../features/types/applicant";

const MOTIVACION_MAX_LENGTH = 300;
const EXPERIENCIA_MAX_LENGTH = 300;

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
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
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
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-neutral-900/50 backdrop-blur-sm z-40"
          onClick={onClose}
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

function CharacterCounter({
  current,
  max,
  label,
}: {
  current: number;
  max: number;
  label: string;
}) {
  const remaining = max - current;
  const percentage = (current / max) * 100;

  const isWarning = percentage >= 80 && percentage < 95;
  const isDanger = percentage >= 95;

  return (
    <div className="flex items-center justify-between text-xs mt-1">
      <span
        className={`font-medium ${
          isDanger
            ? "text-red-600"
            : isWarning
              ? "text-orange-600"
              : "text-neutral-500"
        }`}
      >
        {current} / {max} caracteres
      </span>
      {(isWarning || isDanger) && (
        <div
          className={`flex items-center gap-1 ${
            isDanger ? "text-red-600" : "text-orange-600"
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          <span className="font-semibold">
            {isDanger ? `¡Límite alcanzado!` : `${remaining} restantes`}
          </span>
        </div>
      )}
    </div>
  );
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: ApplicantListItemDto | null;
  profile: ApplicantProfile | null;
  isLoading: boolean;
  onSaved?: (updated: ApplicantProfile) => void;
}

type ProfileForm = {
  linkedInProfile: string;
  githubProfile: string;
  rolDeseado: string;
  motivacion: string;
  experiencia: string;
  disponibilidad: string;
  bootcamp: string;
};

const toForm = (p: ApplicantProfile): ProfileForm => ({
  linkedInProfile: p.linkedInProfile || "",
  githubProfile: p.githubProfile || "",
  rolDeseado: p.rolDeseado || "",
  motivacion: p.motivacion || "",
  experiencia: p.experiencia || "",
  disponibilidad: (p.disponibilidad as string) || "",
  bootcamp: p.bootcamp || "",
});

const toUpdateDto = (f: ProfileForm): UpdateApplicantProfileDto => ({
  linkedInProfile: f.linkedInProfile || undefined,
  githubProfile: f.githubProfile || undefined,
  rolDeseado: f.rolDeseado || undefined,
  motivacion: f.motivacion || undefined,
  experiencia: f.experiencia || undefined,
  disponibilidad: f.disponibilidad || undefined,
  bootcamp: f.bootcamp || undefined,
});

const emptyForm: ProfileForm = {
  linkedInProfile: "",
  githubProfile: "",
  rolDeseado: "",
  motivacion: "",
  experiencia: "",
  disponibilidad: "",
  bootcamp: "",
};

type CreateProfileData = {
  linkedInProfile: string;
  githubProfile?: string;
  rolDeseado?: string;
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
  bootcamp?: string;
};

export default function ProfileModal({
  isOpen,
  onClose,
  applicant,
  profile,
  isLoading,
  onSaved,
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [isOpen]);

  useEffect(() => {
    if (profile) {
      setForm(toForm(profile));
    } else if (applicant) {
      setForm(emptyForm);
    } else {
      setForm(null);
    }
  }, [profile, applicant]);

  const linkedInOk = useMemo(
    () => !form?.linkedInProfile || validateLinkedInUrl(form.linkedInProfile),
    [form]
  );
  const githubOk = useMemo(
    () => !form?.githubProfile || validateGitHubUrl(form.githubProfile),
    [form]
  );

  const motivacionValid = useMemo(
    () => !form?.motivacion || form.motivacion.length <= MOTIVACION_MAX_LENGTH,
    [form]
  );
  const experienciaValid = useMemo(
    () =>
      !form?.experiencia || form.experiencia.length <= EXPERIENCIA_MAX_LENGTH,
    [form]
  );

  const canCreate = useMemo(() => {
    if (!form || !applicant || profile) return false;
    const hasLinkedIn = form.linkedInProfile.trim().length > 0;
    const linkedInValid = validateLinkedInUrl(form.linkedInProfile);
    const githubValid =
      !form.githubProfile || validateGitHubUrl(form.githubProfile);
    return (
      hasLinkedIn &&
      linkedInValid &&
      githubValid &&
      motivacionValid &&
      experienciaValid &&
      !saving
    );
  }, [form, applicant, profile, motivacionValid, experienciaValid, saving]);

  const canSave =
    !!form &&
    linkedInOk &&
    githubOk &&
    motivacionValid &&
    experienciaValid &&
    !saving;

  const setField = (k: keyof ProfileForm, v: string) =>
    form && setForm({ ...form, [k]: v });

  const handleSave = async () => {
    if (!profile || !form) return;
    try {
      setSaving(true);
      const dto = toUpdateDto(form);
      const updated = await applicantProfileApi.updateById(profile.id, dto);
      onSaved?.(updated);
      setIsEditing(false);
    } catch (e) {
      console.error("Error guardando perfil", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!applicant || !form) return;
    try {
      setSaving(true);

      const profileToCreate: CreateProfileData = {
        linkedInProfile: form.linkedInProfile,
      };

      if (form.githubProfile && form.githubProfile.trim()) {
        profileToCreate.githubProfile = form.githubProfile;
      }
      if (form.rolDeseado && form.rolDeseado.trim()) {
        profileToCreate.rolDeseado = form.rolDeseado;
      }
      if (form.motivacion && form.motivacion.trim()) {
        profileToCreate.motivacion = form.motivacion;
      }
      if (form.experiencia && form.experiencia.trim()) {
        profileToCreate.experiencia = form.experiencia;
      }
      if (form.disponibilidad && form.disponibilidad.trim()) {
        profileToCreate.disponibilidad = form.disponibilidad;
      }
      if (form.bootcamp && form.bootcamp.trim()) {
        profileToCreate.bootcamp = form.bootcamp;
      }

      const created = await applicantProfileApi.create(
        applicant.id,
        profileToCreate
      );
      onSaved?.(created);
      onClose();
    } catch (e) {
      console.error("Error creando perfil", e);
    } finally {
      setSaving(false);
    }
  };

  const openUrl = (url?: string) =>
    url && window.open(url, "_blank", "noopener,noreferrer");

  if (!applicant) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`Perfil de ${applicant.firstName} ${applicant.lastName}`}
      size="xl"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-neutral-600 font-medium">Cargando perfil...</p>
          </div>
        </div>
      ) : !profile ? (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {applicant.firstName.charAt(0)}
                {applicant.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {applicant.firstName} {applicant.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{applicant.mentor ? "Mentor" : "Colaboradora"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {getLanguageDisplayName(
                        (applicant.language as Language) ?? Language.ES
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{applicant.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Crear Perfil Profesional
            </h3>
            <p className="text-neutral-600 mb-6">
              Este applicant aún no ha completado su perfil profesional.
              Completa los campos a continuación para crear el perfil.
            </p>
          </div>

          {form && (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-neutral-900">
                        Rol Deseado
                      </h4>
                    </div>
                    <label htmlFor="rolDeseado-select" className="sr-only">
                      Rol Deseado
                    </label>
                    <select
                      id="rolDeseado-select"
                      value={form.rolDeseado}
                      onChange={(e) => setField("rolDeseado", e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">— Selecciona —</option>
                      {DESIRED_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-neutral-900">
                        Disponibilidad
                      </h4>
                    </div>
                    <label htmlFor="disponibilidad-select" className="sr-only">
                      Disponibilidad
                    </label>
                    <select
                      id="disponibilidad-select"
                      value={form.disponibilidad}
                      onChange={(e) =>
                        setField("disponibilidad", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="">— Selecciona —</option>
                      {(Object.values(Disponibilidad) as string[]).map((v) => (
                        <option key={v} value={v}>
                          {getDisponibilidadDisplayName(v as Disponibilidad)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-neutral-900">
                        Bootcamp
                      </h4>
                    </div>
                    <input
                      value={form.bootcamp}
                      onChange={(e) => setField("bootcamp", e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Nombre del bootcamp"
                    />
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <ExternalLink className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-neutral-900">
                        Enlaces Profesionales
                      </h4>
                    </div>

                    <div className="space-y-2 mb-4">
                      <label className="block text-sm font-semibold text-neutral-700">
                        LinkedIn <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.linkedInProfile}
                        onChange={(e) =>
                          setField("linkedInProfile", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          linkedInOk
                            ? "border-neutral-300 focus:ring-purple-400"
                            : "border-red-300 focus:ring-red-400"
                        }`}
                        placeholder="https://www.linkedin.com/in/usuario"
                        required
                      />
                      {!linkedInOk && (
                        <p className="text-xs text-red-600">
                          URL de LinkedIn no válida.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-neutral-700">
                        GitHub
                      </label>
                      <input
                        value={form.githubProfile}
                        onChange={(e) =>
                          setField("githubProfile", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          githubOk
                            ? "border-neutral-300 focus:ring-purple-400"
                            : "border-red-300 focus:ring-red-400"
                        }`}
                        placeholder="https://github.com/usuario"
                      />
                      {!githubOk && (
                        <p className="text-xs text-red-600">
                          URL de GitHub no válida.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-neutral-900">
                        Motivación
                      </h4>
                    </div>
                    <textarea
                      value={form.motivacion}
                      onChange={(e) => setField("motivacion", e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[120px]"
                      placeholder="¿Qué te motiva?"
                      maxLength={MOTIVACION_MAX_LENGTH}
                    />
                    <CharacterCounter
                      current={form.motivacion.length}
                      max={MOTIVACION_MAX_LENGTH}
                      label="Motivación"
                    />
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-neutral-900">
                        Experiencia
                      </h4>
                    </div>
                    <textarea
                      value={form.experiencia}
                      onChange={(e) => setField("experiencia", e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[120px]"
                      placeholder="Resumen de experiencia"
                      maxLength={EXPERIENCIA_MAX_LENGTH}
                    />
                    <CharacterCounter
                      current={form.experiencia.length}
                      max={EXPERIENCIA_MAX_LENGTH}
                      label="Experiencia"
                    />
                  </div>
                </div>
              </div>

              {applicant.roles.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-neutral-900">
                      Roles Profesionales Registrados
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {applicant.roles.map((role, idx) => (
                      <span
                        key={`${role}-${idx}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-purple-100 text-purple-800 border border-purple-200"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 transition-all duration-200"
                  type="button"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={!canCreate}
                >
                  {saving ? "Creando..." : "Crear Perfil"}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {applicant.firstName.charAt(0)}
                {applicant.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {applicant.firstName} {applicant.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{applicant.mentor ? "Mentor" : "Colaboradora"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {getLanguageDisplayName(
                        (applicant.language as Language) ?? Language.ES
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{applicant.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {form && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-neutral-900">
                      Rol Deseado
                    </h4>
                  </div>
                  {isEditing ? (
                    <>
                      <label htmlFor="rolDeseado-select" className="sr-only">
                        Rol Deseado
                      </label>
                      <select
                        id="rolDeseado-select"
                        value={form.rolDeseado}
                        onChange={(e) => setField("rolDeseado", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="">— Selecciona —</option>
                        {DESIRED_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <p className="text-neutral-700">
                      {profile.rolDeseado || "—"}
                    </p>
                  )}
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-neutral-900">
                      Disponibilidad
                    </h4>
                  </div>
                  {isEditing ? (
                    <>
                      <label
                        htmlFor="disponibilidad-select"
                        className="sr-only"
                      >
                        Disponibilidad
                      </label>
                      <select
                        id="disponibilidad-select"
                        value={form.disponibilidad}
                        onChange={(e) =>
                          setField("disponibilidad", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="">— Selecciona —</option>
                        {(Object.values(Disponibilidad) as string[]).map(
                          (v) => (
                            <option key={v} value={v}>
                              {getDisponibilidadDisplayName(
                                v as Disponibilidad
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                      {profile.disponibilidad
                        ? getDisponibilidadDisplayName(
                            profile.disponibilidad as Disponibilidad
                          )
                        : "—"}
                    </span>
                  )}
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-neutral-900">Bootcamp</h4>
                  </div>
                  {isEditing ? (
                    <input
                      value={form.bootcamp}
                      onChange={(e) => setField("bootcamp", e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Nombre del bootcamp"
                    />
                  ) : (
                    <p className="text-neutral-700">
                      {profile.bootcamp || "—"}
                    </p>
                  )}
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ExternalLink className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-semibold text-neutral-900">
                      Enlaces Profesionales
                    </h4>
                  </div>

                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-semibold text-neutral-700">
                      LinkedIn
                    </label>
                    {isEditing ? (
                      <input
                        value={form.linkedInProfile}
                        onChange={(e) =>
                          setField("linkedInProfile", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          linkedInOk
                            ? "border-neutral-300 focus:ring-purple-400"
                            : "border-red-300 focus:ring-red-400"
                        }`}
                        placeholder="https://www.linkedin.com/in/usuario"
                      />
                    ) : profile.linkedInProfile ? (
                      <button
                        onClick={() => openUrl(profile.linkedInProfile)}
                        className="flex items-center gap-3 w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 group text-left"
                      >
                        <Linkedin className="h-5 w-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium text-blue-900">
                            LinkedIn
                          </div>
                          <div className="text-sm text-blue-600 truncate group-hover:underline">
                            {profile.linkedInProfile}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-blue-600 ml-auto" />
                      </button>
                    ) : (
                      <p className="text-neutral-500">—</p>
                    )}
                    {!linkedInOk && (
                      <p className="text-xs text-red-600">
                        URL de LinkedIn no válida.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-neutral-700">
                      GitHub
                    </label>
                    {isEditing ? (
                      <input
                        value={form.githubProfile}
                        onChange={(e) =>
                          setField("githubProfile", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          githubOk
                            ? "border-neutral-300 focus:ring-purple-400"
                            : "border-red-300 focus:ring-red-400"
                        }`}
                        placeholder="https://github.com/usuario"
                      />
                    ) : profile.githubProfile ? (
                      <button
                        onClick={() => openUrl(profile.githubProfile)}
                        className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors duration-200 group text-left"
                      >
                        <Github className="h-5 w-5 text-gray-700" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            GitHub
                          </div>
                          <div className="text-sm text-gray-600 truncate group-hover:underline">
                            {profile.githubProfile}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-600 ml-auto" />
                      </button>
                    ) : (
                      <p className="text-neutral-500">—</p>
                    )}
                    {!githubOk && (
                      <p className="text-xs text-red-600">
                        URL de GitHub no válida.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-neutral-900">
                      Motivación
                    </h4>
                  </div>
                  {isEditing ? (
                    <>
                      <textarea
                        value={form.motivacion}
                        onChange={(e) => setField("motivacion", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[120px]"
                        placeholder="¿Qué te motiva?"
                        maxLength={MOTIVACION_MAX_LENGTH}
                      />
                      <CharacterCounter
                        current={form.motivacion.length}
                        max={MOTIVACION_MAX_LENGTH}
                        label="Motivación"
                      />
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                        {profile.motivacion || "—"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-neutral-900">
                      Experiencia
                    </h4>
                  </div>
                  {isEditing ? (
                    <>
                      <textarea
                        value={form.experiencia}
                        onChange={(e) =>
                          setField("experiencia", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[120px]"
                        placeholder="Resumen de experiencia"
                        maxLength={EXPERIENCIA_MAX_LENGTH}
                      />
                      <CharacterCounter
                        current={form.experiencia.length}
                        max={EXPERIENCIA_MAX_LENGTH}
                        label="Experiencia"
                      />
                    </>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                        {profile.experiencia || "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {applicant.roles.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-neutral-900">
                  Roles Profesionales Registrados
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {applicant.roles.map((role, idx) => (
                  <span
                    key={`${role}-${idx}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-purple-100 text-purple-800 border border-purple-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setForm(toForm(profile));
                  }}
                  className="px-6 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 transition-all duration-200"
                  type="button"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  disabled={!canSave}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                type="button"
              >
                Editar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 transition-all duration-200"
              type="button"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </ModalBase>
  );
}
