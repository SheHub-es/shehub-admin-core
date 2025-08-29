// src/features/applicants/api/applicants.api.ts

import { Applicant, ApplicantStats } from '../types/applicant.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export class ApplicantAPI {
  
  /**
   * Creates Basic Auth header for API requests
   */
  private static getAuthHeader(email: string, password: string) {
    return {
      'Authorization': `Basic ${btoa(`${email}:${password}`)}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generic HTTP request handler with proper error handling
   */
  private static async request<T>(
    url: string, 
    options: RequestInit = {},
    email?: string,
    password?: string
  ): Promise<T> {
    const headers: HeadersInit = {};
    
    if (email && password) {
      Object.assign(headers, this.getAuthHeader(email, password));
    }
    
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as Promise<T>;
  }

  // ============ READ OPERATIONS ============

  /**
   * Get all active applicants
   */
  static async getAllApplicants(email: string, password: string): Promise<Applicant[]> {
    return this.request<Applicant[]>('/api/applicants', {}, email, password);
  }

  /**
   * Get paginated applicants
   */
  static async getPaginatedApplicants(
    email: string, 
    password: string,
    page = 0, 
    size = 20
  ): Promise<{
    content: Applicant[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.request(
      `/api/applicants/paginated?page=${page}&size=${size}&sort=id,desc`, 
      {}, 
      email, 
      password
    );
  }

  /**
   * Get applicant by ID
   */
  static async getById(id: number, email: string, password: string): Promise<Applicant> {
    return this.request<Applicant>(`/api/applicants/${id}`, {}, email, password);
  }

  /**
   * Get pending applicants (not yet converted to users)
   */
  static async getPendingApplicants(email: string, password: string): Promise<Applicant[]> {
    return this.request<Applicant[]>('/api/applicants/pending', {}, email, password);
  }

  /**
   * Get available roles for selection
   */
  static async getAvailableRoles(email: string, password: string): Promise<string[]> {
    return this.request<string[]>('/api/applicants/roles/available', {}, email, password);
  }

  // ============ STATISTICS ENDPOINTS ============

  /**
   * Get total count of applicants
   */
  static async getTotalCount(email: string, password: string): Promise<number> {
    return this.request<number>('/api/applicants/count', {}, email, password);
  }

  /**
   * Get count by mentor flag
   */
  static async getCountByMentor(mentor: boolean, email: string, password: string): Promise<number> {
    return this.request<number>(`/api/applicants/count/mentor/${mentor}`, {}, email, password);
  }

  /**
   * Get count by language
   */
  static async getCountByLanguage(language: string, email: string, password: string): Promise<number> {
    return this.request<number>(`/api/applicants/count/language/${language}`, {}, email, password);
  }

  /**
   * Get comprehensive statistics for dashboard
   */
  static async getStatistics(email: string, password: string): Promise<ApplicantStats> {
    try {
      // Make parallel requests for better performance
      const [
        total,
        mentors,
        allApplicants
      ] = await Promise.all([
        this.getTotalCount(email, password),
        this.getCountByMentor(true, email, password),
        this.getAllApplicants(email, password)
      ]);

      // Calculate converted (those with userId) and pending from all applicants
      const converted = allApplicants.filter(a => a.userId).length;
      const pending = total - converted;

      return {
        total,
        mentors,
        pending,
        converted
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // ============ CRUD OPERATIONS ============

  /**
   * Create new applicant
   */
  static async create(applicant: Omit<Applicant, 'id'>, email: string, password: string): Promise<Applicant> {
    return this.request<Applicant>('/api/applicants', {
      method: 'POST',
      body: JSON.stringify(applicant)
    }, email, password);
  }

  /**
   * Update applicant by ID
   */
  static async update(id: number, applicant: Partial<Applicant>, email: string, password: string): Promise<Applicant> {
    return this.request<Applicant>(`/api/applicants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicant)
    }, email, password);
  }

  /**
   * Delete applicant by ID (soft delete)
   */
  static async delete(id: number, email: string, password: string): Promise<void> {
    return this.request<void>(`/api/applicants/${id}`, {
      method: 'DELETE'
    }, email, password);
  }

  /**
   * Convert applicant to user
   */
  static async convertToUser(applicantId: number, userId: number, email: string, password: string): Promise<Applicant> {
    return this.request<Applicant>(
      `/api/applicants/${applicantId}/convert-to-user?userId=${userId}`, 
      {
        method: 'PUT'
      }, 
      email, 
      password
    );
  }

  // ============ FILTERING ENDPOINTS ============

  /**
   * Filter applicants by language
   */
  static async getByLanguage(language: string, email: string, password: string): Promise<Applicant[]> {
    return this.request<Applicant[]>(`/api/applicants/language/${language}`, {}, email, password);
  }

  /**
   * Filter applicants by mentor flag
   */
  static async getByMentor(mentor: boolean, email: string, password: string): Promise<Applicant[]> {
    return this.request<Applicant[]>(`/api/applicants/mentor/${mentor}`, {}, email, password);
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string, authEmail: string, password: string): Promise<boolean> {
    return this.request<boolean>(`/api/applicants/exists?email=${encodeURIComponent(email)}`, {}, authEmail, password);
  }

  // ============ ADMIN OPERATIONS ============

  /**
   * Get expired deleted applicants
   */
  static async getExpiredDeleted(email: string, password: string): Promise<Applicant[]> {
    return this.request<Applicant[]>('/api/applicants/admin/expired-deleted', {}, email, password);
  }

  /**
   * Cleanup expired applicants
   */
  static async cleanupExpired(email: string, password: string): Promise<number> {
    return this.request<number>('/api/applicants/admin/cleanup-expired', {
      method: 'DELETE'
    }, email, password);
  }
}
