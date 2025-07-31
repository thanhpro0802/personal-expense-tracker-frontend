import { useState, createContext, ReactNode, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authAPI } from '../services/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

// Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
    register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken, removeToken] = useLocalStorage<string | null>(STORAGE_KEYS.TOKEN, null);
    const [user, setUser, removeUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, [token]);

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
        } catch (error: any) {
            return { success: false, message: error.message || 'Network error' };
        } finally {
            // Không setIsLoading(false) ở đây nữa vì useEffect sẽ xử lý
        }
    };

    // --- SỬA LỖI Ở ĐÂY ---
    // Hoàn thiện hàm register để trả về đúng kiểu dữ liệu
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
    // --- KẾT THÚC SỬA LỖI ---

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
        register, // Bây giờ hàm này đã đúng kiểu
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}