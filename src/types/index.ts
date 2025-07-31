import { CATEGORIES } from "@/utils/constants";

/**
 * Type definitions for the Personal Expense Tracker application
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface TransactionFormData {
  title: string;
  amount: string;
  date: string;
  category: string;
  type: 'income' | 'expense' ;
}

export interface TransactionFilters {
  category?: string;
  type?: 'income' | 'expense' | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlyData: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
