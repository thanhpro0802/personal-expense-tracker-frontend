/**
 * Real-backend API service
 * Đổi mock → fetch thật
 */

import {
    User, Transaction, LoginCredentials, RegisterCredentials,
    TransactionFormData, DashboardStats, ApiResponse, TransactionFilters, PaginatedTransactions
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/* -------------------------------------------------
   Helper: baseURL & auth header
-------------------------------------------------- */
const API_BASE = 'http://localhost:8081';

const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers };

    try {
        const res = await fetch(url, config);
        const data = await res.json();

        if (!res.ok) {
            // Cố gắng lấy message lỗi từ response của backend
            const errorMessage = (data as any)?.message || (data as any)?.error || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error(`Request to ${url} failed:`, error);
        throw error;
    }
};

/* -------------------------------------------------
   Auth endpoints
-------------------------------------------------- */
export const authAPI = {
    login: async (creds: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
        try {
            const data = await request<{ user: User; token: string }>('/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify(creds),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    register: async (creds: RegisterCredentials): Promise<ApiResponse<{ message: string }>> => {
        try {
            const data = await request<{ message: string }>('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify(creds),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },
};

/* -------------------------------------------------
   Transaction endpoints
-------------------------------------------------- */
export const transactionAPI = {
    // --- SỬA LỖI Ở ĐÂY ---
    getTransactions: async (filters?: TransactionFilters, page = 0, size = 10): Promise<ApiResponse<PaginatedTransactions>> => {
        try {
            // Đổi tên tham số từ 'limit' -> 'size' để khớp với backend
            const params = new URLSearchParams({
                page: String(page),
                size: String(size), // <-- SỬA LỖI QUAN TRỌNG NHẤT
                // Giữ lại logic filter
                ...(filters?.sort && { sort: filters.sort }),
                ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
                ...(filters?.category && { category: filters.category }),
                ...(filters?.search && { search: filters.search }),
                ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters?.dateTo && { dateTo: filters.dateTo }),
            });

            // Backend trả về đối tượng Page của Spring, có cấu trúc content, totalPages, totalElements
            const data = await request<any>(`/api/transactions?${params}`);

            // Chuyển đổi cấu trúc trả về của Spring Page thành cấu trúc mà frontend mong đợi
            const formattedData: PaginatedTransactions = {
                transactions: data.content,
                totalCount: data.totalElements,
                totalPages: data.totalPages,
            };

            return {
                success: true,
                data: formattedData,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to load transactions',
            };
        }
    },

    createTransaction: async (data: TransactionFormData): Promise<ApiResponse<Transaction>> => {
        try {
            const result = await request<Transaction>('/api/transactions', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    updateTransaction: async (id: string, data: TransactionFormData): Promise<ApiResponse<Transaction>> => {
        try {
            const result = await request<Transaction>(`/api/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    deleteTransaction: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        try {
            const result = await request<{ message: string }>(`/api/transactions/${id}`, {
                method: 'DELETE',
            });
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },
};

/* -------------------------------------------------
   Dashboard endpoints
-------------------------------------------------- */
export const dashboardAPI = {
    getStats: () => request<ApiResponse<DashboardStats>>('/api/dashboard/stats'),
};