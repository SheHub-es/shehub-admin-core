// lib/api/applicants.ts

import {
  Applicant,
  ApplicantDetailDto,
  ApplicantListItemDto,
  ApplicantStatsDto,
  CreateApplicantDto,
  EmailExistsDto,
  Language,
  PaginatedResponse,
  UpdateApplicantDto,
  ApplicantProfile,
  UpdateApplicantProfileDto,
  CreateApplicantProfileDto,
} from "../types/applicant";

export class ApiClientError extends Error {
  status: number;
  detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail;
  }
}

function buildUrl(endpoint: string) {
  const clean = endpoint.replace(/^\/+/, "");
  const path = clean ? `/${clean}` : "";

  if (process.env.NODE_ENV === "development") {
    const url = `/api/applicants${path}`;
    console.log("🔵 DEV URL:", url);
    return url;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada");
  }
  const url = `${apiUrl}/api/applicants${path}`;
  console.log("🟢 PROD URL:", url);
  return url;
  return `${apiUrl}/api/applicants${path}`;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint);

  console.log("🚀 FETCH REQUEST:", {
    url,
    method: options.method || "GET",
    body: options.body,
    headers: options.headers,
  });

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  console.log("📡 FETCH RESPONSE:", {
    status: response.status,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries()),
  });
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = isJson ? await response.json() : await response.text();
    } catch {
      // Ignorar errores de parseo
    }

    let message: string = "Network error";
    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message?: unknown }).message === "string"
    ) {
      message = (payload as { message: string }).message;
    } else if (typeof payload === "string") {
      message = payload;
    }

    throw new ApiClientError(response.status, message, payload);
  }

  // 204 o sin cuerpo
  if (response.status === 204) {
    return {} as T;
  }

  if (isJson) {
    return response.json();
  }

  return {} as T;
}

