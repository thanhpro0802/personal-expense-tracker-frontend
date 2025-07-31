// src/contexts/AuthProvider.tsx
import { useState, createContext, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authAPI } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
    register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken, removeToken] = useLocalStorage<string | null>(STORAGE_KEYS.TOKEN, null);
    const [user, setUser, removeUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);
    const [isLoading, setIsLoading] = useState(false);

    const isAuthenticated = !!(token && user);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await authAPI.login(credentials);
            if (response.success && response.data) {
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        setIsLoading(true);
        try {
            const response = await authAPI.register(credentials);
            if (response.success) {
                return { success: true, message: 'Registration successful! Please login.' };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        removeToken();
        removeUser();
    };

    const value: AuthContextType = {
        user,
        token,
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