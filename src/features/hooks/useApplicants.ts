// src/features/hooks/useApplicants.ts

import { getApplicants } from '@features/applicants/api/applicants.api';
import type { Applicant, Language } from '@features/types/applicant.types';
import { useCallback, useEffect, useState } from 'react';

// Datos mock para fallback - CORREGIDOS con enum Language
const mockData: Applicant[] = [
  {
    id: 1,
    email: 'ana.garcia@email.com',
    firstName: 'Ana',
    lastName: 'García',
    mentor: false,
    displayRole: 'Colaboradora',
    roles: ['Frontend Developer', 'React Specialist'],
    language: 'ES', // ✅ Usar valor del enum
    timestamp: '2024-08-25T10:30:00Z',
    deleted: false,
    deletedAt: null,
    userId: null
  },
  {
    id: 2,
    email: 'laura.martinez@email.com',
    firstName: 'Laura',
    lastName: 'Martínez',
    mentor: true,
    displayRole: 'Mentora',
    roles: ['UX Designer', 'Design Mentor'],
    language: 'EN', // ✅ Usar valor del enum
    timestamp: '2024-08-24T14:20:00Z',
    deleted: false,
    deletedAt: null,
    userId: 123
  },
  {
    id: 3,
    email: 'sofia.lopez@email.com',
    firstName: 'Sofía',
    lastName: 'López',
    mentor: false,
    displayRole: 'Colaboradora',
    roles: ['Product Manager'],
    language: 'ES', // ✅ Usar valor del enum
    timestamp: '2024-08-23T09:15:00Z',
    deleted: false,
    deletedAt: null,
    userId: null
  },
  {
    id: 4,
    email: 'maria.rodriguez@email.com',
    firstName: 'María',
    lastName: 'Rodríguez',
    mentor: true,
    displayRole: 'Mentora',
    roles: ['Data Scientist', 'AI Mentor'],
    language: 'CAT', // ✅ Usar valor del enum
    timestamp: '2024-08-22T16:45:00Z',
    deleted: false,
    deletedAt: null,
    userId: null
  },
  {
    id: 5,
    email: 'carmen.sanchez@email.com',
    firstName: 'Carmen',
    lastName: 'Sánchez',
    mentor: false,
    displayRole: 'Colaboradora',
    roles: ['Marketing Digital', 'Social Media'],
    language: 'ES', // ✅ Usar valor del enum
    timestamp: '2024-08-21T11:30:00Z',
    deleted: false,
    deletedAt: null,
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
      console.log('No hay credenciales disponibles, usando datos mock');
      setRows(mockData);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Cargando aplicantes desde el servidor...');
      const data = await getApplicants(email, pass, 0, 100);
      console.log('Datos recibidos de la API:', data);
      
      const normalizedData = normalizeApiData(data);
      console.log('Datos normalizados:', normalizedData);
      
      if (normalizedData.length === 0) {
        console.log('No hay datos del servidor, usando mock como fallback');
        setRows(mockData);
      } else {
        setRows(normalizedData);
      }
      
      setError('');
    } catch (err: unknown) {
      console.error('Error al cargar applicants:', err);
      
      // Determinar mensaje de error específico
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'No se puede conectar al servidor. Usando datos de prueba.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Credenciales incorrectas. Usando datos de prueba.';
        } else {
          errorMessage = err.message;
        }
      }
      
      // Usar datos simulados como fallback
      console.log('Usando datos simulados como fallback');
      setRows(mockData);
      setError(errorMessage);
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