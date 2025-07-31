/**
 * Transaction History page with search, filter, and pagination
 */

import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Filter,
    Edit,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { transactionAPI } from '../services/api';
import { Transaction, TransactionFilters } from '../types';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency, formatDate, debounce, cn } from '../lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<TransactionFilters>({
        search: '',
        type: 'all',
        category: '',
        dateFrom: '',
        dateTo: ''
    });

    /**
     * Debounced search function
     */
    const debouncedSearch = useMemo(
        () => debounce((searchTerm: string) => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
            setCurrentPage(1);
        }, 500),
        []
    );

    /**
     * Load transactions with current filters and pagination
     */
    const loadTransactions = async () => {
        try {
            setIsLoading(true);
            const response = await transactionAPI.getTransactions(
                filters,
                currentPage,
                PAGE_SIZE
            );

            if (response.success) {
                setTransactions(response.data.transactions);
                setTotalPages(response.data.totalPages);
                setTotalCount(response.data.totalCount);
            } else {
                toast.error('Failed to load transactions');
            }
        } catch (error) {
            console.error('Load transactions error:', error);
            toast.error('Network error while loading transactions');
        } finally {
            setIsLoading(false);
        }
    };

    // Load transactions when filters or page changes
    useEffect(() => {
        loadTransactions();
    }, [filters, currentPage]);

    /**
     * Handle search input change
     */
    const handleSearchChange = (value: string) => {
        debouncedSearch(value);
    };

    /**
     * Handle filter changes
     */
    const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    /**
     * Clear all filters
     */
    const clearFilters = () => {
        setFilters({
            search: '',
            type: 'all',
            category: '',
            dateFrom: '',
            dateTo: ''
        });
        setCurrentPage(1);
    };

    /**
     * Handle transaction deletion
     */
    const handleDeleteConfirm = async () => {
        if (!deleteTransaction) return;

        setIsDeleting(true);
        try {
            const response = await transactionAPI.deleteTransaction(deleteTransaction.id);

            if (response.success) {
                toast.success('Transaction deleted successfully');
                loadTransactions();
            } else {
                toast.error(response.message || 'Failed to delete transaction');
            }
        } catch (error) {
            console.error('Delete transaction error:', error);
            toast.error('Network error while deleting transaction');
        } finally {
            setIsDeleting(false);
            setDeleteTransaction(null);
        }
    };

    /**
     * Navigate to add transaction page
     */
    const goToAddTransaction = () => {
        window.location.hash = '#/add-transaction';
    };

    /**
     * Get transaction type badge variant
     */
    const getTypeBadgeVariant = (type: string) => {
        return type === 'income' ? 'default' : 'secondary';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Transaction History
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {totalCount > 0 ? `${totalCount} transactions found` : 'No transactions found'}
                        </p>
                    </div>
                    <Button onClick={goToAddTransaction}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Filters</CardTitle>
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Search transactions..."
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) => handleFilterChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) => handleFilterChange('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">All Categories</SelectItem>
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                />
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            {currentPage > 1 && (
                                <>Showing page {currentPage} of {totalPages} • </>
                            )}
                            {transactions.length} of {totalCount} transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                                    <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
                                </div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No transactions found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Try adjusting your filters or add a new transaction
                                </p>
                                <Button onClick={goToAddTransaction}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Transaction
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Transaction Icon */}
                                            <div className={cn(
                                                'p-2 rounded-full',
                                                transaction.type === 'income'
                                                    ? 'bg-green-100 dark:bg-green-900/20'
                                                    : 'bg-red-100 dark:bg-red-900/20'
                                            )}>
                                                {transaction.type === 'income' ? (
                                                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>

                                            {/* Transaction Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                        {transaction.title}
                                                    </h3>
                                                    <Badge variant={getTypeBadgeVariant(transaction.type)}>
                                                        {transaction.type}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span>{transaction.category}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(transaction.date)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Transaction Amount */}
                                            <div className="text-right">
                                                <p className={cn(
                                                    'text-lg font-semibold',
                                                    transaction.type === 'income'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                )}>
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-blue-600"
                                                disabled
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-500 hover:text-red-600"
                                                onClick={() => setDeleteTransaction(transaction)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} transactions
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{deleteTransaction?.title}"?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
}
