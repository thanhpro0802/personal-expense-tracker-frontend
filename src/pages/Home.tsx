import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, transactionAPI } from '../services/api';
import { DashboardStats, Transaction, ChartData } from '../types';
import { toast } from 'sonner';
import { CATEGORY_COLORS } from '@/utils/constants';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Promise.all vẫn là cách tốt nhất để gọi đồng thời
      const [statsResponse, transactionsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        transactionAPI.getTransactions({ sort: 'date,desc' }, 0, 5)
      ]);

      // --- SỬA LỖI LOGIC QUAN TRỌNG NHẤT TẠI ĐÂY ---
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data); // Lấy `data` từ bên trong response
      } else {
        throw new Error(statsResponse.message || 'Failed to load dashboard statistics.');
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        // Backend trả về cấu trúc PaginatedTransactions, cần lấy `transactions` từ bên trong
        setRecentTransactions(transactionsResponse.data.transactions ?? []);
      } else {
        throw new Error(transactionsResponse.message || 'Failed to load recent transactions.');
      }

    } catch (err: any) {
      console.error("Dashboard loading error:", err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (data: { category: string; amount: number }[]): ChartData[] => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      color: CATEGORY_COLORS[item.category] || '#A9A9A9'
    }));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Phần JSX còn lại không cần thay đổi
  if (isLoading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your financial overview for today
              </p>
            </div>
            <Button onClick={() => window.location.hash = '#/add-transaction'} className="sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total Income" value={stats.totalIncome} icon={TrendingUp} />
                <StatsCard title="Total Expenses" value={stats.totalExpenses} icon={TrendingDown} />
                <StatsCard title="Current Balance" value={stats.currentBalance} icon={Wallet} />
              </div>
          ) : (
              error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Statistics Unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {stats && stats.expenseByCategory && stats.expenseByCategory.length > 0 ? (
                  <ExpenseChart data={prepareChartData(stats.expenseByCategory)} totalExpenses={stats.totalExpenses} />
              ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 text-center h-full flex flex-col justify-center">
                    <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Expense Data</h3>
                    <p className="text-sm text-muted-foreground">Add expenses to see a breakdown.</p>
                  </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <RecentTransactions transactions={recentTransactions} onViewAll={() => window.location.hash = '#/transactions'} />
            </div>
          </div>
        </div>
      </Layout>
  );
}