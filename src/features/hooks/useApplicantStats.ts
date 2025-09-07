
import { useCallback, useEffect, useState } from 'react';
import { ApiClientError, applicantApi } from '../lib/applicants';
import { ApplicantStatsDto } from '../types/applicant';

interface ExtendedStats extends ApplicantStatsDto {
  byLanguage: Record<string, number>;
  totalActive: number;
  totalDeleted: number;
}

interface UseApplicantStatsResult {
  stats: ExtendedStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useApplicantStats(): UseApplicantStatsResult {
  const [stats, setStats] = useState<ExtendedStats | null>(null);
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
      
      // Obtener estadísticas básicas y por idioma en paralelo
      const [basicStats, languageStats, deletedApplicants] = await Promise.all([
        applicantApi.getStats(),
        applicantApi.getStatsByLanguage(),
        applicantApi.getDeleted(),
      ]);

      const totalDeleted = deletedApplicants.length;
      const totalActive = basicStats.total;

      const extendedStats: ExtendedStats = {
        ...basicStats,
        byLanguage: languageStats,
        totalActive,
        totalDeleted,
      };

      setStats(extendedStats);
    } catch (err) {
      setError(formatErr(err, 'Error loading stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}