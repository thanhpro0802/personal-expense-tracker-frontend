/**
 * InviteMemberDialog - Modal dialog for inviting members to a shared wallet
 */

import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { walletAPI } from '../../services/api';

interface InviteMemberDialogProps {
  walletId: string;
  onMemberInvited?: () => void;
}

export default function InviteMemberDialog({ walletId, onMemberInvited }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usernameOrEmail.trim()) {
      toast.error('Please enter a username or email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await walletAPI.inviteMember({
        walletId,
        usernameOrEmail: usernameOrEmail.trim(),
      });

      if (response.success) {
        toast.success('Member invited successfully!');
        setOpen(false);
        setUsernameOrEmail('');
        if (onMemberInvited) {
          onMemberInvited();
        }
      } else {
        toast.error(response.message || 'Failed to invite member');
      }
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite someone to this shared wallet by entering their username or email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username-email">Username or Email</Label>
              <Input
                id="username-email"
                placeholder="username or email@example.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={isLoading}
              />
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
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
