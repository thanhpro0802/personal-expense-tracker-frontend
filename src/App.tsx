/**
 * Main App component with routing and authentication setup
 */

import { HashRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthProvider';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';

export default function App() {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/add-transaction" element={<AddTransaction />} />
                    <Route path="/transactions" element={<Transactions />} />
                </Routes>
            </HashRouter>

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
            />
        </AuthProvider>
    );
}
