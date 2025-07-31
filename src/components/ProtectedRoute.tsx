import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';

// Component này sẽ:
// 1. Kiểm tra trạng thái đăng nhập từ AuthContext.
// 2. Nếu đã đăng nhập (isAuthenticated = true), nó sẽ render các component con (thông qua <Outlet />).
// 3. Nếu chưa đăng nhập, nó sẽ chuyển hướng người dùng về trang "/login".
export const ProtectedRoute = () => {
    const context = useContext(AuthContext);

    // Dòng này sẽ chạy MỖI KHI một route được bảo vệ sắp được render
    console.log('7. [ProtectedRoute] - Đang kiểm tra quyền truy cập...');

    if (!context) {
        console.error('ProtectedRoute không tìm thấy AuthContext!');
        return <Navigate to="/login" />;
    }

    const { isAuthenticated, isLoading } = context;

    // Log ra trạng thái mà ProtectedRoute "nhìn" thấy
    console.log('8. [ProtectedRoute] - Trạng thái hiện tại:', { isAuthenticated, isLoading });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        console.warn('9. [ProtectedRoute] - KHÔNG được xác thực! Đang chuyển hướng về /login.');
        return <Navigate to="/login" />;
    }

    console.log('10. [ProtectedRoute] - ĐÃ được xác thực! Cho phép render trang.');
    return <Outlet />;
};