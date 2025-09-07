import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BarChart3, Users, UserCheck, UserX, Globe, TrendingUp, RefreshCw } from 'lucide-react';
import { applicantApi } from '../features/lib/applicants';
import { ApplicantStatsDto, Language, getLanguageDisplayName } from '../features/types/applicant';

interface ExtendedStats extends ApplicantStatsDto {
  byLanguage: Record<string, number>;
  totalActive: number;
  totalDeleted: number;
}

export interface ApplicantStatsRef {
  refresh: () => Promise<void>;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

interface LanguageBarProps {
  language: string;
  count: number;
  total: number;
  color: string;
}

function LanguageBar({ language, count, total, color }: LanguageBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          {getLanguageDisplayName(language as Language)}
        </span>
        <span className="text-sm text-gray-600">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color 
          }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
    </div>
  );
}

export const ApplicantStats = forwardRef<ApplicantStatsRef>((_, ref) => {
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas básicas
      const basicStats = await applicantApi.getStats();
      
      // Cargar estadísticas por idioma
      const languages = Object.values(Language);
      const languageStats: Record<string, number> = {};
      
      await Promise.all(
        languages.map(async (lang) => {
          try {
            const count = await applicantApi.getCountByLanguage(lang);
            languageStats[lang] = count;
          } catch (err) {
            languageStats[lang] = 0;
          }
        })
      );

      // Cargar applicants eliminados para el conteo
      const deletedApplicants = await applicantApi.getDeleted();
      const totalDeleted = deletedApplicants.length;

      const extendedStats: ExtendedStats = {
        ...basicStats,
        byLanguage: languageStats,
        totalActive: basicStats.total,
        totalDeleted,
      };

      setStats(extendedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Exponer la función loadStats al componente padre mediante ref
  useImperativeHandle(ref, () => ({
    refresh: loadStats
  }), []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-800">Error al cargar estadísticas</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            type="button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const languageColors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
          Estadísticas de Applicants
        </h2>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applicants"
          value={stats.totalActive + stats.totalDeleted}
          icon={<Users className="h-6 w-6" />}
          color="#3B82F6"
          subtitle={`${stats.totalActive} activos, ${stats.totalDeleted} eliminados`}
        />
        
        <StatsCard
          title="Mentores"
          value={stats.mentors}
          icon={<UserCheck className="h-6 w-6" />}
          color="#10B981"
          subtitle={`${((stats.mentors / stats.total) * 100).toFixed(1)}% del total activo`}
        />
        
        <StatsCard
          title="Colaboradoras"
          value={stats.colaboradoras}
          icon={<Users className="h-6 w-6" />}
          color="#F59E0B"
          subtitle={`${((stats.colaboradoras / stats.total) * 100).toFixed(1)}% del total activo`}
        />
        
        <StatsCard
          title="Pendientes"
          value={stats.pending}
          icon={<UserX className="h-6 w-6" />}
          color="#EF4444"
          subtitle={`${stats.registered} ya registrados`}
        />
      </div>

      {/* Distribución por idioma */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Distribución por Idioma
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byLanguage)
              .sort(([, a], [, b]) => b - a)
              .map(([language, count], index) => (
                <LanguageBar
                  key={language}
                  language={language}
                  count={count}
                  total={stats.total}
                  color={languageColors[index % languageColors.length]}
                />
              ))}
          </div>
        </div>

        {/* Panel de métricas adicionales */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Métricas Adicionales
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Tasa de Mentores</span>
              <span className="text-lg font-semibold text-green-600">
                {((stats.mentors / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Tasa de Registro</span>
              <span className="text-lg font-semibold text-blue-600">
                {((stats.registered / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Idioma Principal</span>
              <span className="text-lg font-semibold text-gray-900">
                {(() => {
                  const maxLang = Object.entries(stats.byLanguage)
                    .reduce((a, b) => a[1] > b[1] ? a : b);
                  return getLanguageDisplayName(maxLang[0] as Language);
                })()}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600">Total Eliminados</span>
              <span className="text-lg font-semibold text-red-600">
                {stats.totalDeleted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicantStats.displayName = 'ApplicantStats';