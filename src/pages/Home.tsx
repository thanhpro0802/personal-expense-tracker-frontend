/**
 * Dashboard/Home page component with financial overview
 */

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  Loader2 
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI, transactionAPI } from '../services/api';
import { DashboardStats, Transaction } from '../types';
import { toast } from 'sonner';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load stats and recent transactions in parallel
      const [statsResponse, transactionsResponse] = await Promise.all([
        dashboardAPI.getStats(),
        transactionAPI.getTransactions({}, 1, 5)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        toast.error('Failed to load dashboard statistics');
      }

      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.data.transactions);
      } else {
        toast.error('Failed to load recent transactions');
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Navigate to add transaction page
   */
  const goToAddTransaction = () => {
    window.location.hash = '#/add-transaction';
  };

  /**
   * Navigate to transactions page
   */
  const goToTransactions = () => {
    window.location.hash = '#/transactions';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your financial overview for today
            </p>
          </div>
          <Button onClick={goToAddTransaction} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Income"
              value={stats.totalIncome}
              icon={TrendingUp}
              className="border-green-200 dark:border-green-800"
            />
            <StatsCard
              title="Total Expenses"
              value={stats.totalExpenses}
              icon={TrendingDown}
              className="border-red-200 dark:border-red-800"
            />
            <StatsCard
              title="Current Balance"
              value={stats.currentBalance}
              icon={Wallet}
              className={
                stats.currentBalance >= 0 
                  ? "border-blue-200 dark:border-blue-800" 
                  : "border-orange-200 dark:border-orange-800"
              }
            />
          </div>
        )}

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Chart */}
          {stats && stats.monthlyData.length > 0 ? (
            <ExpenseChart 
              data={stats.monthlyData} 
              totalExpenses={stats.totalExpenses} 
            />
          ) : (
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Expense Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start adding transactions to see your spending breakdown
                </p>
                <Button onClick={goToAddTransaction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Transaction
                </Button>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="lg:col-span-1">
            <RecentTransactions 
              transactions={recentTransactions}
              onViewAll={goToTransactions}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={goToAddTransaction} className="justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            <Button variant="outline" onClick={goToTransactions} className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              View All Transactions
            </Button>
            <Button variant="outline" onClick={loadDashboardData} className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              <Wallet className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
