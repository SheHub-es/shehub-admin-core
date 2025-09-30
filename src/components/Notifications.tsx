import React, { useState, useMemo } from "react";
import {
  Bell,
  Clock,
  AlertTriangle,
  AlertCircle,
  Trash2,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { ApplicantListItemDto } from "../features/types/applicant";

interface NotificationsProps {
  deletedApplicants: ApplicantListItemDto[];
  onRestore: (email: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const useNotificationBadge = (
  deletedApplicants: ApplicantListItemDto[]
): number => {
  return useMemo(() => {
    if (!deletedApplicants?.length) return 0;

    return deletedApplicants.filter((applicant) => {
      if (!applicant.deletedAt) return false;

      const deletedDate = new Date(applicant.deletedAt);
      const expirationDate = new Date(deletedDate);
      expirationDate.setDate(expirationDate.getDate() + 7);

      const now = new Date();
      const daysLeft = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysLeft >= 0;
    }).length;
  }, [deletedApplicants]);
};

const Notifications: React.FC<NotificationsProps> = ({
  deletedApplicants,
  onRestore,
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const notifications = useMemo(() => {
    if (!deletedApplicants?.length) return [];

    return deletedApplicants
      .filter((applicant) => applicant.deletedAt)
      .map((applicant) => {
        const deletedDate = new Date(applicant.deletedAt!);
        const expirationDate = new Date(deletedDate);
        expirationDate.setDate(expirationDate.getDate() + 7);

        const now = new Date();
        const daysLeft = Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let priority = "LOW";
        let message = "";

        if (daysLeft <= 0) {
          priority = "CRITICAL";
          message = "Se eliminará permanentemente hoy";
        } else if (daysLeft === 1) {
          priority = "HIGH";
          message = "Se eliminará permanentemente mañana";
        } else if (daysLeft <= 3) {
          priority = "MEDIUM";
          message = `Se eliminará en ${daysLeft} días`;
        } else {
          priority = "LOW";
          message = `Se eliminará en ${daysLeft} días`;
        }

        return {
          ...applicant,
          daysLeft,
          priority,
          message,
          expirationDate,
        };
      })
      .filter((notification) => notification.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [deletedApplicants]);

  const stats = useMemo(() => {
    const critical = notifications.filter(
      (n) => n.priority === "CRITICAL"
    ).length;
    const high = notifications.filter((n) => n.priority === "HIGH").length;
    const medium = notifications.filter((n) => n.priority === "MEDIUM").length;
    const low = notifications.filter((n) => n.priority === "LOW").length;

    return { critical, high, medium, low, total: notifications.length };
  }, [notifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const getIcon = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "HIGH":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "MEDIUM":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCardStyle = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "border-red-300 bg-red-50";
      case "HIGH":
        return "border-orange-300 bg-orange-50";
      case "MEDIUM":
        return "border-yellow-300 bg-yellow-50";
      default:
        return "border-blue-300 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">
            Applicants próximos a eliminación permanente
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">
                {stats.critical}
              </p>
              <p className="text-sm text-red-600">Crítica</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.high}</p>
              <p className="text-sm text-orange-600">Alta</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {stats.medium}
              </p>
              <p className="text-sm text-yellow-600">Media</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.low}</p>
              <p className="text-sm text-blue-600">Baja</p>
            </div>
          </div>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">¡Todo al día!</h3>
          <p className="text-gray-600">
            No hay applicants próximos a eliminación.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Pendientes de Eliminación ({notifications.length})
          </h2>

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-2 ${getCardStyle(notification.priority)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <div className="mt-1">{getIcon(notification.priority)}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {notification.firstName} {notification.lastName}
                      </h4>
                      <span className="text-xs bg-white px-2 py-1 rounded-full">
                        ID: {notification.id}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {notification.email}
                    </p>
                    <p className="text-sm font-medium mb-2">
                      {notification.message}
                    </p>

                    <div className="flex gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        Eliminado:{" "}
                        {new Date(notification.deletedAt!).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {notification.daysLeft <= 1
                          ? "Urgente"
                          : `${notification.daysLeft} días`}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRestore(notification.email)}
                  className="flex items-center gap-2 px-3 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restaurar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
