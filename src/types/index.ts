import { CATEGORIES } from "@/utils/constants";

// --- ĐỊNH NGHĨA KIỂU CATEGORY ĐÃ ĐƯỢC SỬA LỖI ---
// Lệnh này sẽ tự động tạo ra một kiểu union từ tất cả các chuỗi trong mảng CATEGORIES.
// Ví dụ: nếu CATEGORIES = ['Food', 'Salary'], thì kiểu Category sẽ là 'Food' | 'Salary'
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
  category: Category; // <-- Bây giờ sẽ hoạt động chính xác
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
  username: string;
  password: string;
  confirmPassword: string;
}

export interface TransactionFormData {
  title: string;
  amount: string;
  date: string;
  category: Category | ''; // <-- Cho phép rỗng trong form
  type: 'income' | 'expense' ;
}

/**
 * Định nghĩa các bộ lọc có thể có khi lấy danh sách giao dịch.
 */
export interface TransactionFilters {
  search?: string;
  // Cho phép giá trị 'all' để khớp với Select component
  type?: 'all' | 'income' | 'expense';
  category?: string;
  // Thêm các thuộc tính còn thiếu
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