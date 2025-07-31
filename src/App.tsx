import { HashRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthProvider';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import { ProtectedRoute } from './components/ProtectedRoute'; // <-- IMPORT COMPONENT MỚI

export default function App() {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    {/* --- CÁC ROUTE CÔNG KHAI --- */}
                    {/* Người dùng có thể truy cập mà không cần đăng nhập */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* --- CÁC ROUTE ĐƯỢC BẢO VỆ --- */}
                    {/* Bọc tất cả các route cần bảo vệ trong một Route cha sử dụng ProtectedRoute */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/add-transaction" element={<AddTransaction />} />
                        <Route path="/transactions" element={<Transactions />} />
                        {/* Thêm các route cần bảo vệ khác vào đây */}
                    </Route>

                    {/* Có thể thêm một route "catch-all" để xử lý các URL không tồn tại */}
                    <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
            </HashRouter>

            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
            />
        </AuthProvider>
    );
}