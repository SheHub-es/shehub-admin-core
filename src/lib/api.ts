// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL || ''; // '' si usas rewrites de Next

export function basicAuthHeader(email: string, password: string) {
  // Asume entorno cliente (btoa disponible). No usar en Server Components.
  return { Authorization: `Basic ${btoa(`${email}:${password}`)}` };
}

async function parse<T = any>(res: Response): Promise<T | string> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function adminTest(email: string, password: string) {
  const res = await fetch(`${BASE}/admin/test`, {
    headers: basicAuthHeader(email, password),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
  return parse(res);
}

export async function getApplicants(
  email: string,
  password: string,
  page = 0,
  size = 10
) {
  const res = await fetch(`${BASE}/admin/applicants?page=${page}&size=${size}`, {
    headers: basicAuthHeader(email, password),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // aquí sí sabemos que es JSON (Page<>)
}
