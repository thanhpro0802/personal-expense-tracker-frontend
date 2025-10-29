import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Edit, Trash2, Loader2, Repeat, CalendarIcon, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { recurringTransactionAPI } from '@/services/api';
import { RecurringTransaction, Frequency, Category } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/utils/constants';

const RecurringTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentWallet } = useWallet();

    // State for modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<RecurringTransaction | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await recurringTransactionAPI.getAll(currentWallet?.id);
            if (response.success && response.data) {
                setTransactions(response.data);
            } else {
                throw new Error(response.message || 'Failed to load recurring transactions.');
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentWallet]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleOpenModal = (transaction: RecurringTransaction | null = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    // --- HÀM MỚI ĐỂ BẬT/TẮT QUY LUẬT ---
    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        // Cập nhật giao diện ngay lập tức để người dùng thấy thay đổi
        setTransactions(prev =>
            prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t)
        );

        try {
            // Gọi API để cập nhật backend
            const response = await recurringTransactionAPI.update(id, { isActive: !currentStatus }, currentWallet?.id);
            if (!response.success) {
                throw new Error(response.message || 'Failed to update status.');
            }
            toast.success(`Rule status updated successfully!`);
        } catch (err: any) {
            // Nếu có lỗi, hoàn tác lại thay đổi trên giao diện và báo lỗi
            toast.error(err.message);
            setTransactions(prev =>
                prev.map(t => t.id === id ? { ...t, isActive: currentStatus } : t)
            );
        }
    };

    const handleDelete = async () => {
        if (!transactionToDelete) return;
        setIsSubmitting(true);
        try {
            const response = await recurringTransactionAPI.delete(transactionToDelete.id!);
            if (response.success) {
                toast.success('Recurring transaction rule deleted successfully!');
                setTransactionToDelete(null);
                fetchTransactions(); // Refresh list
            } else {
                throw new Error(response.message || 'Failed to delete.');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const TransactionForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
        const [formData, setFormData] = useState({
            title: editingTransaction?.title || '',
            amount: editingTransaction?.amount || 0,
            category: (editingTransaction?.category as Category) || '',
            type: editingTransaction?.type || 'expense',
            frequency: editingTransaction?.frequency || 'MONTHLY',
            startDate: editingTransaction?.startDate ? parseISO(editingTransaction.startDate) : new Date(),
            endDate: editingTransaction?.endDate ? parseISO(editingTransaction.endDate) : undefined,
            isActive: editingTransaction ? editingTransaction.isActive : true,
        });

        const handleFormSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            const submissionData = {
                ...formData,
                startDate: format(formData.startDate, 'yyyy-MM-dd'),
                endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
            };

            try {
                const response = editingTransaction
                    ? await recurringTransactionAPI.update(editingTransaction.id!, submissionData, currentWallet?.id)
                    : await recurringTransactionAPI.create(submissionData, currentWallet?.id);

                if (response.success) {
                    toast.success(`Rule ${editingTransaction ? 'updated' : 'created'} successfully!`);
                    onSuccess();
                } else {
                    throw new Error(response.message || 'An error occurred.');
                }
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v: Category) => setFormData({...formData, category: v})}>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(v: 'income' | 'expense') => setFormData({...formData, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(v: Frequency) => setFormData({...formData, frequency: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.startDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(formData.startDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.startDate} onSelect={d => setFormData({...formData, startDate: d!})} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.endDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? format(formData.endDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.endDate} onSelect={d => setFormData({...formData, endDate: d})} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                <div className="col-span-2 flex items-center space-x-2 mt-4">
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
                    <Label htmlFor="isActive">Rule is Active</Label>
                </div>
                <DialogFooter className="col-span-2 mt-4">
                    <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Rule
                    </Button>
                </DialogFooter>
            </form>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
                        <p className="text-muted-foreground">Automate your regular income and expenses.</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Rule
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin" /></div>
                ) : error ? (
                    <Card className="flex flex-col items-center justify-center py-20">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                        <h3 className="mt-4 text-lg font-semibold">Failed to load data</h3>
                        <p className="text-muted-foreground">{error}</p>
                    </Card>
                ) : transactions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transactions.map((item) => (
                            <Card key={item.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                                    {/* --- SỬA LỖI Ở ĐÂY: Xóa `disabled` và thêm `onCheckedChange` --- */}
                                    <Switch
                                        checked={item.isActive}
                                        onCheckedChange={() => handleToggleActive(item.id!, item.isActive)}
                                        className="mt-1"
                                    />
                                </CardHeader>
                                <CardContent>
                                    <p className={cn("text-2xl font-bold", item.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                                        {formatCurrency(item.amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <Repeat className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>{item.frequency.charAt(0) + item.frequency.slice(1).toLowerCase()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Next run: {item.nextExecutionDate ? format(parseISO(item.nextExecutionDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}><Edit className="h-4 w-4 mr-1"/> Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setTransactionToDelete(item)}><Trash2 className="h-4 w-4 mr-1"/> Delete</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20">
                        <h3 className="text-lg font-medium">No Recurring Rules Found</h3>
                        <p className="text-muted-foreground mb-4">Click "Add New Rule" to automate your finances.</p>
                        <Button onClick={() => handleOpenModal()}><Plus className="mr-2 h-4 w-4" /> Add Your First Rule</Button>
                    </Card>
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>{editingTransaction ? 'Edit Recurring Rule' : 'Create New Recurring Rule'}</DialogTitle>
                            <DialogDescription>Set up a transaction that repeats on a schedule.</DialogDescription>
                        </DialogHeader>
                        <TransactionForm onSuccess={() => { handleCloseModal(); fetchTransactions(); }} />
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the recurring rule for "{transactionToDelete?.title}". This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
};

export default RecurringTransactionsPage;