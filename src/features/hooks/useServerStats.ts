import { getApplicantStats } from "@/features/applicants/api/adminApplicants.api";
import type { ApplicantStats } from '@features/types/applicant.types';
import { useCallback, useEffect, useState } from 'react';

export function useServerStats(email: string, password: string) {
  const [stats, setStats] = useState<ApplicantStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadStats = useCallback(async () => {
    console.log('🔍 Checking credentials...', { email, password: password ? '***' : 'EMPTY' });
    
    if (!email || !password) {
      console.log('⚠️ No hay credenciales disponibles para estadísticas del servidor');
      setError('No hay credenciales válidas. Ve a login e inicia sesión con: onlyirina7@gmail.com');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Intentando cargar estadísticas del servidor...');
      console.log('📧 Usuario:', email);
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Definir tipo para la respuesta cruda del servidor
      type RawServerStats = {
        total?: number;
        totalApplicants?: number;
        pending?: number;
        pendingApplicants?: number;
        converted?: number;
        mentors?: number;
        colaboradoras?: number;
        [key: string]: unknown;
      };
      const serverStats: RawServerStats = await getApplicantStats(email, password);
      console.log('✅ Estadísticas del servidor recibidas:', serverStats);
      
      // Mapear respuesta del servidor al formato esperado por el frontend
      const mappedStats: ApplicantStats = {
        total: serverStats.total ?? serverStats.totalApplicants ?? 0,
        pending: serverStats.pending ?? serverStats.pendingApplicants ?? 0, 
        converted: serverStats.converted ?? 0,  
        mentors: serverStats.mentors ?? 0,
        colaboradoras: serverStats.colaboradoras ?? 0
      };
      
      setStats(mappedStats);
      setError('');
    } catch (err: unknown) {
      console.error('❌ Error al cargar estadísticas del servidor:', err);
      
      // Mensaje más específico según el tipo de error
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'No se puede conectar al servidor. Verifica: 1) Backend corriendo, 2) CORS configurado, 3) Credenciales correctas';
        } else if (err.message.includes('401')) {
          errorMessage = 'Credenciales incorrectas. Usa: onlyirina7@gmail.com';
        } else if (err.message.includes('404')) {
          errorMessage = 'Endpoint /stats no encontrado en tu controller';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const refetch = useCallback(() => {
    console.log('🔄 Refrescando estadísticas del servidor...');
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (email && password) {
      console.log('🚀 Hook useServerStats inicializado con credenciales válidas');
      loadStats();
    } else {
      console.log('⏸️ Hook useServerStats esperando credenciales...');
    }
  }, [email, password, loadStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
}

