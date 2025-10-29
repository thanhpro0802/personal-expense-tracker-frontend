/**
 * Wallet Context - Manages current wallet selection and wallet list
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wallet } from '../types';
import { walletAPI } from '../services/api';
import { toast } from 'sonner';

interface WalletContextType {
  currentWallet: Wallet | null;
  wallets: Wallet[];
  isLoading: boolean;
  setCurrentWallet: (wallet: Wallet | null) => void;
  refreshWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWallets = async () => {
    setIsLoading(true);
    try {
      const response = await walletAPI.getWallets();
      if (response.success && response.data) {
        setWallets(response.data);
        
        // Set default wallet if none selected
        if (!currentWallet && response.data.length > 0) {
          // Try to restore from localStorage first
          const savedWalletId = localStorage.getItem('currentWalletId');
          const savedWallet = savedWalletId 
            ? response.data.find(w => w.id === savedWalletId) 
            : null;
          
          // If saved wallet exists, use it; otherwise use first wallet
          setCurrentWallet(savedWallet || response.data[0]);
        }
      } else {
        toast.error(response.message || 'Failed to load wallets');
      }
    } catch (error: any) {
      console.error('Error loading wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setIsLoading(false);
    }
  };

  // Load wallets on mount
  useEffect(() => {
    refreshWallets();
  }, []);

  // Save current wallet to localStorage when it changes
  useEffect(() => {
    if (currentWallet) {
      localStorage.setItem('currentWalletId', currentWallet.id);
    } else {
      localStorage.removeItem('currentWalletId');
    }
  }, [currentWallet]);

  const value: WalletContextType = {
    currentWallet,
    wallets,
    isLoading,
    setCurrentWallet,
    refreshWallets,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
