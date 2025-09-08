// components/applicants/ApplicantForm.tsx
'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  Briefcase, 
  UserCheck, 
  Save, 
  X, 
  Plus,
  AlertCircle 
} from 'lucide-react';
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create' && !formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const rolesCount = formData.roles.split(',').filter(r => r.trim().length > 0).length;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            {mode === 'create' ? (
              <Plus className="h-6 w-6 text-white" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'create' ? 'Crear Nuevo Applicant' : 'Actualizar Applicant'}
            </h2>
            <p className="text-purple-100 text-sm">
              {mode === 'create' 
                ? 'Agrega un nuevo candidato al sistema' 
                : 'Modifica la información del applicant'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Email - Solo en modo crear */}
        {mode === 'create' && (
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <Mail className="h-4 w-4 text-purple-600" />
              Email
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 
                  ${errors.email 
                    ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-neutral-300 bg-white hover:border-purple-400 focus:ring-purple-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2`}
                placeholder="ejemplo@email.com"
              />
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                errors.email ? 'text-red-400' : 'text-neutral-400'
              }`} />
            </div>
            {errors.email && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>
        )}

        {/* Nombre y Apellido en dos columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <User className="h-4 w-4 text-purple-600" />
              Nombre
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 
                  ${errors.firstName 
                    ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-neutral-300 bg-white hover:border-purple-400 focus:ring-purple-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2`}
                placeholder="Nombre"
              />
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                errors.firstName ? 'text-red-400' : 'text-neutral-400'
              }`} />
            </div>
            {errors.firstName && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <User className="h-4 w-4 text-purple-600" />
              Apellido
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 
                  ${errors.lastName 
                    ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-500' 
                    : 'border-neutral-300 bg-white hover:border-purple-400 focus:ring-purple-200 focus:border-purple-500'
                  } focus:outline-none focus:ring-2`}
                placeholder="Apellido"
              />
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                errors.lastName ? 'text-red-400' : 'text-neutral-400'
              }`} />
            </div>
            {errors.lastName && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Idioma */}
        <div className="space-y-2">
          <label htmlFor="language" className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <Globe className="h-4 w-4 text-purple-600" />
            Idioma
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg bg-white hover:border-purple-400 focus:ring-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer"
            >
              <option value={Language.ES}>{getLanguageDisplayName(Language.ES)}</option>
              <option value={Language.EN}>{getLanguageDisplayName(Language.EN)}</option>
              <option value={Language.CAT}>{getLanguageDisplayName(Language.CAT)}</option>
              <option value={Language.EN_GB}>{getLanguageDisplayName(Language.EN_GB)}</option>
              <option value={Language.EN_US}>{getLanguageDisplayName(Language.EN_US)}</option>
            </select>
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Tipo de Applicant */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <UserCheck className="h-4 w-4 text-purple-600" />
            Tipo de Applicant
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  id="mentor"
                  checked={formData.mentor}
                  onChange={(e) => handleInputChange('mentor', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${
                  formData.mentor 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-white border-neutral-300 group-hover:border-green-400'
                }`}>
                  {formData.mentor && (
                    <UserCheck className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium transition-colors ${
                formData.mentor ? 'text-green-700' : 'text-neutral-700'
              }`}>
                ¿Es mentor?
              </span>
              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${
                formData.mentor 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-purple-100 text-purple-800 border-purple-200'
              }`}>
                {formData.mentor ? 'Mentor' : 'Colaboradora'}
              </span>
            </label>
          </div>
        </div>

        {/* Roles Profesionales */}
        <div className="space-y-3">
          <label htmlFor="roles" className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <Briefcase className="h-4 w-4 text-purple-600" />
            Roles Profesionales
            {rolesCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                {rolesCount} rol{rolesCount !== 1 ? 'es' : ''}
              </span>
            )}
          </label>
          <div className="space-y-2">
            <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              💡 <strong>Tip:</strong> Escribe los roles separados por coma. Ejemplo: Frontend Developer, UX Designer, Product Manager
            </p>
            <div className="relative">
              <textarea
                id="roles"
                value={formData.roles}
                onChange={(e) => handleInputChange('roles', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg bg-white hover:border-purple-400 focus:ring-purple-200 focus:border-purple-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none"
                placeholder="Ej.: Frontend Developer, UX Designer, Product Manager"
              />
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-neutral-700 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Crear Applicant' : 'Actualizar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

