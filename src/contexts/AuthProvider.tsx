import { useState, createContext, ReactNode, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authAPI, TokenManager } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

// Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
    register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Use new storage keys for refresh token system
    const [token, setToken, removeToken] = useLocalStorage<string | null>(STORAGE_KEYS.ACCESS_TOKEN, null);
    const [refreshToken, setRefreshToken, removeRefreshToken] = useLocalStorage<string | null>(STORAGE_KEYS.REFRESH_TOKEN, null);
    const [user, setUser, removeUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check for legacy token and migrate if needed
    useEffect(() => {
        const legacyToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (legacyToken && !token) {
            // Migrate from legacy single token to new system
            setToken(legacyToken);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
        }
    }, [token, setToken]);

    useEffect(() => {
        if (token && refreshToken) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, [token, refreshToken]);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await authAPI.login(credentials);
            if (response.success && response.data) {
                const { accessToken, refreshToken: newRefreshToken, user: userData, expiresIn } = response.data;
                
                // Store tokens using TokenManager for consistency
                TokenManager.setTokens(accessToken, newRefreshToken, expiresIn);
                
                // Update local state
                setToken(accessToken);
                setRefreshToken(newRefreshToken);
                setUser(userData);
                
                return { success: true };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error: any) {
            return { success: false, message: error.message || 'Network error' };
        } finally {
            // Don't setIsLoading(false) here as useEffect will handle it
        }
    };

    const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; message?: string }> => {
        setIsLoading(true);
        try {
            const response = await authAPI.register(credentials);
            if (response.success) {
                return { success: true, message: 'Registration successful! Please login.' };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error: any) {
            return { success: false, message: error.message || 'Network error' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Call logout API to invalidate refresh token on server
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with local cleanup even if server logout fails
        } finally {
            // Clear local storage and state
            TokenManager.clearTokens();
            removeToken();
            removeRefreshToken();
            removeUser();
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}