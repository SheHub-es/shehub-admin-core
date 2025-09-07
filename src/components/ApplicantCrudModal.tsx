// 'use client';

// import { RotateCcw, Save, Trash2, UserPlus, X } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { FormData, useApplicantCRUD } from '../features/hooks/useApplicantCrud';
// import { Applicant } from '../features/types/applicant.types';

// export interface ApplicantCrudModalProps {
//   isOpen: boolean;
//   mode: 'create' | 'edit' | 'view' | 'delete' | 'restore';
//   applicant?: Applicant | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export const ApplicantCrudModal = ({ 
//   isOpen, 
//   mode, 
//   applicant, 
//   onClose, 
//   onSuccess 
// }: ApplicantCrudModalProps) => {

//   const [formData, setFormData] = useState<FormData>({
//     email: '',
//     firstName: '',
//     lastName: '',
//     language: 'ES',
//     mentor: false,
//     roles: []
//   });
//   const [newRole, setNewRole] = useState('');
//   const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});


//   const {
//     state,
//     validateForm,
//     createApplicant,
//     updateApplicant,
//     deleteApplicant,
//     restoreApplicant,
//     clearError
//   } = useApplicantCRUD(onSuccess);

//   useEffect(() => {
//     if (isOpen) {
//       if (applicant && (mode === 'edit' || mode === 'view' || mode === 'delete' || mode === 'restore')) {
//         setFormData({
//           email: applicant.email || '',
//           firstName: applicant.firstName || '',
//           lastName: applicant.lastName || '',
//           language: applicant.language || 'ES',
//           mentor: applicant.mentor || false,
//           roles: applicant.roles || []
//         });
//       } else if (mode === 'create') {
//         setFormData({
//           email: '',
//           firstName: '',
//           lastName: '',
//           language: 'ES',
//           mentor: false,
//           roles: []
//         });
//       }
//       setFormErrors({});
//       setNewRole('');
//       clearError();
//     }
//   }, [isOpen, applicant, mode, clearError]);

//   const handleInputChange = (
//     field: keyof FormData,
//     value: string | boolean | string[]
//   ) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (formErrors[field]) {
//       setFormErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };


//   const addRole = () => {
//     if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         roles: [...prev.roles, newRole.trim()]
//       }));
//       setNewRole('');
//       if (formErrors.roles) {
//         setFormErrors(prev => {
//           const newErrors = { ...prev };
//           delete newErrors.roles;
//           return newErrors;
//         });
//       }
//     }
//   };


//   const removeRole = (roleToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       roles: prev.roles.filter(role => role !== roleToRemove)
//     }));
//   };


//   const handleSubmit = async () => {
//     const errors = validateForm(formData);
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }

//     const payload = {
//       ...formData,
//       language: formData.language || 'ES'
//     };

//     console.log('Payload enviado al backend:', payload);
//     let success = false;

//     switch (mode) {
//       case 'create':
//         success = await createApplicant(payload);
//         break;
//       case 'edit':
//         success = await updateApplicant(payload);
//         break;
//       case 'delete':
//         success = await deleteApplicant();
//         break;
//       case 'restore':
//         success = await restoreApplicant();
//         break;
//     }