export const applicantApi = {
  // CREATE
  create: async (dto: CreateApplicantDto): Promise<Applicant> => {
    return fetchApi("", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  // READ
  getAll: async (): Promise<ApplicantListItemDto[]> => {
    return fetchApi("");
  },

  getPaginated: async (
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<Applicant>> => {
    return fetchApi(`paginated?page=${page}&size=${size}`);
  },

  getById: async (id: number): Promise<ApplicantDetailDto> => {
    return fetchApi(`${id}`);
  },

  getByEmail: async (email: string): Promise<Applicant> => {
    return fetchApi(`email/${encodeURIComponent(email)}`);
  },

  getByLanguage: async (language: Language | string): Promise<Applicant[]> => {
    return fetchApi(`language/${encodeURIComponent(String(language))}`);
  },

  getByMentor: async (mentor: boolean): Promise<Applicant[]> => {
    return fetchApi(`mentor/${mentor}`);
  },

  getPending: async (): Promise<Applicant[]> => {
    return fetchApi("pending");
  },

  getAvailableRoles: async (): Promise<string[]> => {
    return fetchApi("roles/available");
  },

  checkEmailExists: async (email: string): Promise<EmailExistsDto> => {
    return fetchApi(`exists?email=${encodeURIComponent(email)}`);
  },

  getCount: async (): Promise<number> => {
    return fetchApi("count");
  },

  getCountByLanguage: async (language: Language | string): Promise<number> => {
    return fetchApi(`count/language/${encodeURIComponent(String(language))}`);
  },

  getCountByMentor: async (mentor: boolean): Promise<number> => {
    return fetchApi(`count/mentor/${mentor}`);
  },

  getExpiredDeleted: async (): Promise<Applicant[]> => {
    return fetchApi("admin/expired-deleted");
  },

  getDeleted: async (): Promise<ApplicantListItemDto[]> => {
    return fetchApi("deleted");
  },

  getStats: async (): Promise<ApplicantStatsDto> => {
    return fetchApi("stats");
  },

  getStatsByLanguage: async (): Promise<Record<string, number>> => {
    const languages = Object.values(Language);
    const stats: Record<string, number> = {};

    await Promise.all(
      languages.map(async (lang) => {
        const count = await applicantApi.getCountByLanguage(lang);
        stats[lang] = count;
      })
    );

    return stats;
  },

  // UPDATE
  updateById: async (
    id: number,
    dto: UpdateApplicantDto
  ): Promise<Applicant> => {
    return fetchApi(`${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  updateByEmail: async (
    email: string,
    dto: UpdateApplicantDto
  ): Promise<Applicant> => {
    return fetchApi(`email/${encodeURIComponent(email)}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  restore: async (email: string): Promise<Applicant> => {
    return fetchApi(`restore/email/${encodeURIComponent(email)}`, {
      method: "PUT",
    });
  },

  convertToUser: async (id: number, userId: number): Promise<Applicant> => {
    return fetchApi(`${id}/convert-to-user?userId=${userId}`, {
      method: "PUT",
    });
  },

  // DELETE
  deleteByEmail: async (email: string): Promise<void> => {
    return fetchApi(`email/${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
  },

  deleteById: async (id: number): Promise<void> => {
    return fetchApi(`${id}`, {
      method: "DELETE",
    });
  },

  cleanupExpired: async (): Promise<number> => {
    return fetchApi("admin/cleanup-expired", {
      method: "DELETE",
    });
  },
};

export const applicantProfileApi = {
  getByApplicantId: async (
    applicantId: number
  ): Promise<ApplicantProfile | null> => {
    try {
      const response = await fetch(buildUrl(`${applicantId}/profile`), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        let message: string = "Network error";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {}
        throw new ApiClientError(response.status, message);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        500,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  },

  create: async (
    applicantId: number,
    profileData: Omit<CreateApplicantProfileDto, "applicantId">
  ): Promise<ApplicantProfile> => {
    try {
      const response = await fetch(buildUrl(`${applicantId}/profile`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileData,
          applicantId,
        }),
      });

      if (!response.ok) {
        let message: string = "Network error";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // Si no puede parsear el error
        }
        throw new ApiClientError(response.status, message);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        500,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  },

  // Actualizar perfil por profile ID
  updateById: async (
    profileId: number,
    profileData: UpdateApplicantProfileDto
  ): Promise<ApplicantProfile> => {
    try {
      const cleanData: UpdateApplicantProfileDto = {};

      Object.keys(profileData).forEach((key) => {
        const typedKey = key as keyof UpdateApplicantProfileDto;
        const value = profileData[typedKey];
        if (value !== undefined && value !== "") {
          cleanData[typedKey] = value;
        }
      });

      const response = await fetch(buildUrl(`profile/${profileId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        let message: string = "Network error";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // Si no puede parsear el error
        }
        throw new ApiClientError(response.status, message);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        500,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  },

  // Eliminar perfil por profile ID (aunque no lo uses en el UI)
  deleteById: async (profileId: number): Promise<void> => {
    try {
      const response = await fetch(buildUrl(`profile/${profileId}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let message: string = "Network error";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // Si no puede parsear el error
        }
        throw new ApiClientError(response.status, message);
      }

      // DELETE no devuelve contenido
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        500,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  },

  // Verificar si un applicant tiene perfil
  hasProfile: async (applicantId: number): Promise<boolean> => {
    try {
      const profile = await applicantProfileApi.getByApplicantId(applicantId);
      return profile !== null;
    } catch (error) {
      // Si hay error 404, significa que no tiene perfil
      if (error instanceof ApiClientError && error.status === 404) {
        return false;
      }

      throw error;
    }
  },

  // adminRecordsLib.ts
  // Funciones utilitarias para convertir datos entre el frontend y el backend para AdminRecords

  import {
    AdminRecordsCreateDTO,
    AdminRecordsPatchDTO,
    AdminRecordsUpdateDTO,
  } from "@/types/adminRecordsTypes";

  // Convierte los datos del formulario a un DTO de creación
  export const formDataToCreateDto = (
    formData: Partial<AdminRecordsCreateDTO>
  ): AdminRecordsCreateDTO => ({
    status: formData.status || "NE",
    projects: formData.projects,
    currently: formData.currently,
    ciudad: formData.ciudad,
    accessTo: formData.accessTo,
    orgNotes: formData.orgNotes,
    bookingLink: formData.bookingLink,
    portfolio: formData.portfolio,
    oneToOneNotes: formData.oneToOneNotes,
    projectInterview: formData.projectInterview,
    notas: formData.notas,
    applicantId: formData.applicantId!,
    additionalAdmin1: formData.additionalAdmin1,
    additionalAdmin2: formData.additionalAdmin2,
    additionalAdmin3: formData.additionalAdmin3,
    additionalAdmin4: formData.additionalAdmin4,
    additionalAdmin5: formData.additionalAdmin5,
    additionalJson: formData.additionalJson || {},
  });

  // Convierte los datos del formulario a un DTO de actualización
  export const formDataToUpdateDto = (
    formData: Partial<AdminRecordsUpdateDTO>
  ): AdminRecordsUpdateDTO => ({
    status: formData.status,
    projects: formData.projects,
    currently: formData.currently,
    ciudad: formData.ciudad,
    accessTo: formData.accessTo,
    orgNotes: formData.orgNotes,
    bookingLink: formData.bookingLink,
    portfolio: formData.portfolio,
    oneToOneNotes: formData.oneToOneNotes,
    projectInterview: formData.projectInterview,
    notas: formData.notas,
    additionalAdmin1: formData.additionalAdmin1,
    additionalAdmin2: formData.additionalAdmin2,
    additionalAdmin3: formData.additionalAdmin3,
    additionalAdmin4: formData.additionalAdmin4,
    additionalAdmin5: formData.additionalAdmin5,
    additionalJson: formData.additionalJson || {},
  });

  // Convierte los datos del formulario a un DTO de patch
  export const formDataToPatchDto = (
    formData: Partial<AdminRecordsPatchDTO>
  ): AdminRecordsPatchDTO => ({
    status: formData.status,
    projects: formData.projects,
    currently: formData.currently,
    ciudad: formData.ciudad,
    accessTo: formData.accessTo,
    orgNotes: formData.orgNotes,
    bookingLink: formData.bookingLink,
    portfolio: formData.portfolio,
    oneToOneNotes: formData.oneToOneNotes,
    projectInterview: formData.projectInterview,
    notas: formData.notas,
    additionalAdmin1: formData.additionalAdmin1,
    additionalAdmin2: formData.additionalAdmin2,
    additionalAdmin3: formData.additionalAdmin3,
    additionalAdmin4: formData.additionalAdmin4,
    additionalAdmin5: formData.additionalAdmin5,
    additionalJson: formData.additionalJson || {},
  });

};
