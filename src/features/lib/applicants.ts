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

  const isDev = process.env.NODE_ENV !== "production";
  const base = isDev ? "/api/applicants" : `${process.env.NEXT_PUBLIC_API_URL}/api/applicants`;

  return `${base}${path}`;
}


async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(endpoint);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Intenta parsear el cuerpo (texto o JSON)
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

  // Si el backend no envía JSON, devolvemos vacío tipado
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

  // Este endpoint existe en ApplicantController (no es el /admin con BasicAuth)
  getExpiredDeleted: async (): Promise<Applicant[]> => {
    return fetchApi("admin/expired-deleted");
  },

  getDeleted: async (): Promise<ApplicantListItemDto[]> => {
    return fetchApi("deleted");
  },

  // STATS - Obtener estadísticas básicas
  getStats: async (): Promise<ApplicantStatsDto> => {
    return fetchApi("stats");
  },

  // STATS - Obtener estadísticas por idioma
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
    // Este endpoint también está en ApplicantController como /api/applicants/admin/cleanup-expired
    return fetchApi("admin/cleanup-expired", {
      method: "DELETE",
    });
  },
};
