/**
 * Real-backend API service
 * Đổi mock → fetch thật
 */

import {
    User, Transaction, LoginCredentials, RegisterCredentials,
    TransactionFormData, DashboardStats, ApiResponse, TransactionFilters, PaginatedTransactions,
    LoginResponse, RefreshTokenRequest, RefreshTokenResponse,
    RecurringTransaction,
    Budget,
    BudgetDTO,
    Wallet,
    WalletMember,
    CreateWalletRequest,
    InviteMemberRequest
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/* -------------------------------------------------
   Helper: baseURL & auth header
-------------------------------------------------- */
const API_BASE = 'http://localhost:8081';

// ---- Helpers ----
function isAuthEndpoint(endpoint: string) {
    return endpoint.startsWith('/api/auth/');
}

function isLikelyJwt(token?: string | null) {
    return !!token && token.split('.').length === 3;
}

function decodeJwtExp(accessToken: string): number | null {
    try {
        const [, payload] = accessToken.split('.');
        if (!payload) return null;
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        // exp là epoch seconds
        return typeof json.exp === 'number' ? json.exp : null;
    } catch {
        return null;
    }
}

function computeExpiresInSecondsFromJwt(accessToken: string): number {
    const nowSec = Math.floor(Date.now() / 1000);
    const exp = decodeJwtExp(accessToken);
    if (!exp) {
        // fallback an toàn: 15 phút
        return 15 * 60;
    }
    // đảm bảo tối thiểu 60s để tránh jitter
    return Math.max(60, exp - nowSec);
}

// Parse JSON an toàn (tránh "Unexpected end of JSON input")
async function parseJsonSafe<T = any>(res: Response): Promise<T | null> {
    const ct = res.headers.get('content-type') || '';
    const text = await res.text(); // luôn đọc text trước
    if (!text) return null;
    if (!ct.includes('application/json')) return null;
    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

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
        const n = expiry ? parseInt(expiry, 10) : NaN;
        return Number.isFinite(n) ? n : null;
    }

    static setTokens(accessToken: string, refreshToken: string, expiresInSeconds: number): void {
        const expiryTime = Date.now() + (expiresInSeconds * 1000);
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(expiryTime));
        // Back-compat
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    }

    // Tiện ích khi backend không trả expiresIn
    static setTokensFromJwt(accessToken: string, refreshToken: string): void {
        const expIn = computeExpiresInSecondsFromJwt(accessToken);
        this.setTokens(accessToken, refreshToken, expIn);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await parseJsonSafe<RefreshTokenResponse>(response);
            if (!data || !data.accessToken) {
                throw new Error('Invalid refresh response');
            }

            // Backend hiện không trả expiresIn → tính từ JWT exp
            const newAccess = data.accessToken;
            const newRefresh = (data as any).refreshToken || refreshToken; // server trả lại refresh cũ
            this.setTokensFromJwt(newAccess, newRefresh);
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
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // Try to get access token, refresh if needed (except for auth endpoints)
    let token = TokenManager.getAccessToken();

    if (token && TokenManager.isTokenExpired() && !isAuthEndpoint(endpoint)) {
        const refreshed = await TokenManager.refreshAccessToken();
        token = refreshed ? TokenManager.getAccessToken() : null;
        if (!token) {
            if (typeof window !== 'undefined') window.location.hash = '#/login';
            throw new Error('Session expired. Please login again.');
        }
    }

    // KHÔNG gắn Authorization cho /api/auth/**
    if (!isAuthEndpoint(endpoint) && isLikelyJwt(token)) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers };

    try {
        const res = await fetch(url, config);
        const data = await parseJsonSafe<T>(res);

        // Handle 401 responses with retry logic (cho endpoint bảo vệ)
        if (res.status === 401 && !isAuthEndpoint(endpoint)) {
            const refreshed = await TokenManager.refreshAccessToken();
            if (refreshed) {
                const newToken = TokenManager.getAccessToken();
                const retryHeaders = new Headers(headers);
                if (isLikelyJwt(newToken)) {
                    retryHeaders.set('Authorization', `Bearer ${newToken}`);
                } else {
                    retryHeaders.delete('Authorization');
                }
                const retryRes = await fetch(url, { ...options, headers: retryHeaders });
                const retryData = await parseJsonSafe<T>(retryRes);
                if (!retryRes.ok) {
                    const msg = (retryData as any)?.message || (retryData as any)?.error || `HTTP ${retryRes.status}: ${retryRes.statusText}`;
                    throw new Error(msg);
                }
                return (retryData as T) ?? ({} as T);
            } else {
                if (typeof window !== 'undefined') window.location.hash = '#/login';
                throw new Error('Session expired. Please login again.');
            }
        }

        if (!res.ok) {
            const msg = (data as any)?.message || (data as any)?.error || `HTTP ${res.status}: ${res.statusText}`;
            throw new Error(msg);
        }
        return (data as T) ?? ({} as T);
    } catch (error) {
        console.error(`Request to ${url} failed:`, error);
        throw error;
    }
};