//     if (success) {
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   const getModalTitle = () => {
//     switch (mode) {
//       case 'create': return 'Crear Nueva Aplicante';
//       case 'edit': return 'Editar Aplicante';
//       case 'view': return 'Ver Detalles';
//       case 'delete': return 'Confirmar Eliminación';
//       case 'restore': return 'Confirmar Restauración';
//       default: return 'Modal';
//     }
//   };

//   const getModalIcon = () => {
//     switch (mode) {
//       case 'create': return <UserPlus className="w-6 h-6" />;
//       case 'edit': return <Save className="w-6 h-6" />;
//       case 'view': return <Save className="w-6 h-6" />;
//       case 'delete': return <Trash2 className="w-6 h-6 text-red-500" />;
//       case 'restore': return <RotateCcw className="w-6 h-6 text-green-500" />;
//     }
//   };

//   const getActionButtonText = () => {
//     switch (mode) {
//       case 'create': return 'Crear Aplicante';
//       case 'edit': return 'Guardar Cambios';
//       case 'delete': return 'Confirmar Eliminación';
//       case 'restore': return 'Confirmar Restauración';
//       default: return 'Aceptar';
//     }
//   };

//   const isReadOnly = mode === 'view';
//   const isDeleteOrRestore = mode === 'delete' || mode === 'restore';
//   const isLoading = state.loading;

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-[var(--color-card-white-bg-default)] backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
//         {/* Header */}
//         <div className="p-8 border-b border-[var(--color-disabled)] bg-gradient-to-r from-[var(--color-background-footer)] to-white rounded-t-3xl">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-[image:var(--color-button-bg-gradient)] rounded-2xl flex items-center justify-center text-white shadow-lg">
//                 {getModalIcon()}
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
//                   {getModalTitle()}
//                 </h2>
//                 {applicant && (
//                   <p className="text-[var(--color-muted)] font-medium">{applicant.email}</p>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-3 text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-red-50)] rounded-2xl transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
//               aria-label="Cerrar modal"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

  
//         <div className="p-8 space-y-6">
//           {state.error && (
//             <div className="p-4 bg-gradient-to-r from-[var(--color-red-50)] to-red-50 border border-[var(--color-error)] rounded-2xl shadow-sm">
//               <p className="text-sm text-[var(--color-error)] font-medium">{state.error}</p>
//             </div>
//           )}

//           {isDeleteOrRestore ? (
//             <div className="space-y-6 text-center">
//               <p className="text-lg text-[var(--color-foreground)] font-medium mb-4">
//                 {mode === 'delete' 
//                   ? `¿Estás segura de que deseas eliminar a ${applicant?.firstName} ${applicant?.lastName}?`
//                   : `¿Estás segura de que deseas restaurar a ${applicant?.firstName} ${applicant?.lastName}?`
//                 }
//               </p>
//             </div>
//           ) : (
         
//             <div className="space-y-6">
            
//               <div>
//                 <label className="block text-sm font-bold text-[var(--color-foreground)] mb-2">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange('email', e.target.value)}
//                   disabled={isReadOnly || mode === 'edit'}
//                   className="w-full px-4 py-3 border rounded-xl"
//                   placeholder="email@ejemplo.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-[var(--color-foreground)] mb-2">
//                   Nombre *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.firstName}
//                   onChange={(e) => handleInputChange('firstName', e.target.value)}
//                   disabled={isReadOnly}
//                   className="w-full px-4 py-3 border rounded-xl"
//                   placeholder="Nombre"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-[var(--color-foreground)] mb-2">
//                   Apellido *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.lastName}
//                   onChange={(e) => handleInputChange('lastName', e.target.value)}
//                   disabled={isReadOnly}
//                   className="w-full px-4 py-3 border rounded-xl"
//                   placeholder="Apellido"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="language-select" className="block text-sm font-bold text-[var(--color-foreground)] mb-2">
//                   Idioma *
//                 </label>
//                 <select
//                   id="language-select"
//                   value={formData.language}
//                   onChange={(e) => handleInputChange('language', e.target.value)}
//                   disabled={isReadOnly}
//                   className="w-full px-4 py-3 border rounded-xl"
//                 >
//                   <option value="ES">Español</option>
//                   <option value="EN">English</option>
//                   <option value="CAT">Català</option>
//                 </select>
//               </div>

            
//               <div>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={formData.mentor}
//                     onChange={(e) => handleInputChange('mentor', e.target.checked)}
//                     disabled={isReadOnly}
//                   />
//                   <span className="text-sm font-bold">Es mentora</span>
//                 </label>
//               </div>

           
//               <div>
//                 <label className="block text-sm font-bold mb-2">Roles *</label>
//                 <div className="flex gap-2">
//                   {!isReadOnly && (
//                     <>
//                       <input
//                         type="text"
//                         value={newRole}
//                         onChange={(e) => setNewRole(e.target.value)}
//                         className="flex-1 px-4 py-3 border rounded-xl"
//                         placeholder="Agregar rol"
//                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
//                       />
//                       <button
//                         type="button"
//                         onClick={addRole}
//                         className="px-6 py-3 bg-[image:var(--color-button-bg-gradient)] text-white rounded-xl"
//                       >
//                         +
//                       </button>
//                     </>
//                   )}
//                 </div>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {formData.roles.map((role, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-[image:var(--color-button-bg-gradient)] text-white rounded-xl">
//                       {role}
//                       {!isReadOnly && (
//                         <button onClick={() => removeRole(role)} className="ml-2">×</button>
//                       )}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

    
//         <div className="p-8 border-t flex justify-end gap-4">
//           <button
//             onClick={onClose}
//             disabled={isLoading}
//             className="px-8 py-4 bg-gray-100 rounded-2xl"
//           >
//             Cancelar
//           </button>
          
//           {mode !== 'view' && (
//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="px-8 py-4 bg-[image:var(--color-button-bg-gradient)] text-white rounded-2xl"
//             >
//               {isLoading ? "Procesando..." : getActionButtonText()}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
