export enum Language {
  ES = "ES",
  EN = "EN",
  CAT = "CAT",
  EN_GB = "EN_GB",
  EN_US = "EN_US",
}

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

export enum Disponibilidad {
  LT5 = "LT5",
  B5_10 = "B5_10",
  B10_15 = "B10_15",
  GT15 = "GT15",
}

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

export interface UpdateApplicantProfileDto {
  linkedInProfile?: string | undefined;
  githubProfile?: string | undefined;
  rolDeseado?: string | undefined;
  motivacion?: string | undefined;
  experiencia?: string | undefined;
  disponibilidad?: string | undefined;
  bootcamp?: string | undefined;
}

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

export const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return false;
  const linkedInRegex =
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;
  return linkedInRegex.test(url);
};

export const validateGitHubUrl = (url: string): boolean => {
  if (!url) return true;
  const githubRegex =
    /^https?:\/\/(www\.)?github\.com\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;
  return githubRegex.test(url);
};

export enum Status {
  AP = "AP", // "Assigned to a Project"
  NE = "NE", // "Not engaged"
  RO = "RO", // "Reached out"
  EG = "EG", // "Engaged"
  NN = "NN", // "To revisit – Not for now"
  CP = "CP", // "Completed Participation"
  BR = "BR", // "To be reached"
  CC = "CC", // "Canceled communications"
}

export enum Currently {
  PF = "PF", // "Proyecto freelance"
  LJ = "LJ", // "Actively looking for a job"
  UE = "UE", // "Unemployed"
  FB = "FB", // "Finishing bootcamp"
  FL = "FL", // "Freelancing"
  PT = "PT", // "Working part-time"
}

export const StatusDisplay: Record<Status, string> = {
  [Status.AP]: "Assigned to a Project",
  [Status.NE]: "Not engaged",
  [Status.RO]: "Reached out",
  [Status.EG]: "Engaged",
  [Status.NN]: "To revisit – Not for now",
  [Status.CP]: "Completed Participation",
  [Status.BR]: "To be reached",
  [Status.CC]: "Canceled communications",
};

export const CurrentlyDisplay: Record<Currently, string> = {
  [Currently.PF]: "Proyecto freelance",
  [Currently.LJ]: "Actively looking for a job",
  [Currently.UE]: "Unemployed",
  [Currently.FB]: "Finishing bootcamp",
  [Currently.FL]: "Freelancing",
  [Currently.PT]: "Working part-time",
};

export interface ApplicantRefDTO {
  id: Long;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface AdminRecordsMultiOptionDTO {
  title: string;
  link?: string;
}

export interface AdminRecordsCreateDTO {
  status: Status;
  projects?: string;
  currently?: Currently;
  ciudad?: string;
  accessTo?: string;
  orgNotes?: string;
  bookingLink?: string;
  portfolio?: string;
  oneToOneNotes?: string;
  projectInterview?: string;
  notas?: string;
  applicantId: Long;
  additionalAdmin1?: string;
  additionalAdmin2?: string;
  additionalAdmin3?: string;
  additionalAdmin4?: string;
  additionalAdmin5?: string;
  additionalJson?: Record<string, unknown>;
}

export interface AdminRecordsDetailDTO {
  id: Long;
  applicant?: ApplicantRefDTO;
  status?: Status;
  currently?: Currently;
  ciudad?: string;
  orgNotes?: string;
  bookingLink?: string;
  portfolio?: string;
  oneToOneNotes?: string;
  projectInterview?: string;
  notas?: string;
  projects?: AdminRecordsMultiOptionDTO[];
  accessTo?: AdminRecordsMultiOptionDTO[];
  additionalAdmin1?: string;
  additionalAdmin2?: string;
  additionalAdmin3?: string;
  additionalAdmin4?: string;
  additionalAdmin5?: string;
  additionalJson?: Record<string, unknown>;
}

export interface AdminRecordsListItemDTO {
  id: Long;
  applicant?: ApplicantRefDTO;
  status?: Status;
  projects?: AdminRecordsMultiOptionDTO[];
  currently?: Currently;
  ciudad?: string;
  accessTo?: AdminRecordsMultiOptionDTO[];
  portfolio?: string;
}

export interface AdminRecordsPatchDTO {
  status?: Status | undefined;
  projects?: string | undefined;
  currently?: Currently | undefined;
  ciudad?: string | undefined;
  accessTo?: string | undefined;
  orgNotes?: string | undefined;
  bookingLink?: string | undefined;
  portfolio?: string | undefined;
  oneToOneNotes?: string | undefined;
  projectInterview?: string | undefined;
  notas?: string | undefined;
  additionalAdmin1?: string | undefined;
  additionalAdmin2?: string | undefined;
  additionalAdmin3?: string | undefined;
  additionalAdmin4?: string | undefined;
  additionalAdmin5?: string | undefined;
  additionalJson?: Record<string, unknown> | undefined;
}

export interface AdminRecordsUpdateDTO {
  status?: Status;
  projects?: string;
  currently?: Currently;
  ciudad?: string;
  accessTo?: string;
  orgNotes?: string;
  bookingLink?: string;
  portfolio?: string;
  oneToOneNotes?: string;
  projectInterview?: string;
  notas?: string;
  additionalAdmin1?: string;
  additionalAdmin2?: string;
  additionalAdmin3?: string;
  additionalAdmin4?: string;
  additionalAdmin5?: string;
  additionalJson?: Record<string, unknown>;
}

export type Long = number;

export const ProjectsOptions = [
  "New Data Infra",
  "Teaser Page",
  "Visitor's Website",
  "Design System",
  "Data Infra",
];

export const AccessToOptions = ["Notion", "Discord", "Figma", "GitHub"];

export const csvToArray = (csv?: string): string[] => {
  if (!csv || csv.trim() === "") return [];
  return csv
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const arrayToCsv = (array: string[]): string => {
  return array.join(",");
};
