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
   * Custom tooltip with Glassmorphism style
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
      
      return (
        <div className="backdrop-blur-md bg-background/95 border border-border rounded-lg shadow-xl p-3">
          <p className="font-semibold text-foreground mb-1">
            {data.payload.category}
          </p>
          <p className="text-sm text-muted-foreground">
            Amount: ${data.value.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
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
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    paddingAngle={2}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
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
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    opacity={0.3}
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
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
              <span className="text-sm text-muted-foreground truncate">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
