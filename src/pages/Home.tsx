import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { dashboardAPI } from '../services/api';
import { DashboardStats } from '../types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

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

  if (isLoading) {
    return (
        <AuroraBackground>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        </AuroraBackground>
    );
  }

  const recentTransactions = stats?.recentTransactions || [];

  return (
      <AuroraBackground className="min-h-screen">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Transparent Navbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-white/80 mt-1">
                Here's your financial overview for {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => changeMonth(-1)}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg w-32 text-center text-white">
                {selectedDate.toLocaleString('en-US', { month: 'long' })}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => changeMonth(1)}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => navigate('/add-transaction')} 
                className="sm:w-auto ml-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/70">Total Income</p>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(stats.totalIncome)}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/20 backdrop-blur-sm">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/70">Total Expenses</p>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(stats.totalExpenses)}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/20 backdrop-blur-sm">
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/70">Current Balance</p>
                      <div className="mt-2 flex items-baseline">
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(stats.currentBalance)}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500/20 backdrop-blur-sm">
                      <Wallet className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </GlassCard>
              </div>
          ) : (
              error && (
                <GlassCard className="p-6">
                  <Alert variant="destructive" className="bg-transparent border-red-500/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Statistics Unavailable</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </GlassCard>
              )
          )}

          {/* Recent Transactions */}
          <GlassCard className="p-6">
            <div className="flex flex-row items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
                <p className="text-white/60 text-sm mt-1">Your latest financial activity</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/transactions')}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60">No transactions yet</p>
                  <p className="text-sm text-white/40">Add your first transaction to get started</p>
                </div>
              ) : (
                recentTransactions.slice(0, 5).map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-full backdrop-blur-sm',
                        transaction.type === 'income' 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      )}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {transaction.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-semibold',
                        transaction.type === 'income' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </AuroraBackground>
  );
}