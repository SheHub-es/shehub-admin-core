// components/applicants/ApplicantForm.tsx
'use client';

import React, { useState } from 'react';
import {
  CreateApplicantDto,
  Language,
  UpdateApplicantDto,
  getLanguageDisplayName,
} from '../features/types/applicant';

interface ApplicantFormProps {
  initialData?: Partial<CreateApplicantDto>;
  onSubmit: (data: CreateApplicantDto | UpdateApplicantDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'update';
}

export function ApplicantForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
}: ApplicantFormProps) {
  const [formData, setFormData] = useState({
    
    email: initialData.email ?? '',
    firstName: initialData.firstName ?? '',
    lastName: initialData.lastName ?? '',
    mentor: initialData.mentor ?? false,
    language: ((initialData.language as Language) ?? Language.ES) as Language,
    roles: Array.isArray(initialData.roles) ? initialData.roles.join(', ') : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rolesArray = formData.roles
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (mode === 'create') {
      const payload: CreateApplicantDto = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mentor: formData.mentor,
        language: formData.language, 
        roles: rolesArray,
      };
      await onSubmit(payload);
    } else {
     const payload: UpdateApplicantDto & { email: string } = {
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  mentor: formData.mentor,
  language: formData.language,
  roles: rolesArray,
  email: (initialData.email ?? '').trim(), 
};

await onSubmit(payload as UpdateApplicantDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {mode === 'create' ? 'Crear Applicant' : 'Actualizar Applicant'}
      </h2>

      {mode === 'create' && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ejemplo@email.com"
          />
        </div>
      )}

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          id="firstName"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nombre"
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Apellido *
        </label>
        <input
          type="text"
          id="lastName"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Apellido"
        />
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          Idioma *
        </label>
        <select
          id="language"
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={Language.ES}>{getLanguageDisplayName(Language.ES)}</option>
          <option value={Language.EN}>{getLanguageDisplayName(Language.EN)}</option>
          <option value={Language.CAT}>{getLanguageDisplayName(Language.CAT)}</option>
          <option value={Language.EN_GB}>{getLanguageDisplayName(Language.EN_GB)}</option>
          <option value={Language.EN_US}>{getLanguageDisplayName(Language.EN_US)}</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="mentor"
          checked={formData.mentor}
          onChange={(e) => setFormData({ ...formData, mentor: e.target.checked })}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="mentor" className="ml-2 block text-sm text-gray-700">
          ¿Es mentor?
        </label>
      </div>

      <div>
        <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-2">
          Roles Profesionales
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Escribe los roles separados por coma (p. ej.: Frontend Developer, UX Designer, Product Manager)
        </p>
        <input
          type="text"
          id="roles"
          value={formData.roles}
          onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej.: Frontend Developer, UX Designer, Product Manager"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Procesando...' : mode === 'create' ? 'Crear' : 'Actualizar'}
        </button>
      </div>
    </form>
  );
}

