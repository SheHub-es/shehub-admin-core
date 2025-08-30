// src/features/types/applicant.types.ts
export type Language = 'ES' | 'EN' | 'CAT' | 'EN_GB' | 'EN_US';

export interface Applicant {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: boolean;
  displayRole: string;
  language: Language; // ✅ Usar el enum correcto
  roles: string[];
  timestamp: string;
  deleted: boolean;
  deletedAt: string | null;
  userId: number | null;
}


// ✅ Agregar interfaz para las estadísticas
export interface ApplicantStats {
  total: number;
  pending: number;  // Aplicantes que no han sido convertidos a usuarios
  converted: number; // Aplicantes ya convertidos a usuarios  
  mentors: number;   // Total de mentores
  colaboradoras: number; // Total de colaboradoras
}

// ✅ Agregar tipos auxiliares
export type TabType = 'all' | 'pending' | 'converted' | 'mentors' | 'colaboradoras';

export interface UserInfo {
  email: string;
  displayName: string;
  role: string;
}
