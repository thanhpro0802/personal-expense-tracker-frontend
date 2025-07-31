/**
 * Real-backend API service
 * Đổi mock → fetch thật
 */

import {
  User, Transaction, LoginCredentials, RegisterCredentials,
  TransactionFormData, DashboardStats, ApiResponse, TransactionFilters
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/* -------------------------------------------------
   Helper: baseURL & auth header
-------------------------------------------------- */
const API_BASE = 'http://localhost:8081';

const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE}${endpoint}`;

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const config: RequestInit = {
        ...options,
        headers,
    };

    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw new Error((data as any).message || 'Request failed');
    return data;
};


/* -------------------------------------------------
   Auth endpoints
-------------------------------------------------- */
export const authAPI = {
    login: async (creds: LoginCredentials) => {
        try {
            const data = await request<{ user: User; token: string }>('/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify(creds),
            });

            return {
                success: true,
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Login failed',
            };
        }
    },

    register: async (creds: RegisterCredentials) => {
        try {
            const data = await request<{ message: string }>('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(creds),
            });

            return {
                success: true,
                data,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Registration failed',
            };
        }
    },
};


/* -------------------------------------------------
   Transaction endpoints
-------------------------------------------------- */
export const transactionAPI = {
  getTransactions: (filters?: TransactionFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    });

    return request<ApiResponse<{
      transactions: Transaction[];
      totalCount: number;
      totalPages: number;
    }>>(`/transactions?${params}`);
  },

  createTransaction: (data: TransactionFormData) =>
      request<ApiResponse<Transaction>>('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

  updateTransaction: (id: string, data: TransactionFormData) =>
      request<ApiResponse<Transaction>>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

  deleteTransaction: (id: string) =>
      request<ApiResponse<{ message: string }>>(`/transactions/${id}`, {
        method: 'DELETE',
      }),
};

/* -------------------------------------------------
   Dashboard endpoints
-------------------------------------------------- */
export const dashboardAPI = {
  getStats: () =>
      request<ApiResponse<DashboardStats>>('/dashboard/stats'),
};