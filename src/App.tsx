import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthProvider';
import { BudgetContextProvider } from './contexts/BudgetContext';
// Các trang hiện có
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import { ProtectedRoute } from './components/ProtectedRoute';

// --- BƯỚC 1: IMPORT CÁC TRANG MỚI ---
import BudgetsPage from './pages/BudgetsPage';
import RecurringTransactionsPage from './pages/RecurringTransactionsPage';


export default function App() {
    return (
        <AuthProvider>
            <BudgetContextProvider>
            <HashRouter>
                <Routes>
                    {/* --- CÁC ROUTE CÔNG KHAI --- */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* --- CÁC ROUTE ĐƯỢC BẢO VỆ --- */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/add-transaction" element={<AddTransaction />} />
                        <Route path="/transactions" element={<Transactions />} />

                        {/* --- BƯỚC 2: THÊM CÁC ROUTE MỚI VÀO ĐÂY --- */}
                        <Route path="/budgets" element={<BudgetsPage />} />
                        <Route path="/recurring-transactions" element={<RecurringTransactionsPage />} />
                    </Route>

                    {/* Route "Not Found" */}
                    <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
            </HashRouter>

            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
            />
            </BudgetContextProvider>
        </AuthProvider>
    );
}