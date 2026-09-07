import { useState, type SyntheticEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useAPI } from '../../hooks/useAPI';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function AddMemberModal({ open, onOpenChange, groupId }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const api = useAPI();
  const addMember = useMutation(api.groups.addMember(groupId));

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addMember.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <UserPlus className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Add person</span>
          </div>
          <DialogTitle>Add someone to this group</DialogTitle>
          <DialogDescription className="text-xs">
            Add a friend by name. They can claim this person whenever they open the invite link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="member-name" className="text-xs font-semibold text-slate-700">
              Friend's name
            </label>
            <Input
              id="member-name"
              placeholder="e.g. Sarah"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addMember.isPending}
              maxLength={80}
            />
          </div>

          {addMember.error && (
            <p className="text-xs text-rose-600 font-medium">
              {String(addMember.error.message || addMember.error)}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={addMember.isPending || !name.trim()}
          >
            {addMember.isPending ? 'Adding…' : 'Add person'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
