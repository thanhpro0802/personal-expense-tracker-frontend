/**
 * Real-backend API service
 * Đổi mock → fetch thật
 */

import {
    User, Transaction, LoginCredentials, RegisterCredentials,
    TransactionFormData, DashboardStats, ApiResponse, TransactionFilters, PaginatedTransactions,
    LoginResponse, RefreshTokenRequest, RefreshTokenResponse
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/* -------------------------------------------------
   Helper: baseURL & auth header
-------------------------------------------------- */
const API_BASE = 'http://localhost:8081';

// Token management utilities
export class TokenManager {
    private static refreshPromise: Promise<boolean> | null = null;

    static getAccessToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    static getRefreshToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    static getTokenExpiry(): number | null {
        const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
        return expiry ? parseInt(expiry, 10) : null;
    }

    static setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    }

    static clearTokens(): void {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Also clear old token for backward compatibility
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }

    static isTokenExpired(): boolean {
        const expiry = this.getTokenExpiry();
        if (!expiry) return true;
        // Consider token expired 5 minutes before actual expiry
        return Date.now() > (expiry - 5 * 60 * 1000);
    }

    static async refreshAccessToken(): Promise<boolean> {
        // Prevent multiple concurrent refresh attempts
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.performTokenRefresh();
        const result = await this.refreshPromise;
        this.refreshPromise = null;
        return result;
    }

    private static async performTokenRefresh(): Promise<boolean> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            this.clearTokens();
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/api/auth/refreshtoken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data: RefreshTokenResponse = await response.json();
            this.setTokens(data.accessToken, refreshToken, data.expiresIn);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return false;
        }
    }
}

const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    // Try to get access token, refresh if needed
    let token = TokenManager.getAccessToken();
    
    // Check if token is expired and refresh if needed (except for auth endpoints)
    if (token && TokenManager.isTokenExpired() && !endpoint.includes('/api/auth/')) {
        const refreshed = await TokenManager.refreshAccessToken();
        if (refreshed) {
            token = TokenManager.getAccessToken();
        } else {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
                window.location.hash = '#/login';
            }
            throw new Error('Session expired. Please login again.');
        }
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers };

    try {
        const res = await fetch(url, config);
        const data = await res.json();

        // Handle 401 responses with retry logic
        if (res.status === 401 && !endpoint.includes('/api/auth/')) {
            const refreshed = await TokenManager.refreshAccessToken();
            if (refreshed) {
                // Retry the original request with new token
                const newToken = TokenManager.getAccessToken();
                if (newToken) {
                    headers.set('Authorization', `Bearer ${newToken}`);
                    const retryConfig: RequestInit = { ...options, headers };
                    const retryRes = await fetch(url, retryConfig);
                    const retryData = await retryRes.json();
                    
                    if (!retryRes.ok) {
                        const errorMessage = (retryData as any)?.message || (retryData as any)?.error || `HTTP ${retryRes.status}: ${retryRes.statusText}`;
                        throw new Error(errorMessage);
                    }
                    return retryData;
                }
            } else {
                // Refresh failed, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.hash = '#/login';
                }
                throw new Error('Session expired. Please login again.');
            }
        }

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
    login: async (creds: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
        try {
            const data = await request<LoginResponse>('/api/auth/signin', {
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

    refreshToken: async (refreshTokenReq: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
        try {
            const data = await request<RefreshTokenResponse>('/api/auth/refreshtoken', {
                method: 'POST',
                body: JSON.stringify(refreshTokenReq),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        try {
            const refreshToken = TokenManager.getRefreshToken();
            const data = await request<{ message: string }>('/api/auth/signout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken }),
            });
            TokenManager.clearTokens();
            return { success: true, data };
        } catch (error: any) {
            // Even if logout fails on server, clear local tokens
            TokenManager.clearTokens();
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