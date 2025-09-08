"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onRestart?: () => void;
}

export default function LoginForm({ onRestart }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    if (!formData.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email no válido";
    if (!formData.password) newErrors.password = "La contraseña es requerida";
    else if (formData.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/admin/test", {
        headers: {
          Authorization:
            "Basic " + btoa(`${formData.email}:${formData.password}`),
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Auth failed");

      // Demo only
      sessionStorage.setItem("demo_email", formData.email);
      sessionStorage.setItem("demo_pass", formData.password);

      router.push("/applicants");
    } catch {
      setErrors((prev) => ({
        ...prev,
        password: "Credenciales inválidas o sin acceso",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[image:var(--color-gradient-brand)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Patrón de fondo decorativo mejorado */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/30 animate-pulse"
            style={{ animationDelay: "0s", animationDuration: "4s" }}
          />
          <div
            className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-white/20 animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white/25 animate-pulse"
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full border border-white/15 animate-pulse"
            style={{ animationDelay: "3s", animationDuration: "4s" }}
          />
        </div>

        <div className="relative z-10 fade-in">
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
            <h1 className="text-[var(--text-size-900)] font-[var(--font-weight-heavy)] text-white leading-[var(--spacing-line-height-heading-2)] fade-in delay-200">
              Bienvenida a tu
              <br />
              <span className="text-orange-200 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                espacio de liderazgo
              </span>
            </h1>

            <p className="text-purple-100 text-[var(--text-size-400)] leading-[var(--spacing-line-height-body-1)] fade-in delay-400">
              Desde aquí coordinas una comunidad que transforma carreras,
              impulsa negocios y conecta mujeres con oportunidades reales.
              <strong className="text-white">Tu impacto empieza aquí.</strong>
            </p>

            {/* Lista de beneficios */}
            <div className="space-y-3 fade-in delay-600">
              <div className="flex items-center gap-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-[var(--text-size-300)]">
                  Gestión centralizada de aplicaciones
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-[var(--text-size-300)]">
                  Analytics y reportes en tiempo real
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-[var(--text-size-300)]">
                  Panel de control completo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-white/80 fade-in delay-400">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm bg-[var(--color-purple-400)]">
              M
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm bg-[var(--color-pink-400)]">
              A
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm bg-[var(--color-orange-400)]">
              L
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm bg-white/20">
              +
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium">+2,500 mujeres</span>
            <span className="text-white/70 text-sm">ya forman parte</span>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--color-background-light)]">
        <div className="w-full max-w-md fade-in delay-200">
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
            <h2 className="text-[var(--text-size-700)] font-[var(--font-weight-heavy)] mb-2 text-[var(--color-foreground)]">
              Iniciar Sesión
            </h2>
            <p className="text-[var(--text-size-300)] text-[var(--color-muted)]">
              Accede a tu panel de administración
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[var(--text-size-200)] font-medium text-[var(--color-foreground)] mb-2"
              >
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    className={`h-5 w-5 transition-colors duration-200 ${
                      errors.email
                        ? "text-[var(--color-error)]"
                        : "text-[var(--color-muted)] group-focus-within:text-[var(--color-primary)]"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition-all duration-200 
                    text-[var(--text-size-300)] placeholder:text-[var(--color-muted)]
                    focus:outline-none focus:ring-2 focus:border-transparent
                    ${
                      errors.email
                        ? "border-[var(--color-error)] bg-red-50 focus:ring-red-200"
                        : "border-neutral-300 bg-white hover:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                    }`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-[var(--text-size-200)] text-[var(--color-error)] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[var(--color-error)] rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[var(--text-size-200)] font-medium text-[var(--color-foreground)] mb-2"
              >
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    className={`h-5 w-5 transition-colors duration-200 ${
                      errors.password
                        ? "text-[var(--color-error)]"
                        : "text-[var(--color-muted)] group-focus-within:text-[var(--color-primary)]"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-200 
                    text-[var(--text-size-300)] placeholder:text-[var(--color-muted)]
                    focus:outline-none focus:ring-2 focus:border-transparent
                    ${
                      errors.password
                        ? "border-[var(--color-error)] bg-red-50 focus:ring-red-200"
                        : "border-neutral-300 bg-white hover:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-neutral-50 rounded-r-lg transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--color-muted)] hover:text-[var(--color-foreground)]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--color-muted)] hover:text-[var(--color-foreground)]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-[var(--text-size-200)] text-[var(--color-error)] flex items-center gap-1">
                  <span className="w-1 h-1 bg-[var(--color-error)] rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Recordar y Recuperar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-neutral-300 rounded transition-all duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-[var(--text-size-200)] text-[var(--color-foreground)]"
                >
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                className="text-[var(--text-size-200)] text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 text-[var(--text-size-300)]
                ${
                  isLoading
                    ? "bg-[var(--color-button-disabled-bg)] text-[var(--color-button-disabled-text)] cursor-not-allowed"
                    : "bg-[var(--color-button-primary-primary-bg-default)] text-[var(--color-button-primary-primary-text)] hover:bg-[var(--color-button-primary-primary-bg-hover)] hover:text-[var(--color-button-primary-primary-text-hover)] hover:shadow-[var(--color-card-shadow-hover)] transform hover:scale-[1.02]"
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-center text-[var(--text-size-200)] text-[var(--color-muted)]">
              ¿No tienes cuenta?{" "}
              <button className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors duration-200">
                Solicitar acceso
              </button>
            </p>
          </div>

          {/* Botón de desarrollo - Reiniciar animación */}
          {onRestart && (
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={onRestart}
                className="w-full text-[var(--text-size-200)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] py-2 transition-colors duration-200"
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
