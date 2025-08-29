// src/features/hooks/useApplicantServerStats.ts

import { useState, useEffect, useCallback } from 'react';
import { ApplicantStats } from '../types/applicant.types';
import { ApplicantAPI } from '../applicants/api/applicants.api';

interface UseApplicantServerStatsReturn {
  stats: ApplicantStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook que obtiene estadísticas de aplicantes directamente del servidor
 * Reemplaza el cálculo del lado cliente por endpoints específicos del backend
 */
export const useApplicantServerStats = (
  email: string, 
  password: string
): UseApplicantServerStatsReturn => {
  
  const [stats, setStats] = useState<ApplicantStats>({
    total: 0,
    pending: 0,
    converted: 0,
    mentors: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!email || !password) {
      // Don't set error immediately, just wait for credentials
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Usar el método optimizado de la API que hace requests paralelos
      const serverStats = await ApplicantAPI.getStatistics(email, password);
      
      setStats(serverStats);
      
    } catch (err) {
      console.error('Error fetching server statistics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al obtener estadísticas');
      
      // Mantener estadísticas previas en caso de error
      // No resetear a 0 para mejor UX
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  // Fetch inicial solo cuando tenemos credenciales
  useEffect(() => {
    if (email && password) {
      fetchStats();
    }
  }, [fetchStats, email, password]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
