// src/services/admin.api.ts
export class AdminAPIService {
  private baseUrl = '/admin';
  
  // Para el dashboard admin con Basic Auth
  async getApplicants(email: string, password: string, page = 0, size = 10) {
    // Tu código existente
  }
  
  async getStats(email: string, password: string) {
    // Llamar a /admin/applicants/stats
  }
}