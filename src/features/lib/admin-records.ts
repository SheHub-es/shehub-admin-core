import {
  AdminRecordsCreateDTO,
  AdminRecordsDetailDTO,
  AdminRecordsListItemDTO,
  AdminRecordsPatchDTO,
  AdminRecordsUpdateDTO,
  AdminRecordsMultiOptionDTO,
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

const PROJECT_LINKS: Record<string, string> = {
  "New Data Infra":
    "https://www.notion.so/New-Data-Infra-1c3c1a84207a809e91e9eb0829da5898?pvs=21",
  "Teaser Page":
    "https://www.notion.so/Teaser-Page-1b3c1a84207a806a8afae7129bf79163?pvs=21",
  "Visitor's Website":
    "https://www.notion.so/Visitor-s-Website-1c3c1a84207a8053ae2af9076e2d30ff?pvs=21",
  "Design System":
    "https://www.notion.so/Design-System-1eac1a84207a8029ab09e52ec4e9b306?pvs=21",
  "Data Infra": "https://github.com/SheHub-es/shehub-core",
};

export const projectsToMultiOptionString = (projects: string[]): string => {
  if (!projects || projects.length === 0) return "";

  return projects
    .map((project) => {
      const link = PROJECT_LINKS[project];
      return link ? `${project} | ${link}` : project;
    })
    .join(", ");
};

export const accessToMultiOptionString = (accessList: string[]): string => {
  if (!accessList || accessList.length === 0) return "";
  return accessList.join(", ");
};

export const multiOptionStringToArray = (str?: string): string[] => {
  if (!str || str.trim() === "") return [];

  return str
    .split(",")
    .map((item) => {
      const trimmed = item.trim();
      const pipeIndex = trimmed.indexOf(" | ");
      return pipeIndex > -1 ? trimmed.substring(0, pipeIndex).trim() : trimmed;
    })
    .filter((item) => item.length > 0);
};

function buildUrl(endpoint: string) {
  const clean = endpoint.replace(/^\/+/, "");
  const path = clean ? `/${clean}` : "";

  if (process.env.NODE_ENV === "development") {
    const url = `/admin-records${path}`;

    return url;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada");
  }
  const url = `${apiUrl}/admin-records${path}`;
  return url;
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

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = isJson ? await response.json() : await response.text();
    } catch {}

    let message: string = `HTTP ${response.status}: ${response.statusText}`;
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

    console.error("❌ API Error Details:", {
      status: response.status,
      statusText: response.statusText,
      url,
      payload,
      method: options.method || "GET",
    });

    throw new ApiClientError(response.status, message, payload);
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (isJson) {
    return response.json();
  }

  return {} as T;
}

export const adminRecordsApi = {
  create: async (
    dto: AdminRecordsCreateDTO
  ): Promise<AdminRecordsDetailDTO> => {
    const formattedDto = {
      ...dto,
      projects: projectsToMultiOptionString(
        dto.projects
          ? dto.projects
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          : []
      ),
      accessTo: accessToMultiOptionString(
        dto.accessTo
          ? dto.accessTo
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : []
      ),
    };

    const result = await fetchApi<AdminRecordsDetailDTO>("", {
      method: "POST",
      body: JSON.stringify(formattedDto),
    });

    if (result.projects) {
      result.projects = result.projects.map((p) => ({
        title: p.title,
        ...(p.link && { link: p.link }),
      }));
    }
    if (result.accessTo) {
      result.accessTo = result.accessTo.map((a) => ({
        title: a.title,
        ...(a.link && { link: a.link }),
      }));
    }

    return result;
  },

  getAllActive: async (): Promise<AdminRecordsListItemDTO[]> => {
    const results = await fetchApi<AdminRecordsListItemDTO[]>("active");

    return results.map((record) => ({
      ...record,
      projects: record.projects || [],
      accessTo: record.accessTo || [],
    }));
  },

  getById: async (id: number): Promise<AdminRecordsDetailDTO> => {
    const result = await fetchApi<AdminRecordsDetailDTO>(`${id}`);

    return {
      ...result,
      projects: result.projects || [],
      accessTo: result.accessTo || [],
    };
  },

  getByApplicantId: async (
    applicantId: number
  ): Promise<AdminRecordsDetailDTO> => {
    const result = await fetchApi<AdminRecordsDetailDTO>(
      `applicant/${applicantId}`
    );

    return {
      ...result,
      projects: result.projects || [],
      accessTo: result.accessTo || [],
    };
  },

  updatePartial: async (
    id: number,
    dto: AdminRecordsPatchDTO
  ): Promise<AdminRecordsDetailDTO> => {
    const formattedDto = {
      ...dto,
      projects: dto.projects
        ? projectsToMultiOptionString(
            dto.projects
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          )
        : undefined,
      accessTo: dto.accessTo
        ? accessToMultiOptionString(
            dto.accessTo
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          )
        : undefined,
    };

    const result = await fetchApi<AdminRecordsDetailDTO>(`${id}`, {
      method: "PATCH",
      body: JSON.stringify(formattedDto),
    });

    return {
      ...result,
      projects: result.projects || [],
      accessTo: result.accessTo || [],
    };
  },

  updateComplete: async (
    id: number,
    dto: AdminRecordsUpdateDTO
  ): Promise<AdminRecordsDetailDTO> => {
    const formattedDto = {
      ...dto,
      projects: dto.projects
        ? projectsToMultiOptionString(
            dto.projects
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          )
        : undefined,
      accessTo: dto.accessTo
        ? accessToMultiOptionString(
            dto.accessTo
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          )
        : undefined,
    };

    const result = await fetchApi<AdminRecordsDetailDTO>(`${id}`, {
      method: "PUT",
      body: JSON.stringify(formattedDto),
    });

    return {
      ...result,
      projects: result.projects || [],
      accessTo: result.accessTo || [],
    };
  },

  deleteById: async (id: number): Promise<void> => {
    return fetchApi(`${id}`, {
      method: "DELETE",
    });
  },

  hasAdminRecord: async (applicantId: number): Promise<boolean> => {
    try {
      await adminRecordsApi.getByApplicantId(applicantId);
      return true;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        return false;
      }
      throw error;
    }
  },

  getActiveCount: async (): Promise<number> => {
    const activeRecords = await adminRecordsApi.getAllActive();
    return activeRecords.length;
  },
};
