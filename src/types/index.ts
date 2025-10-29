import { CATEGORIES } from "@/utils/constants";

// --- ĐỊNH NGHĨA KIỂU CATEGORY ĐÃ ĐƯỢC SỬA LỖI ---
export type Category = typeof CATEGORIES[number];

/**
 * Type definitions for the Personal Expense Tracker application
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Định nghĩa cấu trúc dữ liệu cho một Transaction.
 */
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: Category;
  type: 'income' | 'expense';
  description?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
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
  username:string;
  password: string;
  confirmPassword: string;
}

export interface TransactionFormData {
  title: string;
  amount: string;
  date: string;
  category: Category | '';
  type: 'income' | 'expense' ;
}

/**
 * Định nghĩa các bộ lọc có thể có khi lấy danh sách giao dịch.
 */
export interface TransactionFilters {
  search?: string;
  type?: 'all' | 'income' | 'expense';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}

/**
 * Định nghĩa cấu trúc thống kê cho Dashboard.
 */
export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
  expenseByCategory: {
    category: string;
    amount: number;
  }[];
  recentTransactions: Transaction[]; // <-- THÊM DÒNG NÀY ĐỂ SỬA LỖI
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Định nghĩa cấu trúc dữ liệu trả về từ API khi lấy danh sách giao dịch có phân trang.
 */
export interface PaginatedTransactions {
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
}

export interface ChartData {
  category: string;
  amount: number;
  color: string;
}

// Refresh Token Authentication Types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface Budget {
  id?: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetDTO {
  id: string;
  category: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  month: number;
  year: number;
}

// Thêm các type cho Recurring Transaction
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: Frequency;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  isActive: boolean;
  nextExecutionDate?: string;
}