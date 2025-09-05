// src/features/hooks/useApplicants.ts

// import { getApplicants } from '@/features/applicants/api/adminApplicants.api';
// import type { Applicant } from '@features/types/applicant.types';
// import { useCallback, useEffect, useState } from 'react';

// export const useApplicants = () => {
//   const [rows, setRows] = useState<Applicant[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const normalizeApiData = (apiData: unknown): Applicant[] => {
//     if (apiData && typeof apiData === 'object' && 'content' in apiData) {
//       const pagedResponse = apiData as { content: Applicant[] };
//       return pagedResponse.content;
//     }
    
//     if (Array.isArray(apiData)) {
//       return apiData;
//     }
    
//     return [];
//   };

//   const loadApplicants = useCallback(async () => {
//     const email = sessionStorage.getItem('demo_email') || '';
//     const pass = sessionStorage.getItem('demo_pass') || '';
    
//     if (!email || !pass) {
//       setError('No hay credenciales de autenticación disponibles');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       console.log('Cargando todos los aplicantes desde el backend...');
      
//       const data = await getApplicants(email, pass, 0, 10000);
//       console.log('Datos recibidos del backend:', data);
      
//       const normalizedData = normalizeApiData(data);
//       console.log(`Total aplicantes obtenidos: ${normalizedData.length}`);
      
//       setRows(normalizedData);
      
//     } catch (err: unknown) {
//       console.error('Error al cargar applicants desde el backend:', err);
      
//       let errorMessage = 'Error al conectar con el servidor';
//       if (err instanceof Error) {
//         if (err.message.includes('Failed to fetch')) {
//           errorMessage = 'No se puede conectar al servidor de backend';
//         } else if (err.message.includes('401')) {
//           errorMessage = 'Credenciales de autenticación incorrectas';
//         } else if (err.message.includes('403')) {
//           errorMessage = 'No tienes permisos para acceder a esta información';
//         } else if (err.message.includes('500')) {
//           errorMessage = 'Error interno del servidor';
//         } else {
//           errorMessage = `Error: ${err.message}`;
//         }
//       }
      
//       setError(errorMessage);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadApplicants();
//   }, [loadApplicants]);

//   return {
//     rows,
//     loading,
//     error,
//     reload: loadApplicants
//   };
// };



// hooks/useApplicants.ts
import { applicantApi } from '../../features/lib/applicants'; 
import {
  Applicant,
  ApplicantDetailDto,
  ApplicantListItemDto,
  CreateApplicantDto,
  PaginatedResponse,
  UpdateApplicantDto,
} from '../types/applicant';
import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../../features/lib/applicants';

interface UseApplicantsResult {
  applicants: ApplicantListItemDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (dto: CreateApplicantDto) => Promise<Applicant>;
  updateById: (id: number, dto: UpdateApplicantDto) => Promise<Applicant>;
  updateByEmail: (email: string, dto: UpdateApplicantDto) => Promise<Applicant>;
  deleteById: (id: number) => Promise<void>;
  deleteByEmail: (email: string) => Promise<void>;
}

export function useApplicants(): UseApplicantsResult {
  const [applicants, setApplicants] = useState<ApplicantListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatErr = (err: unknown, fallback: string) =>
    err instanceof ApiClientError
      ? `${err.status}: ${err.message}`
      : err instanceof Error
      ? err.message
      : fallback;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicantApi.getAll();
      setApplicants(data);
    } catch (err) {
      setError(formatErr(err, 'Error loading applicants'));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (dto: CreateApplicantDto): Promise<Applicant> => {
      try {
        const newApplicant = await applicantApi.create(dto);
        await refresh();
        return newApplicant;
      } catch (err) {
        const errorMsg = formatErr(err, 'Error creating applicant');
        setError(errorMsg);
        throw err;
      }
    },
    [refresh]
  );

  const updateById = useCallback(
    async (id: number, dto: UpdateApplicantDto): Promise<Applicant> => {
      try {
        const updatedApplicant = await applicantApi.updateById(id, dto);
        await refresh();
        return updatedApplicant;
      } catch (err) {
        const errorMsg = formatErr(err, 'Error updating applicant');
        setError(errorMsg);
        throw err;
      }
    },
    [refresh]
  );

  const updateByEmail = useCallback(
    async (email: string, dto: UpdateApplicantDto): Promise<Applicant> => {
      try {
        const updatedApplicant = await applicantApi.updateByEmail(email, dto);
        await refresh();
        return updatedApplicant;
      } catch (err) {
        const errorMsg = formatErr(err, 'Error updating applicant');
        setError(errorMsg);
        throw err;
      }
    },
    [refresh]
  );

  const deleteById = useCallback(
    async (id: number): Promise<void> => {
      try {
        await applicantApi.deleteById(id);
        await refresh();
      } catch (err) {
        const errorMsg = formatErr(err, 'Error deleting applicant');
        setError(errorMsg);
        throw err;
      }
    },
    [refresh]
  );

  const deleteByEmail = useCallback(
    async (email: string): Promise<void> => {
      try {
        await applicantApi.deleteByEmail(email);
        await refresh();
      } catch (err) {
        const errorMsg = formatErr(err, 'Error deleting applicant');
        setError(errorMsg);
        throw err;
      }
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    applicants,
    loading,
    error,
    refresh,
    create,
    updateById,
    updateByEmail,
    deleteById,
    deleteByEmail,
  };
}

interface UseApplicantDetailResult {
  applicant: ApplicantDetailDto | null;
  loading: boolean;
  error: string | null;
  refresh: (id: number) => Promise<void>;
}

export function useApplicantDetail(id?: number): UseApplicantDetailResult {
  const [applicant, setApplicant] = useState<ApplicantDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatErr = (err: unknown, fallback: string) =>
    err instanceof ApiClientError
      ? `${err.status}: ${err.message}`
      : err instanceof Error
      ? err.message
      : fallback;

  const refresh = useCallback(async (applicantId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicantApi.getById(applicantId);
      setApplicant(data);
    } catch (err) {
      setError(formatErr(err, 'Error loading applicant'));
      setApplicant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      refresh(id);
    }
  }, [id, refresh]);

  return {
    applicant,
    loading,
    error,
    refresh,
  };
}

interface UsePaginatedApplicantsResult {
  data: PaginatedResponse<Applicant> | null;
  loading: boolean;
  error: string | null;
  page: number;
  size: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  refresh: () => Promise<void>;
}

export function usePaginatedApplicants(
  initialPage = 0,
  initialSize = 10
): UsePaginatedApplicantsResult {
  const [data, setData] = useState<PaginatedResponse<Applicant> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const formatErr = (err: unknown, fallback: string) =>
    err instanceof ApiClientError
      ? `${err.status}: ${err.message}`
      : err instanceof Error
      ? err.message
      : fallback;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await applicantApi.getPaginated(page, size);
      setData(response);
    } catch (err) {
      setError(formatErr(err, 'Error loading applicants'));
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    page,
    size,
    setPage,
    setSize,
    refresh,
  };
}

interface UseAvailableRolesResult {
  roles: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAvailableRoles(): UseAvailableRolesResult {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatErr = (err: unknown, fallback: string) =>
    err instanceof ApiClientError
      ? `${err.status}: ${err.message}`
      : err instanceof Error
      ? err.message
      : fallback;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicantApi.getAvailableRoles();
      setRoles(data);
    } catch (err) {
      setError(formatErr(err, 'Error loading roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    roles,
    loading,
    error,
    refresh,
  };
}
