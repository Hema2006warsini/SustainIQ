import { DashboardStats, ESGRecord, Organization, SystemHealth } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) {
        errorMsg = body.error;
        if (body.details && Array.isArray(body.details)) {
          errorMsg += ': ' + body.details.map((d: any) => d.message).join(', ');
        }
      }
    } catch {
      // Use fallback errorMsg
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await fetch(`${API_BASE}/organizations`);
    return handleResponse<Organization[]>(res);
  },

  async getOrganization(id: string): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations/${id}`);
    return handleResponse<Organization>(res);
  },

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Organization>(res);
  },

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Organization>(res);
  },

  async deleteOrganization(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/organizations/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },

  // Dashboard
  async getDashboard(orgId: string): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/dashboard`);
    return handleResponse<DashboardStats>(res);
  },

  // ESG Records
  async getRecords(orgId: string): Promise<ESGRecord[]> {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/esg`);
    return handleResponse<ESGRecord[]>(res);
  },

  async createRecord(orgId: string, data: Partial<ESGRecord>): Promise<ESGRecord> {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/esg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ESGRecord>(res);
  },

  async updateRecord(id: string, data: Partial<ESGRecord>): Promise<ESGRecord> {
    const res = await fetch(`${API_BASE}/esg/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ESGRecord>(res);
  },

  async deleteRecord(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/esg/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },

  // PDF Report URL builder
  getPdfReportUrl(orgId: string, period?: string, startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${API_BASE}/organizations/${orgId}/reports/pdf?${params.toString()}`;
  },

  // System Health & Cache telemetry
  async getSystemHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },
};
