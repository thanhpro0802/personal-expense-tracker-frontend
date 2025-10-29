import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { budgetAPI } from '../services/api';
import { Budget, BudgetDTO } from '../types';
import { useBudgets } from '../contexts/BudgetContext';
import { useWallet } from '../contexts/WalletContext';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

const BudgetsPage: React.FC = () => {
    const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Partial<BudgetDTO> | null>(null);
    const [deleteBudget, setDeleteBudget] = useState<BudgetDTO | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [formState, setFormState] = useState({ category: '', amount: '' });
    const { budgetsVersion } = useBudgets();
    const { currentWallet } = useWallet();

    const fetchBudgets = useCallback(async () => {
        setLoading(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            const response = await budgetAPI.getBudgets(month, year, currentWallet?.id);
            if (response.success && response.data) {
                setBudgets(response.data);
            } else {
                toast.error(response.message || 'Failed to load budgets.');
            }
        } catch (error) {
            toast.error('An error occurred while fetching budgets.');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, currentWallet]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets, budgetsVersion]);

    const handleOpenModal = (budget: Partial<BudgetDTO> | null = null) => {
        setEditingBudget(budget);
        if (budget) {
            setFormState({ category: budget.category || '', amount: String(budget.amount || '') });
        } else {
            setFormState({ category: '', amount: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
    };

    const handleFormChange = (field: 'category' | 'amount', value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleFinish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.category || !formState.amount || parseFloat(formState.amount) <= 0) {
            toast.error('Please fill in all fields with valid values.');
            return;
        }

        setIsSubmitting(true);
        const budgetData: Budget = {
            id: editingBudget?.id,
            category: formState.category,
            amount: parseFloat(formState.amount),
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
        };

        try {
            const response = await budgetAPI.createOrUpdateBudget(budgetData, currentWallet?.id);
            if (response.success) {
                toast.success(editingBudget ? 'Budget updated successfully!' : 'Budget created successfully!');
                handleCloseModal();
                fetchBudgets(); // Refresh list
            } else {
                toast.error(response.message || 'An error occurred.');
            }
        } catch (error) {
            toast.error('A network error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteBudget) return;
        setIsSubmitting(true);
        try {
            const response = await budgetAPI.deleteBudget(String(deleteBudget.id));
            if (response.success) {
                toast.success('Budget deleted successfully!');
                setDeleteBudget(null);
                fetchBudgets(); // Refresh list
            } else {
                toast.error(response.message || 'Failed to delete budget.');
            }
        } catch (error) {
            toast.error('A network error occurred while deleting.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const changeMonth = (offset: number) => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const budgetCategories = CATEGORIES.filter(cat => cat !== 'Income');

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Budgets Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track your spending against your monthly budgets.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-lg w-40 text-center">
                             {/* --- SỬA Ở ĐÂY --- */}
                            {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleOpenModal()} className="ml-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Budget
                        </Button>
                    </div>
                </div>

                {/* Budgets List */}
                <Card>
                    <CardHeader>
                        {/* --- SỬA Ở ĐÂY --- */}
                        <CardTitle>Budgets for {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : budgets.length > 0 ? (
                            <div className="space-y-4">
                                {budgets.map((item) => (
                                    <div key={item.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{item.category}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Budget: {formatCurrency(item.amount)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteBudget(item)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 dark:text-gray-400">Spent: {formatCurrency(item.spentAmount)}</span>
                                                <span className={`font-medium ${item.remainingAmount >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-red-500'}`}>
                                                    Remaining: {formatCurrency(item.remainingAmount)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={item.amount > 0 ? (item.spentAmount / item.amount) * 100 : 0}
                                                className={item.remainingAmount < 0 ? "progress-red" : ""}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium mb-2">No Budgets Found</h3>
                                <p className="text-gray-500 mb-4">Get started by adding a budget for this month.</p>
                                <Button onClick={() => handleOpenModal()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Budget
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
                            <DialogDescription>
                                Set a spending limit for a category this month.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFinish}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formState.category}
                                        onValueChange={(value) => handleFormChange('category', value)}
                                        disabled={!!editingBudget} // Cannot change category when editing
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {budgetCategories.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="e.g., 500.00"
                                        value={formState.amount}
                                        onChange={(e) => handleFormChange('amount', e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deleteBudget} onOpenChange={() => setDeleteBudget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the budget for "{deleteBudget?.category}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
};

export default BudgetsPage;