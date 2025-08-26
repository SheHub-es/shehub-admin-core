'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface LoginFormProps {
  onRestart?: () => void;
}

export default function LoginForm({ onRestart }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real de autenticación
      console.log('Login attempt:', formData);
      
      // Simulamos éxito por ahora
      alert('¡Login exitoso! 🎉');
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Error en el login. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[image:var(--color-gradient-brand)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/30" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white/25" />
        </div>

        <div className="relative z-10">
          <div className="mb-12">
            <Image
              src="/images/logo-shehub.png"
              alt="SheHub"
              width={180}
              height={54}
              className="filter brightness-0 invert"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Bienvenida a tu
              <br />
              <span className="text-orange-200">espacio de liderazgo</span>
            </h1>
            
            <p className="text-purple-100 text-lg leading-relaxed">
              Desde aquí coordinas una comunidad que transforma carreras, impulsa negocios y conecta mujeres con oportunidades reales. Tu impacto empieza aquí.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/80">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-purple-400)' }} />
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-pink-400)' }} />
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-orange-400)' }} />
          </div>
          <span className="text-sm">+2,500 mujeres ya forman parte</span>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background-light)' }}>
        <div className="w-full max-w-md">
          
          {/* Logo móvil */}
          <div className="lg:hidden mb-8 text-center">
            <Image
              src="/images/logo-shehub.png"
              alt="SheHub"
              width={160}
              height={48}
              className="mx-auto mb-4"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Iniciar Sesión
            </h2>
            <p style={{ color: 'var(--color-muted)' }}>
              Accede a tu panel de administración
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Recordar y Recuperar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-500 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg transform hover:scale-[1.02]'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <button className="font-medium text-purple-600 hover:text-purple-500">
                Solicitar acceso
              </button>
            </p>
          </div>

          {/* Botón de desarrollo - Reiniciar animación */}
          {onRestart && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onRestart}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                ↻ Ver animación de intro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}