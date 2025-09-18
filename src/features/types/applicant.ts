// types/applicant.ts

export enum Language {
  ES = "ES",
  EN = "EN",
  CAT = "CAT",
  EN_GB = "EN_GB",
  EN_US = "EN_US",
}

// Helper function to get display names
export const getLanguageDisplayName = (language: Language): string => {
  switch (language) {
    case Language.ES:
      return "Español";
    case Language.EN:
      return "English";
    case Language.CAT:
      return "Catalán";
    case Language.EN_GB:
      return "English (UK)";
    case Language.EN_US:
      return "English (US)";
    default:
      return "Español";
  }
};

export interface Applicant {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language: Language | string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  userId?: number | null;
  deleted?: boolean;
  displayRole?: string;
  registeredUser?: boolean;
}

export interface CreateApplicantDto {
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language?: string;
  roles: string[];
}

export interface UpdateApplicantDto {
  firstName?: string;
  lastName?: string;
  mentor?: boolean;
  language?: Language;
  roles?: string[];
}

export interface ApplicantListItemDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language: Language | string;
  roles: string[];
  displayRole?: string;
  deleted?: boolean;
  deletedAt?: string | null;
  timestamp?: string;
}

export interface ApplicantDetailDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  language: Language | string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  timestamp?: string;
  userId?: number;
}

export interface EmailExistsDto {
  email: string;
  exists: boolean;
  isDeleted: boolean;
}

export interface ApplicantStatsDto {
  total: number;
  mentors: number;
  colaboradoras: number;
  pending: number;
  registered: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

export interface ApplicantExtendedStatsDto extends ApplicantStatsDto {
  byLanguage: Record<string, number>;
  totalActive: number;
  totalDeleted: number;
  avgRolesPerApplicant: number;
  topRoles: Array<{ role: string; count: number }>;
}

// ApplicantProfile types and interfaces

export enum Disponibilidad {
  LT5 = "LT5",
  B5_10 = "B5_10",
  B10_15 = "B10_15",
  GT15 = "GT15",
}

// Helper function para obtener nombres legibles de disponibilidad
export const getDisponibilidadDisplayName = (
  disponibilidad: Disponibilidad
): string => {
  switch (disponibilidad) {
    case Disponibilidad.LT5:
      return "Menos de 5 horas";
    case Disponibilidad.B5_10:
      return "Entre 5-10 horas";
    case Disponibilidad.B10_15:
      return "Entre 10-15 horas";
    case Disponibilidad.GT15:
      return "Más de 15 horas";
    default:
      return "No especificado";
  }
};

// Roles deseados predefinidos
export const DESIRED_ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "UX/UI Designer",
  "Product Manager",
  "Product Marketing Manager",
  "Data Analyst",
  "QA",
  "Project Manager",
  "Otro",
] as const;

export type DesiredRole = (typeof DESIRED_ROLES)[number];

export interface ApplicantProfile {
  id: number;
  linkedInProfile: string;
  githubProfile?: string;
  rolDeseado?: string;
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: Disponibilidad;
  bootcamp?: string;
  extraField1?: string;
  extraField2?: string;
  extraField3?: string;
  extraField4?: string;
  extraField5?: string;
  additionalData?: Record<string, unknown>;
  applicantId?: number;
}

// DTO para crear perfil
export interface CreateApplicantProfileDto {
  linkedInProfile: string;
  githubProfile?: string;
  rolDeseado?: string;
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
  bootcamp?: string;
  applicantId: number;
}

// DTO para actualizar perfil
export interface UpdateApplicantProfileDto {
  linkedInProfile?: string | undefined;
  githubProfile?: string | undefined;
  rolDeseado?: string | undefined;
  motivacion?: string | undefined;
  experiencia?: string | undefined;
  disponibilidad?: string | undefined;
  bootcamp?: string | undefined;
}

// DTO de respuesta del backend
export interface ApplicantProfileResponseDto {
  id: number;
  linkedInProfile: string;
  githubProfile?: string;
  rolDeseado?: string;
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
  bootcamp?: string;
  applicantId: number;
}

// Formulario para editar perfil (frontend)
export interface ApplicantProfileFormData {
  linkedInProfile: string;
  githubProfile: string;
  rolDeseado: string;
  motivacion: string;
  experiencia: string;
  disponibilidad: Disponibilidad | "";
  bootcamp: string;
  extraField1: string;
  extraField2: string;
  extraField3: string;
  extraField4: string;
  extraField5: string;
  additionalData: Record<string, unknown>;
}

// Estado inicial del formulario
export const initialApplicantProfileFormData: ApplicantProfileFormData = {
  linkedInProfile: "",
  githubProfile: "",
  rolDeseado: "",
  motivacion: "",
  experiencia: "",
  disponibilidad: "",
  bootcamp: "",
  extraField1: "",
  extraField2: "",
  extraField3: "",
  extraField4: "",
  extraField5: "",
  additionalData: {},
};

// Errores de validación del perfil
export interface ApplicantProfileValidationErrors {
  linkedInProfile?: string;
  githubProfile?: string;
  rolDeseado?: string;
  motivacion?: string;
  experiencia?: string;
  disponibilidad?: string;
  bootcamp?: string;
  extraField1?: string;
  extraField2?: string;
  extraField3?: string;
  extraField4?: string;
  extraField5?: string;
}

// Utilidad para convertir FormData a DTO - CORREGIDA
export const formDataToUpdateDto = (
  formData: ApplicantProfileFormData
): UpdateApplicantProfileDto => ({
  linkedInProfile: formData.linkedInProfile || undefined,
  githubProfile: formData.githubProfile || undefined,
  rolDeseado: formData.rolDeseado || undefined,
  motivacion: formData.motivacion || undefined,
  experiencia: formData.experiencia || undefined,
  disponibilidad: formData.disponibilidad || undefined,
  bootcamp: formData.bootcamp || undefined,
});

// Utilidad para convertir respuesta del backend a FormData
export const profileToFormData = (
  profile: ApplicantProfile
): ApplicantProfileFormData => ({
  linkedInProfile: profile.linkedInProfile || "",
  githubProfile: profile.githubProfile || "",
  rolDeseado: profile.rolDeseado || "",
  motivacion: profile.motivacion || "",
  experiencia: profile.experiencia || "",
  disponibilidad: (profile.disponibilidad as Disponibilidad) || "",
  bootcamp: profile.bootcamp || "",
  extraField1: profile.extraField1 || "",
  extraField2: profile.extraField2 || "",
  extraField3: profile.extraField3 || "",
  extraField4: profile.extraField4 || "",
  extraField5: profile.extraField5 || "",
  additionalData: profile.additionalData || {},
});

// Validador simple para LinkedIn URL
export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return false;
  const linkedInRegex =
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;
  return linkedInRegex.test(url);
};

// Validador simple para GitHub URL
export const validateGitHubUrl = (url: string): boolean => {
  if (!url) return true;
  const githubRegex =
    /^https?:\/\/(www\.)?github\.com\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;
  return githubRegex.test(url);
};
