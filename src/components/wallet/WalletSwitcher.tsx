/**
 * WalletSwitcher - Dropdown component to switch between wallets
 */

import { useState } from 'react';
import { Check, ChevronDown, Loader2, Briefcase } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export default function WalletSwitcher() {
  const { currentWallet, wallets, isLoading, setCurrentWallet } = useWallet();
  const [open, setOpen] = useState(false);

  const handleWalletSelect = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setCurrentWallet(wallet);
      setOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!currentWallet) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => window.location.hash = '#/wallets'}
      >
        <Briefcase className="h-4 w-4 mr-2" />
        No Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 min-w-[180px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Briefcase className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{currentWallet.name}</span>
            {currentWallet.type === 'SHARED' && (
              <Badge variant="secondary" className="text-xs">Shared</Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Your Wallets
        </div>
        {wallets.map((wallet) => (
          <DropdownMenuItem
            key={wallet.id}
            onClick={() => handleWalletSelect(wallet.id)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentWallet.id === wallet.id && "bg-accent"
            )}
          >
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <span className="truncate">{wallet.name}</span>
              {wallet.type === 'SHARED' && (
                <Badge variant="secondary" className="text-xs">Shared</Badge>
              )}
            </div>
            {currentWallet.id === wallet.id && (
              <Check className="h-4 w-4 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            window.location.hash = '#/wallets';
          }}
          className="cursor-pointer"
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Manage Wallets
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
