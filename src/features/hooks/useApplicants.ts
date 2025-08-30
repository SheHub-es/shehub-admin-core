// src/features/hooks/useApplicants.ts

import { getApplicants } from '@features/applicants/api/applicants.api';
import type { Applicant } from '@features/types/applicant.types';
import { useCallback, useEffect, useState } from 'react';

export const useApplicants = () => {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeApiData = (apiData: unknown): Applicant[] => {
    if (apiData && typeof apiData === 'object' && 'content' in apiData) {
      const pagedResponse = apiData as { content: Applicant[] };
      return pagedResponse.content;
    }
    
    if (Array.isArray(apiData)) {
      return apiData;
    }
    
    return [];
  };

  const loadApplicants = useCallback(async () => {
    const email = sessionStorage.getItem('demo_email') || '';
    const pass = sessionStorage.getItem('demo_pass') || '';
    
    if (!email || !pass) {
      setError('No hay credenciales de autenticación disponibles');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Cargando todos los aplicantes desde el backend...');
      
      const data = await getApplicants(email, pass, 0, 10000);
      console.log('Datos recibidos del backend:', data);
      
      const normalizedData = normalizeApiData(data);
      console.log(`Total aplicantes obtenidos: ${normalizedData.length}`);
      
      setRows(normalizedData);
      
    } catch (err: unknown) {
      console.error('Error al cargar applicants desde el backend:', err);
      
      let errorMessage = 'Error al conectar con el servidor';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'No se puede conectar al servidor de backend';
        } else if (err.message.includes('401')) {
          errorMessage = 'Credenciales de autenticación incorrectas';
        } else if (err.message.includes('403')) {
          errorMessage = 'No tienes permisos para acceder a esta información';
        } else if (err.message.includes('500')) {
          errorMessage = 'Error interno del servidor';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  return {
    rows,
    loading,
    error,
    reload: loadApplicants
  };
};