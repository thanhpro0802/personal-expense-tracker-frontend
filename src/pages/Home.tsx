import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI } from '../services/api';
import { DashboardStats, ChartData } from '../types';
import { toast } from 'sonner';
import { CATEGORY_COLORS } from '@/utils/constants';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      const response = await dashboardAPI.getStats(month, year);

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to load dashboard data.');
      }

    } catch (err: any) {
      console.error("Dashboard loading error:", err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const changeMonth = (offset: number) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const prepareChartData = (data: { category: string; amount: number }[]): ChartData[] => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      color: CATEGORY_COLORS[item.category] || '#A9A9A9'
    }));
  };

  if (isLoading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
    );
  }

  const recentTransactions = stats?.recentTransactions || [];

  return (
      <Layout>
        <div className="space-y-6">
          {/* Header và Bộ chọn tháng */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {/* --- SỬA Ở ĐÂY --- */}
                Here's your financial overview for {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg w-32 text-center">
                    {/* --- SỬA Ở ĐÂY --- */}
                {selectedDate.toLocaleString('en-US', { month: 'long' })}
                </span>
              <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate('/add-transaction')} className="sm:w-auto ml-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
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
                    <p className="text-sm text-muted-foreground">Add expenses this month to see a breakdown.</p>
                  </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <RecentTransactions transactions={recentTransactions} onViewAll={() => navigate('/transactions')} />
            </div>
          </div>
        </div>
      </Layout>
  );
}