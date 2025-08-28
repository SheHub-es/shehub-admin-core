'use client';
import { useEffect, useState } from 'react';
import { getApplicants } from '@/lib/api';

type Applicant = {
  id: string | number;
  email: string;
  createdAt: string;
};

export default function AdminPage() {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('demo_email') || '';
    const pass  = sessionStorage.getItem('demo_pass')  || '';
    if (!email || !pass) { setErr('No hay credenciales'); return; }
    getApplicants(email, pass, 0, 10)
      .then(d => setRows(d.content ?? []))
      .catch(e => setErr(String(e)));
  }, []);

  if (err) return <p style={{color:'red'}}>{err}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Applicants (demo)</h1>
      <table className="min-w-full border">
        <thead><tr><th className="border px-2 py-1">ID</th><th className="border px-2 py-1">Email</th><th className="border px-2 py-1">Created</th></tr></thead>
        <tbody>{rows.map((r: Applicant)=>(
          <tr key={r.id}>
            <td className="border px-2 py-1">{r.id}</td>
            <td className="border px-2 py-1">{r.email}</td>
            <td className="border px-2 py-1">{r.createdAt}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
