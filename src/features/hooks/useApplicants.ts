// src/features/hooks/useApplicants.ts

import { getApplicants } from '@features/applicants/api/applicants.api';
import type { Applicant } from '@features/types/applicant.types';
import { useCallback, useEffect, useState } from 'react';

// Datos mock para fallback
const mockData: Applicant[] = [
  { 
    id: 1, 
    email: 'ana.garcia@email.com', 
    firstName: 'Ana', 
    lastName: 'García',
    mentor: false,
    roles: ['Frontend Developer', 'React Specialist'],
    language: 'SPANISH',
    timestamp: '2024-08-25T10:30:00Z', 
    deleted: false,
    userId: null
  },
  { 
    id: 2, 
    email: 'laura.martinez@email.com', 
    firstName: 'Laura', 
    lastName: 'Martínez',
    mentor: true,
    roles: ['UX Designer', 'Design Mentor'],
    language: 'ENGLISH',
    timestamp: '2024-08-24T14:20:00Z', 
    deleted: false,
    userId: 123
  },
  { 
    id: 3, 
    email: 'sofia.lopez@email.com', 
    firstName: 'Sofía', 
    lastName: 'López',
    mentor: false,
    roles: ['Product Manager'],
    language: 'SPANISH',
    timestamp: '2024-08-23T09:15:00Z', 
    deleted: false,
    userId: null
  },
  { 
    id: 4, 
    email: 'maria.rodriguez@email.com', 
    firstName: 'María', 
    lastName: 'Rodríguez',
    mentor: true,
    roles: ['Data Scientist', 'AI Mentor'],
    language: 'CATALAN',
    timestamp: '2024-08-22T16:45:00Z', 
    deleted: false,
    userId: null
  },
  { 
    id: 5, 
    email: 'carmen.sanchez@email.com', 
    firstName: 'Carmen', 
    lastName: 'Sánchez',
    mentor: false,
    roles: ['Marketing Digital', 'Social Media'],
    language: 'SPANISH',
    timestamp: '2024-08-21T11:30:00Z', 
    deleted: false,
    userId: 456
  },
];

// Tipo para la respuesta paginada de la API
type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export const useApplicants = () => {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para normalizar los datos de la API
  const normalizeApiData = (apiData: unknown): Applicant[] => {
    // Si es un objeto con content (formato Page)
    if (apiData && typeof apiData === 'object' && 'content' in apiData) {
      const pagedResponse = apiData as PagedResponse<Applicant>;
      return pagedResponse.content;
    }
    
    // Si es directamente un array
    if (Array.isArray(apiData)) {
      return apiData;
    }
    
    // Si no hay datos, retornar array vacío
    return [];
  };

  // Función para cargar applicants
  const loadApplicants = useCallback(async () => {
    const email = sessionStorage.getItem('demo_email') || '';
    const pass = sessionStorage.getItem('demo_pass') || '';
    
    if (!email || !pass) {
      setError('No hay credenciales');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getApplicants(email, pass, 0, 100);
      console.log('Datos recibidos de la API:', data);
      const normalizedData = normalizeApiData(data);
      console.log('Datos normalizados:', normalizedData);
      setRows(normalizedData);
      setError('');
    } catch (err: unknown) {
      console.error('Error al cargar applicants:', err);
      // Si falla la API, usar datos simulados como fallback
      console.log('Usando datos simulados como fallback');
      setRows(mockData);
      setError('');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
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
