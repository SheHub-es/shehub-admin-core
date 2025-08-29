// src/features/applicants/utils/applicant.utils.ts

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export const getUserInitials = (displayName: string): string => {
  return displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};
