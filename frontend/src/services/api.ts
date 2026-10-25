import { DashboardStats, ESGRecord, Organization, SystemHealth, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

const TOKEN_STORAGE_KEY = 'sustainiq_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted private browsing modes
  }
}

// Helper to extract cookie by name
function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  } catch {
    return null;
  }
}

// Global session expiry listener
let onUnauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorizedHandler = handler;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    setStoredToken(null);
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
      } else if (body.message) {
        errorMsg = body.message;
      }
    } catch {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        errorMsg = 'The backend service is currently waking up or unavailable. Please wait a few moments and try again.';
      }
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

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const csrfToken = getCookie('csrfToken');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
}

export const api = {
  // Authentication
  async register(data: { name: string; email: string; password: string }): Promise<{ user: User; token?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ user: User; token?: string }>(res);
      if (result.token) {
        setStoredToken(result.token);
      }
      return result;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        throw new Error('Unable to connect to the backend server. The server may be waking up from sleep. Please try again in 30 seconds.');
      }
      throw err;
    }
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ user: User; token?: string }>(res);
      if (result.token) {
        setStoredToken(result.token);
      }
      return result;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message?.includes('fetch')) {
        throw new Error('Unable to connect to the backend server. The server may be waking up from sleep. Please try again in 30 seconds.');
      }
      throw err;
    }
  },

  async logout(): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      });
      return await handleResponse<{ message: string }>(res);
    } finally {
      setStoredToken(null);
    }
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
    const token = getStoredToken();
    if (token) params.append('token', token);
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
