/**
 * WalletsPage - Main page for managing wallets
 */

import { useState, useEffect } from 'react';
import { Loader2, Briefcase, Users, Trash2, UserX } from 'lucide-react';
import Layout from '../components/layout/Layout';
import CreateWalletDialog from '../components/wallet/CreateWalletDialog';
import InviteMemberDialog from '../components/wallet/InviteMemberDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../hooks/useAuth';
import { walletAPI } from '../services/api';
import { WalletMember } from '../types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export default function WalletsPage() {
  const { wallets, isLoading, refreshWallets, setCurrentWallet } = useWallet();
  const { user } = useAuth();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [members, setMembers] = useState<WalletMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);
  const [removeMemberDialog, setRemoveMemberDialog] = useState<{
    open: boolean;
    walletId: string | null;
    memberId: string | null;
  }>({ open: false, walletId: null, memberId: null });

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const isOwner = selectedWallet?.ownerId === user?.id;

  useEffect(() => {
    if (selectedWalletId) {
      loadMembers(selectedWalletId);
    }
  }, [selectedWalletId]);

  const loadMembers = async (walletId: string) => {
    setLoadingMembers(true);
    try {
      const response = await walletAPI.getWalletMembers(walletId);
      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        toast.error(response.message || 'Failed to load members');
      }
    } catch (error: any) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!walletToDelete) return;

    try {
      const response = await walletAPI.deleteWallet(walletToDelete);
      if (response.success) {
        toast.success('Wallet deleted successfully');
        if (selectedWalletId === walletToDelete) {
          setSelectedWalletId(null);
        }
        await refreshWallets();
      } else {
        toast.error(response.message || 'Failed to delete wallet');
      }
    } catch (error: any) {
      console.error('Error deleting wallet:', error);
      toast.error('Failed to delete wallet');
    } finally {
      setDeleteDialogOpen(false);
      setWalletToDelete(null);
    }
  };

  const handleRemoveMember = async () => {
    const { walletId, memberId } = removeMemberDialog;
    if (!walletId || !memberId) return;

    try {
      const response = await walletAPI.removeMember(walletId, memberId);
      if (response.success) {
        toast.success('Member removed successfully');
        await loadMembers(walletId);
      } else {
        toast.error(response.message || 'Failed to remove member');
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setRemoveMemberDialog({ open: false, walletId: null, memberId: null });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallets</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your personal and shared wallets
            </p>
          </div>
          <CreateWalletDialog />
        </div>

        {wallets.length === 0 ? (
          <Alert>
            <Briefcase className="h-4 w-4" />
            <AlertDescription>
              You don't have any wallets yet. Create your first wallet to get started!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Wallets</CardTitle>
                <CardDescription>
                  Select a wallet to view details and manage members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedWalletId === wallet.id
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedWalletId(wallet.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{wallet.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {wallet.type === 'PERSONAL' ? 'Personal Wallet' : 'Shared Wallet'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {wallet.type === 'SHARED' && (
                          <Badge variant="secondary">Shared</Badge>
                        )}
                        {wallet.ownerId === user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWalletToDelete(wallet.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Details */}
            {selectedWallet ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedWallet.name}</CardTitle>
                      <CardDescription>
                        {selectedWallet.type === 'PERSONAL' ? 'Personal Wallet' : 'Shared Wallet'}
                      </CardDescription>
                    </div>
                    {selectedWallet.type === 'SHARED' && isOwner && (
                      <InviteMemberDialog
                        walletId={selectedWallet.id}
                        onMemberInvited={() => loadMembers(selectedWallet.id)}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedWallet.type === 'SHARED' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{members.length} member(s)</span>
                      </div>
                      
                      {loadingMembers ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div>
                                <div className="font-medium">{member.username}</div>
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                                  {member.role}
                                </Badge>
                                {isOwner && member.role !== 'OWNER' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setRemoveMemberDialog({
                                        open: true,
                                        walletId: selectedWallet.id,
                                        memberId: member.id,
                                      })
                                    }
                                  >
                                    <UserX className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-4">
                      This is a personal wallet. Only you can access it.
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a wallet to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Delete Wallet Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this wallet? This action cannot be undone and all
              associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWallet} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={removeMemberDialog.open} onOpenChange={(open) => 
        setRemoveMemberDialog({ ...removeMemberDialog, open })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the wallet? They will lose access
              to all wallet data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-500 hover:bg-red-600">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
