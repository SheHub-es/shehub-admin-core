import type { Chart } from "chart.js";
import {
  ActiveElement,
  ArcElement,
  BarElement,
  CategoryScale,
  ChartEvent,
  Chart as ChartJS,
  DoughnutController,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import {
  Activity,
  BarChart3,
  Globe,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { applicantApi } from "../features/lib/applicants";
import {
  ApplicantStatsDto,
  Language,
  getLanguageDisplayName,
} from "../features/types/applicant";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
);

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
  gradient: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({
  title,
  value,
  icon,
  gradient,
  subtitle,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden fade-in">
      <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-neutral-900 mb-2">
              {value.toLocaleString()}
            </p>
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
            {trend && (
              <div
                className={`flex items-center mt-2 text-xs ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`w-3 h-3 mr-1 ${trend.isPositive ? "" : "rotate-180"}`}
                />
                <span>{trend.value}% vs mes anterior</span>
              </div>
            )}
          </div>
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${gradient} opacity-20`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ApplicantStatsProps {
  onFilterChange?: (
    filter: "mentores" | "colaboradoras" | "pendientes"
  ) => void;
}

export const ApplicantStats = forwardRef<
  ApplicantStatsRef,
  ApplicantStatsProps
>(({ onFilterChange }, ref) => {
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
          } catch {
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
      setError(
        err instanceof Error ? err.message : "Error cargando estadísticas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Exponer la función loadStats al componente padre mediante ref
  useImperativeHandle(
    ref,
    () => ({
      refresh: loadStats,
    }),
    []
  );

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-600 mr-3" />
          <span className="text-neutral-600 text-base">
            Cargando estadísticas...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-800 mb-1">
              Error al cargar estadísticas
            </h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
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

  // Datos para el gráfico de barras de idiomas
  const languageChartData = {
    labels: Object.entries(stats.byLanguage)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => getLanguageDisplayName(lang as Language)),
    datasets: [
      {
        label: "Applicants por Idioma",
        data: Object.entries(stats.byLanguage)
          .sort(([, a], [, b]) => b - a)
          .map(([, count]) => count),
        backgroundColor: [
          "#9685ff",
          "#fe68a6",
          "#fd8927",
          "#3dca92",
          "#f9ca16",
        ],
        borderColor: ["#6230f7", "#e81a60", "#e45004", "#0d875e", "#c98905"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Datos para el gráfico de dona de distribución
  const distributionChartData = {
    labels: ["Mentores", "Colaboradoras", "Pendientes"],
    datasets: [
      {
        data: [stats.mentors, stats.colaboradoras, stats.pending],
        backgroundColor: ["#3dca92", "#fe68a6", "#fd8927"],
        borderColor: ["#0d875e", "#e81a60", "#e45004"],
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: ["#1aaf7a", "#f83c85", "#f76702"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "Ubuntu, sans-serif",
            size: 12,
          },
          color: "#5d5d5d",
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#292929",
        bodyColor: "#5d5d5d",
        borderColor: "#e7e7e7",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f6f6f6",
        },
        ticks: {
          font: {
            family: "Ubuntu, sans-serif",
          },
          color: "#5d5d5d",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Ubuntu, sans-serif",
          },
          color: "#5d5d5d",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "Ubuntu, sans-serif",
            size: 12,
          },
          color: "#5d5d5d",
          generateLabels: function (chart: Chart<"doughnut">) {
            const data = chart.data;
            if (
              Array.isArray(data.labels) &&
              data.labels.length &&
              data.datasets.length
            ) {
              return (data.labels as string[]).map((label, i) => {
                const value = (data.datasets[0].data as number[])[i];
                const percentage = ((value / stats.total) * 100).toFixed(1);
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: Array.isArray(data.datasets[0].backgroundColor)
                    ? data.datasets[0].backgroundColor[i]
                    : undefined,
                  strokeStyle: Array.isArray(data.datasets[0].borderColor)
                    ? data.datasets[0].borderColor[i]
                    : undefined,
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#292929",
        bodyColor: "#5d5d5d",
        borderColor: "#e7e7e7",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (
            context: import("chart.js").TooltipItem<"doughnut">
          ) {
            const percentage = (
              ((context.parsed as number) / stats.total) *
              100
            ).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (event.native && (event.native.target as HTMLElement)) {
        (event.native.target as HTMLElement).style.cursor =
          elements.length > 0 ? "pointer" : "default";
      }
    },
    onClick: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const labels = ["mentores", "colaboradoras", "pendientes"];
        const clickedLabel = labels[elementIndex];

        if (onFilterChange) {
          onFilterChange(
            clickedLabel as "mentores" | "colaboradoras" | "pendientes"
          );
        }
      }
    },
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 flex items-center mb-2">
            <BarChart3 className="h-7 w-7 mr-3 text-purple-600" />
            Dashboard de Estadísticas
          </h2>
          <p className="text-base text-neutral-600">
            Análisis completo de applicants y métricas de rendimiento
          </p>
        </div>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applicants"
          value={stats.totalActive + stats.totalDeleted}
          icon={<Users className="h-7 w-7 text-white" />}
          gradient="from-blue-400 to-blue-600"
          subtitle={`${stats.totalActive} activos, ${stats.totalDeleted} eliminados`}
          trend={{ value: 12.5, isPositive: true }}
        />

        <StatsCard
          title="Mentores"
          value={stats.mentors}
          icon={<UserCheck className="h-7 w-7 text-white" />}
          gradient="from-green-400 to-green-600"
          subtitle={`${((stats.mentors / stats.total) * 100).toFixed(1)}% del total activo`}
          trend={{ value: 8.3, isPositive: true }}
        />

        <StatsCard
          title="Colaboradoras"
          value={stats.colaboradoras}
          icon={<Users className="h-7 w-7 text-white" />}
          gradient="from-pink-400 to-pink-600"
          subtitle={`${((stats.colaboradoras / stats.total) * 100).toFixed(1)}% del total activo`}
          trend={{ value: 15.7, isPositive: true }}
        />

        <StatsCard
          title="Pendientes"
          value={stats.pending}
          icon={<UserX className="h-7 w-7 text-white" />}
          gradient="from-orange-400 to-orange-600"
          subtitle={`${stats.registered} ya registrados`}
          trend={{ value: 3.2, isPositive: false }}
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Distribución por idioma */}
        <div className="bg-white p-6 rounded-lg shadow-lg fade-in delay-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-white" />
            Distribución por Idioma
          </h3>
          <div className="h-80">
            <Bar data={languageChartData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico de dona - Tipos de applicants */}
        <div className="bg-white p-6 rounded-lg shadow-lg fade-in delay-400">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-white" />
            Distribución por Tipo
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Clickeable
            </span>
          </h3>
          <div className="h-80 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Doughnut
                data={distributionChartData}
                options={doughnutOptions}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-neutral-600">Total Activos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de métricas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métricas de rendimiento */}
        <div className="bg-white p-6 rounded-lg shadow-lg fade-in delay-600">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-white" />
            Métricas Clave
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-neutral-100">
              <span className="text-sm font-medium text-neutral-600">
                Tasa de Mentores
              </span>
              <span className="text-lg font-bold text-green-600">
                {((stats.mentors / stats.total) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-neutral-100">
              <span className="text-sm font-medium text-neutral-600">
                Tasa de Registro
              </span>
              <span className="text-lg font-bold text-purple-600">
                {((stats.registered / stats.total) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-neutral-600">
                Total Eliminados
              </span>
              <span className="text-lg font-bold text-red-600">
                {stats.totalDeleted}
              </span>
            </div>
          </div>
        </div>

        {/* Idioma principal */}
        <div className="bg-white p-6 rounded-lg shadow-lg fade-in delay-700">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">
            Idioma Dominante
          </h3>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-bold text-neutral-900 mb-2">
              {(() => {
                const maxLang = Object.entries(stats.byLanguage).reduce(
                  (a, b) => (a[1] > b[1] ? a : b)
                );
                return getLanguageDisplayName(maxLang[0] as Language);
              })()}
            </p>
            <p className="text-sm text-neutral-600">
              {
                Object.entries(stats.byLanguage).reduce((a, b) =>
                  a[1] > b[1] ? a : b
                )[1]
              }{" "}
              applicants
            </p>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100 fade-in delay-800">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Resumen Ejecutivo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-sm text-neutral-900">
                {stats.mentors + stats.colaboradoras} applicants activos
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-sm text-neutral-900">
                {stats.pending} pendientes de procesamiento
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-sm text-neutral-900">
                {Object.keys(stats.byLanguage).length} idiomas representados
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicantStats.displayName = "ApplicantStats";
