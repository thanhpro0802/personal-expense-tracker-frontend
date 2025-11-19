/**
 * Main layout component that wraps authenticated pages
 */

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import ChatAssistant from '../ChatAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  // Track current path from hash
  useEffect(() => {
    const updatePath = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentPath(hash);
    };
    
    updatePath();
    window.addEventListener('hashchange', updatePath);
    return () => window.removeEventListener('hashchange', updatePath);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#/login';
    }
  }, [isAuthenticated]);

  /**
   * Handle navigation
   */
  const handleNavigate = (path: string) => {
    window.location.hash = `#${path}`;
  };

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}
