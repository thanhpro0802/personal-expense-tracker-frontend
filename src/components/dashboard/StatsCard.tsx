/**
 * Statistics card component for displaying financial metrics
 */

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valuePrefix?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  valuePrefix = '$'
}: StatsCardProps) {
  /**
   * Format currency value
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value < 0 && valuePrefix === '$' ? '-' : ''}
                {valuePrefix}
                {formatCurrency(value)}
              </p>
            </div>
            {trend && (
              <div className="mt-2 flex items-center">
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.isPositive
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '+' : '-'}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  from last month
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-full',
            title.toLowerCase().includes('income') 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : title.toLowerCase().includes('expense')
              ? 'bg-red-100 dark:bg-red-900/20'
              : 'bg-blue-100 dark:bg-blue-900/20'
          )}>
            <Icon className={cn(
              'h-6 w-6',
              title.toLowerCase().includes('income') 
                ? 'text-green-600' 
                : title.toLowerCase().includes('expense')
                ? 'text-red-600'
                : 'text-blue-600'
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
