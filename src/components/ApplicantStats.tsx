// components/applicants/ApplicantStats.tsx

// import React from 'react';
// import { ApplicantStatsDto } from '../features/types/applicant';
// import { Users, UserCheck, UserPlus, Clock, CheckCircle } from 'lucide-react';

// interface ApplicantStatsProps {
//   stats: ApplicantStatsDto | null;
//   loading: boolean;
// }

// export function ApplicantStats({ stats, loading }: ApplicantStatsProps) {
//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
//             <div className="h-4 bg-gray-200 rounded mb-2"></div>
//             <div className="h-8 bg-gray-200 rounded"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (!stats) return null;

//   const statItems = [
//     {
//       label: 'Total',
//       value: stats.total,
//       icon: Users,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-100',
//     },
//     {
//       label: 'Mentores',
//       value: stats.mentors,
//       icon: UserCheck,
//       color: 'text-green-600',
//       bgColor: 'bg-green-100',
//     },
//     {
//       label: 'Colaboradoras',
//       value: stats.colaboradoras,
//       icon: UserPlus,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-100',
//     },
//     {
//       label: 'Pendientes',
//       value: stats.pending,
//       icon: Clock,
//       color: 'text-orange-600',
//       bgColor: 'bg-orange-100',
//     },
//     {
//       label: 'Registrados',
//       value: stats.registered,
//       icon: CheckCircle,
//       color: 'text-emerald-600',
//       bgColor: 'bg-emerald-100',
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//       {statItems.map((item) => {
//         const Icon = item.icon;
//         return (
//           <div key={item.label} className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">{item.label}</p>
//                 <p className="text-2xl font-bold text-gray-900">{item.value}</p>
//               </div>
//               <div className={`p-3 rounded-full ${item.bgColor}`}>
//                 <Icon className={`h-6 w-6 ${item.color}`} />
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// components/applicants/ApplicantStats.tsx

import React from 'react';
import { ApplicantStatsDto } from '../features/types/applicant';
import { Users, UserCheck, UserPlus, Clock, CheckCircle } from 'lucide-react';

interface ApplicantStatsProps {
  stats: ApplicantStatsDto | null;
  loading: boolean;
}

export function ApplicantStats({ stats, loading }: ApplicantStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { label: 'Total',         value: stats.total,        icon: Users,      color: 'text-blue-600',    bgColor: 'bg-blue-100' },
    { label: 'Mentores',      value: stats.mentors,      icon: UserCheck,  color: 'text-green-600',   bgColor: 'bg-green-100' },
    { label: 'Colaboradoras', value: stats.colaboradoras,icon: UserPlus,   color: 'text-purple-600',  bgColor: 'bg-purple-100' },
    { label: 'Pendientes',    value: stats.pending,      icon: Clock,      color: 'text-orange-600',  bgColor: 'bg-orange-100' },
    { label: 'Registrados',   value: stats.registered,   icon: CheckCircle,color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className={`p-3 rounded-full ${item.bgColor}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
