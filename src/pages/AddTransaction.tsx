/**
 * Add Transaction page component with form validation
 */

import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { transactionAPI } from '../services/api';
import { TransactionFormData } from '../types';
import { CATEGORIES } from '../utils/constants';
import { toast } from 'sonner';
import { Category } from '../utils/constants';
import { useBudgets } from '../contexts/BudgetContext'; // <-- 1. IMPORT HOOK MỚI
import { useWallet } from '../contexts/WalletContext';

export default function AddTransaction() {
  const { triggerBudgetsRefresh } = useBudgets(); // <-- 2. SỬ DỤNG HOOK
  const { currentWallet } = useWallet();

  const [formData, setFormData] = useState<TransactionFormData>({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    category: '',
    type: 'expense'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // ... (hàm validateForm và handleChange không thay đổi)
  const validateForm = (): boolean => {
    const newErrors: Partial<TransactionFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Transaction title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than 0';
      } else if (amount > 1000000) {
        newErrors.amount = 'Amount cannot exceed $1,000,000';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      } else if (selectedDate < oneYearAgo) {
        newErrors.date = 'Date cannot be more than 1 year ago';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    try {
      const response = await transactionAPI.createTransaction(formData, currentWallet?.id);

      if (response.success) {
        toast.success('Transaction added successfully!');

        triggerBudgetsRefresh(); // <-- 3. GỌI HÀM LÀM MỚI TẠI ĐÂY

        // Reset form
        setFormData({
          title: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          type: 'expense'
        });
        // Redirect to home
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Add transaction error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (phần còn lại của component không thay đổi)
  const goBack = () => {
    window.history.back();
  };
  const getFilteredCategories = () => {
    if (formData.type === 'income') {
      return CATEGORIES.filter(cat => cat === 'Income' || cat === 'Other');
    }
    return CATEGORIES.filter(cat => cat !== 'Income');
  };

  return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Transaction
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Record a new income or expense
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Fill in the information for your transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Type */}
                <div className="space-y-3">
                  <Label>Transaction Type</Label>
                  <RadioGroup
                      value={formData.type}
                      onValueChange={(value) => {
                        handleChange('type', value as 'income' | 'expense');
                        // Reset category when type changes
                        if (formData.category && !getFilteredCategories().includes(formData.category as Category)) {
                          handleChange('category', '');
                        }
                      }}
                      className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expense" id="expense" />
                      <Label htmlFor="expense" className="text-red-600">
                        Expense
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="income" id="income" />
                      <Label htmlFor="income" className="text-green-600">
                        Income
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.type && (
                      <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="title"
                      placeholder={`Enter ${formData.type} description`}
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000000"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.amount && (
                      <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                      <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                  >
                    {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                    ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Add Transaction
                        </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Tips for better tracking:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use descriptive titles like "Grocery shopping at Walmart"</li>
                <li>• Choose the most specific category for accurate reports</li>
                <li>• Add transactions regularly to maintain accurate records</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
}