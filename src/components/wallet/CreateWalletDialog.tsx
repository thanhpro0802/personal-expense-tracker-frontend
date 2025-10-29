/**
 * CreateWalletDialog - Modal dialog for creating new wallets
 */

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';
import { walletAPI } from '../../services/api';
import { WalletType } from '../../types';
import { useWallet } from '../../contexts/WalletContext';

export default function CreateWalletDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('PERSONAL');
  const { refreshWallets } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await walletAPI.createWallet({
        name: walletName.trim(),
        type: walletType,
      });

      if (response.success) {
        toast.success('Wallet created successfully!');
        setOpen(false);
        setWalletName('');
        setWalletType('PERSONAL');
        await refreshWallets();
      } else {
        toast.error(response.message || 'Failed to create wallet');
      }
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      toast.error(error.message || 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Wallet</DialogTitle>
          <DialogDescription>
            Create a personal wallet or a shared wallet to manage expenses with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wallet-name">Wallet Name</Label>
              <Input
                id="wallet-name"
                placeholder="e.g., Personal Expenses, Family Budget"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label>Wallet Type</Label>
              <RadioGroup
                value={walletType}
                onValueChange={(value) => setWalletType(value as WalletType)}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="PERSONAL" id="personal" />
                  <Label htmlFor="personal" className="flex-1 cursor-pointer">
                    <div className="font-medium">Personal</div>
                    <div className="text-xs text-muted-foreground">
                      Only you can access this wallet
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="SHARED" id="shared" />
                  <Label htmlFor="shared" className="flex-1 cursor-pointer">
                    <div className="font-medium">Shared</div>
                    <div className="text-xs text-muted-foreground">
                      Invite others to manage expenses together
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
