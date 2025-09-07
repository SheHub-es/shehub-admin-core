
// export function basicAuthHeader(email: string, password: string) {
//   return { Authorization: `Basic ${btoa(`${email}:${password}`)}` };
// }

// function getAuthHeader() {
//   const username = process.env.NEXT_PUBLIC_ADMIN_USER!;
//   const password = process.env.NEXT_PUBLIC_ADMIN_PASS!;
//   return "Basic " + btoa(username + ":" + password);
// }

// export async function getAdminApplicants() {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/applicants`, {
//     headers: {
//       Authorization: getAuthHeader()
//     }
//   });

//   if (!res.ok) throw new Error("Error fetching admin applicants");
//   return res.json();
// }


// async function parse<T = unknown>(res: Response): Promise<T | string> {
//   const ct = res.headers.get('content-type') || '';
//   if (ct.includes('application/json')) return res.json();
//   return res.text();
// }


// export async function adminTest(email: string, password: string) {
//   const res = await fetch(`/admin/test`, {
//     headers: basicAuthHeader(email, password),
//     cache: 'no-store',
//   });
//   if (!res.ok) throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
//   return parse(res);
// }

// export async function getApplicants(
//   email: string,
//   password: string,
//   page = 0,
//   size = 10
// ) {
//   const res = await fetch(`/admin/applicants?page=${page}&size=${size}`, {
//     headers: basicAuthHeader(email, password),
//     cache: 'no-store',
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function getApplicantStats(
//   email: string,
//   password: string
// ): Promise<Record<string, unknown>> {
//   const res = await fetch(`/admin/applicants/stats`, {
//     headers: basicAuthHeader(email, password),
//     cache: 'no-store',
//   });
//   if (!res.ok) {
//     throw new Error(`Server stats error: ${res.status} ${await res.text()}`);
//   }
//   return res.json();
// }


// export async function getExpiredApplicants(email: string, password: string) {
//   const res = await fetch(`/admin/applicants/expired`, {
//     headers: basicAuthHeader(email, password),
//     cache: 'no-store',
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export async function cleanupExpiredApplicants(email: string, password: string) {
//   const res = await fetch(`/admin/applicants/cleanup`, {
//     method: 'DELETE',
//     headers: basicAuthHeader(email, password),
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

