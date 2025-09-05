// src/features/applicants/api/applicants.api.ts

// ==== Helpers ====
async function parse<T = unknown>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text() as unknown as T;
}

// ==== Types ====
export interface CreateApplicantRequest {
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  roles: string[];
  language?: string;
}

export interface UpdateApplicantRequest {
  firstName?: string;
  lastName?: string;
  mentor?: boolean;
  roles?: string[];
  language?: string;
}

// ==== CRUD Applicants ====

// CREATE
export async function createApplicant(data: CreateApplicantRequest) {
  const res = await fetch(`/api/applicants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return parse(res);
}

// READ (get by id)
export async function getApplicantById(id: number) {
  const res = await fetch(`/api/applicants/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return parse(res);
}

// UPDATE (by id)
export async function updateApplicantById(
  id: number,
  data: UpdateApplicantRequest
) {
  const res = await fetch(`/api/applicants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return parse(res);
}

// DELETE (by id)
export async function deleteApplicantById(id: number) {
  const res = await fetch(`/api/applicants/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
}

// RESTORE (by email)
export async function restoreApplicant(email: string) {
  const res = await fetch(
    `/api/applicants/restore/email/${encodeURIComponent(email)}`,
    {
      method: "PUT",
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return parse(res);
}


