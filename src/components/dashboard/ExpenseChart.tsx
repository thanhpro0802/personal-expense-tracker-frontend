/**
 * Expense chart component using Recharts for data visualization
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CATEGORY_COLORS } from '../../utils/constants';

interface ChartData {
  category: string;
  amount: number;
  color: string;
}

interface ExpenseChartProps {
  data: ChartData[];
  totalExpenses: number;
}

export default function ExpenseChart({ data, totalExpenses }: ExpenseChartProps) {
  /**
   * Custom tooltip for pie chart
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.payload.category}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Amount: ${data.value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  /**
   * Get category color
   */
  const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#95A5A6';
  };

  // Prepare data with proper colors
  const chartData = data.map(item => ({
    ...item,
    color: getCategoryColor(item.category)
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Your expense breakdown for this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pie" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, value }) =>
                        `${category}: $${(value ?? 0).toFixed(0)}`
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="bar" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="category" 
                    className="text-gray-600 dark:text-gray-400"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