/* -------------------------------------------------
   Auth endpoints
-------------------------------------------------- */
export const authAPI = {
    // Lưu ý: KHÔNG tự động gắn Authorization ở request()
    login: async (creds: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
        try {
            const data = await request<LoginResponse>('/api/auth/signin', {
                method: 'POST',
                body: JSON.stringify(creds),
            });

            // Backend trả: { token, refreshToken, id, username, email }
            // Tự tính expiresIn từ JWT exp để lưu
            if ((data as any)?.token && (data as any)?.refreshToken) {
                TokenManager.setTokensFromJwt((data as any).token, (data as any).refreshToken);
            }

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

            // Đồng bộ storage nếu gọi trực tiếp
            if ((data as any)?.accessToken) {
                const rt = (data as any)?.refreshToken || TokenManager.getRefreshToken();
                TokenManager.setTokensFromJwt((data as any).accessToken, rt || '');
            }

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
    getTransactions: async (filters?: TransactionFilters, page = 0, size = 10, walletId?: string): Promise<ApiResponse<PaginatedTransactions>> => {
        try {
            const params = new URLSearchParams({
                page: String(page),
                size: String(size),
                ...(filters?.sort && { sort: filters.sort }),
                ...(filters?.type && filters.type !== 'all' && { type: filters.type }),
                ...(filters?.category && { category: filters.category }),
                ...(filters?.search && { search: filters.search }),
                ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
                ...(filters?.dateTo && { dateTo: filters.dateTo }),
                ...(walletId && { walletId }),
            });

            const data = await request<any>(`/api/transactions?${params}`);

            const formattedData: PaginatedTransactions = {
                transactions: data.content,
                totalCount: data.totalElements,
                totalPages: data.totalPages,
            };

            return { success: true, data: formattedData };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load transactions' };
        }
    },

    createTransaction: async (data: TransactionFormData, walletId?: string): Promise<ApiResponse<Transaction>> => {
        try {
            const payload = walletId ? { ...data, walletId } : data;
            const result = await request<Transaction>('/api/transactions', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            return { success: true, data: result };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    updateTransaction: async (id: string, data: TransactionFormData, walletId?: string): Promise<ApiResponse<Transaction>> => {
        try {
            const payload = walletId ? { ...data, walletId } : data;
            const result = await request<Transaction>(`/api/transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
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
    getStats: async (month: number, year: number, walletId?: string): Promise<ApiResponse<DashboardStats>> => {
        try {
            const params = new URLSearchParams({ 
                month: String(month), 
                year: String(year),
                ...(walletId && { walletId })
            });
            const data = await request<ApiResponse<DashboardStats>>(`/api/dashboard/stats?${params}`);
            return data;
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load dashboard stats' };
        }
    },
};

/* -------------------------------------------------
   Budget endpoints
-------------------------------------------------- */
export const budgetAPI = {
    getBudgets: async (month: number, year: number, walletId?: string): Promise<ApiResponse<BudgetDTO[]>> => {
        try {
            const params = new URLSearchParams({ 
                month: String(month), 
                year: String(year),
                ...(walletId && { walletId })
            });
            const data = await request<BudgetDTO[]>(`/api/budgets?${params}`);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load budgets' };
        }
    },

    createOrUpdateBudget: async (budgetData: Budget, walletId?: string): Promise<ApiResponse<Budget>> => {
        try {
            const payload = walletId ? { ...budgetData, walletId } : budgetData;
            const data = await request<Budget>('/api/budgets', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to save budget' };
        }
    },

    deleteBudget: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        try {
            const data = await request<{ message: string }>(`/api/budgets/${id}`, {
                method: 'DELETE',
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to delete budget' };
        }
    },
};

/* -------------------------------------------------
   Recurring Transaction endpoints (Bản cập nhật)
-------------------------------------------------- */
export const recurringTransactionAPI = {
    getAll: async (walletId?: string): Promise<ApiResponse<RecurringTransaction[]>> => {
        try {
            const params = walletId ? `?walletId=${walletId}` : '';
            const data = await request<RecurringTransaction[]>(`/api/recurring-transactions${params}`);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load recurring transactions' };
        }
    },

    create: async (transactionData: Omit<RecurringTransaction, 'id'>, walletId?: string): Promise<ApiResponse<RecurringTransaction>> => {
        try {
            const payload = walletId ? { ...transactionData, walletId } : transactionData;
            const data = await request<RecurringTransaction>('/api/recurring-transactions', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to create recurring transaction' };
        }
    },

    update: async (id: string, transactionData: Partial<RecurringTransaction>, walletId?: string): Promise<ApiResponse<RecurringTransaction>> => {
        try {
            const payload = walletId ? { ...transactionData, walletId } : transactionData;
            const data = await request<RecurringTransaction>(`/api/recurring-transactions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to update recurring transaction' };
        }
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
        try {
            // Backend trả về 204 No Content, nên kiểu dữ liệu là void
            await request<void>(`/api/recurring-transactions/${id}`, {
                method: 'DELETE',
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to delete recurring transaction' };
        }
    },
};

/* -------------------------------------------------
   Wallet endpoints
-------------------------------------------------- */
export const walletAPI = {
    // Get all wallets for current user
    getWallets: async (): Promise<ApiResponse<Wallet[]>> => {
        try {
            const data = await request<Wallet[]>('/api/wallets');
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load wallets' };
        }
    },

    // Get wallet by ID
    getWallet: async (id: string): Promise<ApiResponse<Wallet>> => {
        try {
            const data = await request<Wallet>(`/api/wallets/${id}`);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load wallet' };
        }
    },

    // Create new wallet
    createWallet: async (walletData: CreateWalletRequest): Promise<ApiResponse<Wallet>> => {
        try {
            const data = await request<Wallet>('/api/wallets', {
                method: 'POST',
                body: JSON.stringify(walletData),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to create wallet' };
        }
    },

    // Update wallet
    updateWallet: async (id: string, walletData: Partial<CreateWalletRequest>): Promise<ApiResponse<Wallet>> => {
        try {
            const data = await request<Wallet>(`/api/wallets/${id}`, {
                method: 'PUT',
                body: JSON.stringify(walletData),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to update wallet' };
        }
    },

    // Delete wallet
    deleteWallet: async (id: string): Promise<ApiResponse<void>> => {
        try {
            await request<void>(`/api/wallets/${id}`, {
                method: 'DELETE',
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to delete wallet' };
        }
    },

    // Get wallet members
    getWalletMembers: async (walletId: string): Promise<ApiResponse<WalletMember[]>> => {
        try {
            const data = await request<WalletMember[]>(`/api/wallets/${walletId}/members`);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to load wallet members' };
        }
    },

    // Invite member to wallet
    inviteMember: async (inviteData: InviteMemberRequest): Promise<ApiResponse<WalletMember>> => {
        try {
            const data = await request<WalletMember>(`/api/wallets/${inviteData.walletId}/members`, {
                method: 'POST',
                body: JSON.stringify({ usernameOrEmail: inviteData.usernameOrEmail }),
            });
            return { success: true, data };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to invite member' };
        }
    },

    // Remove member from wallet
    removeMember: async (walletId: string, memberId: string): Promise<ApiResponse<void>> => {
        try {
            await request<void>(`/api/wallets/${walletId}/members/${memberId}`, {
                method: 'DELETE',
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to remove member' };
        }
    },
};