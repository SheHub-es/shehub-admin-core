
// import { useCallback, useState } from "react";
// import { Applicant, Language } from "../types/applicant.types";

// import {
//   createApplicant as apiCreateApplicant,
//   updateApplicantById as apiUpdateApplicantById,
//   deleteApplicantById as apiDeleteApplicantById,
//   restoreApplicant as apiRestoreApplicant,
//   type CreateApplicantRequest,
//   type UpdateApplicantRequest,
// } from "@/features/applicants/api/applicants.api";


// export interface CRUDState {
//   isOpen: boolean;
//   mode: "create" | "edit" | "view" | "delete" | "restore";
//   selectedApplicant: Applicant | null;
//   loading: boolean;
//   error: string | null;
// }

// export interface FormData {
//   email: string;
//   firstName: string;
//   lastName: string;
//   language: Language;
//   mentor: boolean;
//   roles: string[];
// }

// export interface FormErrors {
//   [key: string]: string;
// }

// export const useApplicantCRUD = (onSuccess?: () => void) => {
//   const [state, setState] = useState<CRUDState>({
//     isOpen: false,
//     mode: "view",
//     selectedApplicant: null,
//     loading: false,
//     error: null,
//   });


//   const validateForm = useCallback((formData: FormData): FormErrors => {
//     const errors: FormErrors = {};

//     if (!formData.email?.trim()) {
//       errors.email = "El correo es obligatorio";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       errors.email = "Dirección de correo inválida";
//     }

//     if (!formData.firstName?.trim())
//       errors.firstName = "El nombre es obligatorio";
//     if (!formData.lastName?.trim())
//       errors.lastName = "El apellido es obligatorio";

//     if (formData.mentor === null || formData.mentor === undefined) {
//       errors.mentor = "Debe especificar si es mentora o colaboradora";
//     }

//     if (!formData.roles || formData.roles.length === 0) {
//       errors.roles = "Al menos un rol es obligatorio";
//     }

//     if (!formData.language?.trim()) errors.language = "El idioma es obligatorio";

//     return errors;
//   }, []);


//   const openCreateModal = useCallback(() => {
//     setState({
//       isOpen: true,
//       mode: "create",
//       selectedApplicant: null,
//       loading: false,
//       error: null,
//     });
//   }, []);

//   const openEditModal = useCallback((app: Applicant) => {
//     setState({
//       isOpen: true,
//       mode: "edit",
//       selectedApplicant: app,
//       loading: false,
//       error: null,
//     });
//   }, []);

//   const openViewModal = useCallback((app: Applicant) => {
//     setState({
//       isOpen: true,
//       mode: "view",
//       selectedApplicant: app,
//       loading: false,
//       error: null,
//     });
//   }, []);

//   const openDeleteModal = useCallback((app: Applicant) => {
//     setState({
//       isOpen: true,
//       mode: "delete",
//       selectedApplicant: app,
//       loading: false,
//       error: null,
//     });
//   }, []);

//   const openRestoreModal = useCallback((app: Applicant) => {
//     setState({
//       isOpen: true,
//       mode: "restore",
//       selectedApplicant: app,
//       loading: false,
//       error: null,
//     });
//   }, []);

//   const closeModal = useCallback(() => {
//     setState((prev) => ({
//       ...prev,
//       isOpen: false,
//       selectedApplicant: null,
//       error: null,
//     }));
//   }, []);

//   const createApplicant = useCallback(
//     async (formData: FormData): Promise<boolean> => {
//       setState((prev) => ({ ...prev, loading: true, error: null }));

//       try {
//         const payload: CreateApplicantRequest = {
//           email: formData.email.trim(),
//           firstName: formData.firstName.trim(),
//           lastName: formData.lastName.trim(),
//           mentor: formData.mentor,
//           roles: Array.from(new Set(formData.roles)),
//           language: formData.language,
//         };

//         const result = await apiCreateApplicant(payload);
//         console.log("✅ Applicant creado:", result);

//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           isOpen: false,
//           selectedApplicant: null,
//         }));

//         onSuccess?.();
//         return true;
//       } catch (err) {
//         console.error("💥 Error creando applicant:", err);
//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           error: err instanceof Error ? err.message : "Error desconocido",
//         }));
//         return false;
//       }
//     },
//     [onSuccess]
//   );


//   const updateApplicant = useCallback(
//     async (formData: FormData): Promise<boolean> => {
//       if (!state.selectedApplicant) {
//         setState((prev) => ({
//           ...prev,
//           error: "No hay applicant seleccionado para actualizar",
//         }));
//         return false;
//       }

//       setState((prev) => ({ ...prev, loading: true, error: null }));

//       try {
//         const payload: UpdateApplicantRequest = {
//           firstName: formData.firstName.trim(),
//           lastName: formData.lastName.trim(),
//           mentor: formData.mentor,
//           roles: formData.roles,
//           language: formData.language,
//         };

//         await apiUpdateApplicantById(state.selectedApplicant.id, payload);

//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           isOpen: false,
//           selectedApplicant: null,
//         }));

//         onSuccess?.();
//         return true;
//       } catch (err) {
//         console.error("Error actualizando applicant:", err);
//         setState((prev) => ({
//           ...prev,
//           loading: false,
//           error: err instanceof Error ? err.message : "Error desconocido",
//         }));
//         return false;
//       }
//     },
//     [state.selectedApplicant, onSuccess]
//   );

//   const deleteApplicant = useCallback(async (): Promise<boolean> => {
//     if (!state.selectedApplicant) {
//       setState((prev) => ({
//         ...prev,
//         error: "No hay applicant seleccionado para eliminar",
//       }));
//       return false;
//     }

//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     try {
//       await apiDeleteApplicantById(state.selectedApplicant.id);

//       setState((prev) => ({
//         ...prev,
//         loading: false,
//         isOpen: false,
//         selectedApplicant: null,
//       }));

//       onSuccess?.();
//       return true;
//     } catch (err) {
//       console.error("Error eliminando applicant:", err);
//       setState((prev) => ({
//         ...prev,
//         loading: false,
//         error: err instanceof Error ? err.message : "Error desconocido",
//       }));
//       return false;
//     }
//   }, [state.selectedApplicant, onSuccess]);


//   const restoreApplicant = useCallback(async (): Promise<boolean> => {
//     if (!state.selectedApplicant) {
//       setState((prev) => ({
//         ...prev,
//         error: "No hay applicant seleccionado para restaurar",
//       }));
//       return false;
//     }

//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     try {
//       await apiRestoreApplicant(state.selectedApplicant.email);

//       setState((prev) => ({
//         ...prev,
//         loading: false,
//         isOpen: false,
//         selectedApplicant: null,
//       }));

//       onSuccess?.();
//       return true;
//     } catch (err) {
//       console.error("Error restaurando applicant:", err);
//       setState((prev) => ({
//         ...prev,
//         loading: false,
//         error: err instanceof Error ? err.message : "Error desconocido",
//       }));
//       return false;
//     }
//   }, [state.selectedApplicant, onSuccess]);


//   const clearError = useCallback(() => {
//     setState((prev) => ({ ...prev, error: null }));
//   }, []);

//   return {
//     state,
//     validateForm,
//     openCreateModal,
//     openEditModal,
//     openViewModal,
//     openDeleteModal,
//     openRestoreModal,
//     closeModal,
//     createApplicant,
//     updateApplicant,
//     deleteApplicant,
//     restoreApplicant,
//     clearError,
//   };
// };

