/**
 * Application constants and configuration
 */

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Income',
  'Other'
];
export type Category = typeof CATEGORIES[number];
export const CATEGORY_COLORS: { [key: string]: string } = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Bills & Utilities': '#FFEAA7',
  'Healthcare': '#DDA0DD',
  'Education': '#98D8C8',
  'Travel': '#F7DC6F',
  'Income': '#6BCF7F',
  'Other': '#95A5A6'
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  TRANSACTIONS: '/api/transactions',
  DASHBOARD_STATS: '/api/dashboard/stats'
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'expense_tracker_token',
  USER: 'expense_tracker_user'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
} as const;
