import { DashboardStats, ESGRecord, Organization, SystemHealth, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

// Helper to extract cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Global session expiry listener
let onUnauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorizedHandler = handler;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (onUnauthorizedHandler) {
      onUnauthorizedHandler();
    }
  }

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

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...customHeaders,
  };

  const csrfToken = getCookie('csrfToken');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
}

export const api = {
  // Authentication
  async register(data: { name: string; email: string; password: string }): Promise<{ user: User; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User; token?: string }>(res);
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User; token?: string }>(res);
  },

  async logout(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ user: User }>(res);
  },

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await fetch(`${API_BASE}/organizations`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<Organization[]>(res);
  },

  async getOrganization(id: string): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations/${id}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<Organization>(res);
  },

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Organization>(res);
  },

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Organization>(res);
  },

  async deleteOrganization(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/organizations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(res);
  },

  // Dashboard
  async getDashboard(orgId: string): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<DashboardStats>(res);
  },

  // ESG Records
  async getRecords(orgId: string): Promise<ESGRecord[]> {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/esg`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<ESGRecord[]>(res);
  },

  async createRecord(orgId: string, data: Partial<ESGRecord>): Promise<ESGRecord> {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/esg`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<ESGRecord>(res);
  },

  async updateRecord(id: string, data: Partial<ESGRecord>): Promise<ESGRecord> {
    const res = await fetch(`${API_BASE}/esg/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<ESGRecord>(res);
  },

  async deleteRecord(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/esg/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
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
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<SystemHealth>(res);
  },
};
