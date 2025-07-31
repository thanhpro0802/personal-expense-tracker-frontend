/**
 * Recent transactions component for dashboard
 */

import { ArrowUpRight, ArrowDownRight, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Transaction } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export default function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  /**
   * Format currency value
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <CardDescription>
            Your latest financial activity
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No transactions yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Add your first transaction to get started
              </p>
            </div>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {/* Transaction Type Icon */}
                  <div className={cn(
                    'p-2 rounded-full',
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Amount */}
                <div className="text-right">
                  <p className={cn(
                    'font-semibold',
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
