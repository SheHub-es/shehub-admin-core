// features/hooks/useApplicants.ts
import { useCallback, useEffect, useState } from 'react';
import { ApiClientError, applicantApi } from '../lib/applicants'; 
import {
  Applicant,
  ApplicantDetailDto,
  ApplicantListItemDto,
  CreateApplicantDto,
  PaginatedResponse,
  UpdateApplicantDto,
} from '../types/applicant';

interface UseApplicantsResult {
  applicants: ApplicantListItemDto[];
  loading: boolean;
  error: string | null;
  statusFilter: 'active' | 'deleted' | 'all';
  setStatusFilter: (filter: 'active' | 'deleted' | 'all') => void;
  refresh: () => Promise<void>;
  create: (dto: CreateApplicantDto) => Promise<Applicant>;
  updateById: (id: number, dto: UpdateApplicantDto) => Promise<Applicant>;
  updateByEmail: (email: string, dto: UpdateApplicantDto) => Promise<Applicant>;
  deleteById: (id: number) => Promise<void>;
  deleteByEmail: (email: string) => Promise<void>;
  restoreByEmail: (email: string) => Promise<Applicant>;
}

export function useApplicants(): UseApplicantsResult {
  const [applicants, setApplicants] = useState<ApplicantListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'deleted' | 'all'>('active');

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
      let data: ApplicantListItemDto[] = [];
      if (statusFilter === 'active') {
        data = await applicantApi.getAll();
      } else if (statusFilter === 'deleted') {
        data = await applicantApi.getExpiredDeleted();
      } else if (statusFilter === 'all') {
        const [active, deleted] = await Promise.all([
          applicantApi.getAll(),
          applicantApi.getExpiredDeleted(),
        ]);
        data = [...active, ...deleted];
      }
      setApplicants(data);
    } catch (err) {
      setError(formatErr(err, 'Error loading applicants'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

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


  const restoreByEmail = useCallback(
    async (email: string): Promise<Applicant> => {
      try {
        const restored = await applicantApi.restore(email); 
        await refresh();
        return restored;
      } catch (err) {
        const errorMsg = formatErr(err, 'Error restoring applicant');
        setError(errorMsg);
        throw err;
      }
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh, statusFilter]);

  return {
    applicants,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    refresh,
    create,
    updateById,
    updateByEmail,
    deleteById,
    deleteByEmail,
    restoreByEmail,
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
