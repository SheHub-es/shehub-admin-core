// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL || ''; // '' si usas rewrites de Next

export function basicAuthHeader(email: string, password: string) {
  // Asume entorno cliente (btoa disponible). No usar en Server Components.
  return { Authorization: `Basic ${btoa(`${email}:${password}`)}` };
}

async function parse<T = unknown>(res: Response): Promise<T | string> {
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

export async function getTotalApplicants(email: string, password: string) {
  const res = await fetch(`${BASE}/applicants/count`, {
    headers: basicAuthHeader(email, password),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMentorsCount(email: string, password: string) {
  const res = await fetch(`${BASE}/applicants/count/mentor/true`, {
    headers: basicAuthHeader(email, password),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getApplicantStats(email: string, password: string) {
  console.log('🔄 Iniciando petición de estadísticas...');
  console.log('📍 URL base:', BASE);
  console.log('🔗 URL completa:', `${BASE}/applicants/stats`);
  
  // Solicitar estadísticas directamente
  console.log('📊 Solicitando estadísticas del servidor...');
  const res = await fetch(`${BASE}/applicants/stats`, {
    headers: basicAuthHeader(email, password),
    cache: 'no-store',
  });
  
  console.log('📈 Respuesta del servidor stats:', {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    url: res.url
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log('❌ Error del servidor stats:', errorText);
    throw new Error(`Server stats error: ${res.status} ${res.statusText} - ${errorText}`);
  }

  // Parsear respuesta
  const data = await res.json();
  console.log('✅ Estadísticas recibidas del servidor:', data);
  return data;
}
