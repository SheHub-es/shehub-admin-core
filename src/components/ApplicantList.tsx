// components/applicants/ApplicantList.tsx

// import React from 'react';
// import { ApplicantListItemDto, Language, getLanguageDisplayName } from '../features/types/applicant';
// import { Pencil, Trash2, User, Users } from 'lucide-react';

// interface ApplicantListProps {
//   applicants: ApplicantListItemDto[];
//   onEdit: (applicant: ApplicantListItemDto) => void;
//   onDelete: (applicant: ApplicantListItemDto) => void;
//   onView?: (applicant: ApplicantListItemDto) => void;
// }

// const languageLabels = {
//   [Language.ES]: getLanguageDisplayName(Language.ES),
//   [Language.EN]: getLanguageDisplayName(Language.EN),
//   [Language.CAT]: getLanguageDisplayName(Language.CAT),
//   [Language.EN_GB]: getLanguageDisplayName(Language.EN_GB),
//   [Language.EN_US]: getLanguageDisplayName(Language.EN_US),
// };

// export function ApplicantList({ applicants, onEdit, onDelete, onView }: ApplicantListProps) {
//   if (applicants.length === 0) {
//     return (
//       <div className="text-center py-8 text-gray-500">
//         <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
//         <p>No hay applicants registrados</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white shadow-md rounded-lg overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
//                 Applicant
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
//                 Email
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                 Idioma
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
//                 Tipo
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
//                 Roles Profesionales
//               </th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
//                 Acciones
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {applicants.map((applicant) => (
//               <tr key={applicant.id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-10 w-10">
//                       <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                         <User className="h-6 w-6 text-blue-600" />
//                       </div>
//                     </div>
//                     <div className="ml-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {applicant.firstName} {applicant.lastName}
//                       </div>
//                       <div className="text-sm text-gray-500">ID: {applicant.id}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-900">
//                   <div className="max-w-[250px] truncate" title={applicant.email}>
//                     {applicant.email}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
//                     {languageLabels[applicant.language]}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                     applicant.mentor 
//                       ? 'bg-green-100 text-green-800' 
//                       : 'bg-purple-100 text-purple-800'
//                   }`}>
//                     {applicant.mentor ? 'Mentor' : 'Colaboradora'}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-900">
//                   <div className="max-w-[200px]">
//                     {applicant.roles.length === 0 ? (
//                       <span className="text-gray-400 italic">Sin roles definidos</span>
//                     ) : (
//                       <div className="space-y-1">
//                         {applicant.roles.map((role, index) => (
//                           <div key={index} className="inline-block mr-1 mb-1">
//                             <span 
//                               className="inline-flex px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800 font-medium"
//                               title={role}
//                             >
//                               {role.length > 20 ? `${role.substring(0, 20)}...` : role}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   <div className="flex justify-end space-x-2">
//                     {onView && (
//                       <button
//                         onClick={() => onView(applicant)}
//                         className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
//                         title="Ver detalles"
//                       >
//                         <User className="h-4 w-4" />
//                       </button>
//                     )}
//                     <button
//                       onClick={() => onEdit(applicant)}
//                       className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
//                       title="Editar"
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => onDelete(applicant)}
//                       className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
//                       title="Eliminar"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


// components/applicants/ApplicantList.tsx

import { Pencil, Trash2, User, Users } from 'lucide-react';
import {
  ApplicantListItemDto,
  Language,
  getLanguageDisplayName,
} from '../features/types/applicant';

interface ApplicantListProps {
  applicants: ApplicantListItemDto[];
  onEdit: (applicant: ApplicantListItemDto) => void;
  onDelete: (applicant: ApplicantListItemDto) => void;
  onView?: (applicant: ApplicantListItemDto) => void;
}

const languageLabels: Record<string, string> = {
  [Language.ES]: getLanguageDisplayName(Language.ES),
  [Language.EN]: getLanguageDisplayName(Language.EN),
  [Language.CAT]: getLanguageDisplayName(Language.CAT),
  [Language.EN_GB]: getLanguageDisplayName(Language.EN_GB),
  [Language.EN_US]: getLanguageDisplayName(Language.EN_US),
};

export function ApplicantList({ applicants, onEdit, onDelete, onView }: ApplicantListProps) {
  if (applicants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="mx-auto h-12 w-12 mb-4 text-gray-300" />
        <p>No hay applicants registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Idioma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Roles Profesionales
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </div>
                      <div className="text-sm text-gray-500">ID: {applicant.id}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-[250px] truncate" title={applicant.email}>
                    {applicant.email}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {languageLabels[applicant.language] || applicant.language}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      applicant.mentor
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {applicant.mentor ? 'Mentor' : 'Colaboradora'}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-[200px]">
                    {applicant.roles.length === 0 ? (
                      <span className="text-gray-400 italic">Sin roles definidos</span>
                    ) : (
                      <div className="space-y-1">
                        {applicant.roles.map((role, index) => (
                          <div key={`${role}-${index}`} className="inline-block mr-1 mb-1">
                            <span
                              className="inline-flex px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800 font-medium"
                              title={role}
                            >
                              {role.length > 20 ? `${role.substring(0, 20)}...` : role}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(applicant)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalles"
                        type="button"
                      >
                        <User className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(applicant)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Editar"
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(applicant)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Eliminar"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
