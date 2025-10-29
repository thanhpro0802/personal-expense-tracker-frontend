/**
 * Sidebar navigation component
 */

import {
  LayoutDashboard,
  Plus,
  History,
  X,
  Wallet, // Icon cho Ngân sách
  Repeat, // Icon cho Giao dịch định kỳ
  Briefcase, // Icon cho Ví
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Cập nhật danh sách điều hướng
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Add Transaction',
    path: '/add-transaction',
    icon: Plus,
  },
  {
    label: 'Transaction History',
    path: '/transactions',
    icon: History,
  },
  // --- MỤC MỚI ĐƯỢC THÊM ---
  {
    label: 'Budgets',
    path: '/budgets',
    icon: Wallet,
  },
  {
    label: 'Recurring',
    path: '/recurring-transactions',
    icon: Repeat,
  },
  {
    label: 'Wallets',
    path: '/wallets',
    icon: Briefcase,
  },
];

export default function Sidebar({ isOpen, onClose, currentPath, onNavigate }: SidebarProps) {
  /**
   * Handle navigation item click
   */
  const handleNavClick = (path: string) => {
    onNavigate(path);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
      <>
        {/* Overlay for mobile */}
        {isOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={onClose}
            />
        )}

        {/* Sidebar */}
        <aside
            className={cn(
                'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out',
                'w-64 md:relative md:translate-x-0',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                  <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn('w-full justify-start text-left h-11', isActive && 'bg-primary text-white')}
                      onClick={() => handleNavClick(item.path)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
              );
            })}
          </nav>
        </aside>
      </>
  );
}