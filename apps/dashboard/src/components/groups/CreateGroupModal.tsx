import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Users } from 'lucide-react';
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

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  defaultCreatorName?: string;
  onSuccess: (groupId: string) => void;
}

export function CreateGroupModal({
  open,
  onOpenChange,
  userId,
  defaultCreatorName,
  onSuccess,
}: CreateGroupModalProps) {
  const api = useAPI();
  const create = useMutation(api.groups.create(userId));

  const form = useForm({
    defaultValues: {
      name: '',
      creatorName: '',
    },
    onSubmit: async ({ value }) => {
      const trimmedCreatorName = value.creatorName.trim();
      if (!trimmedCreatorName) return;

      create.mutate(
        {
          name: value.name.trim(),
          creatorName: trimmedCreatorName,
        },
        {
          onSuccess: (newGroup) => {
            form.reset();
            onOpenChange(false);
            onSuccess(newGroup.id);
          },
        },
      );
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <Users className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">New Group</span>
          </div>
          <DialogTitle>Start splitting bills</DialogTitle>
          <DialogDescription className="text-xs">
            Create a group for a trip, house, or dinner. Share the link with friends to join.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4 pt-2"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'Group name is required' : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label htmlFor="group-name" className="text-xs font-semibold text-slate-700">
                  Group name
                </label>
                <Input
                  id="group-name"
                  placeholder="e.g. Costa Rica Trip, Apartment 4B"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={create.isPending}
                  maxLength={80}
                  autoFocus
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-rose-600">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="creatorName"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'Your name is required' : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <label htmlFor="creator-name" className="text-xs font-semibold text-slate-700">
                  Your name in this group
                </label>
                <Input
                  id="creator-name"
                  placeholder={defaultCreatorName ? `e.g. ${defaultCreatorName}` : 'Your name (e.g. Alex)'}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={create.isPending}
                  maxLength={80}
                  required
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-rose-600">
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {create.error && (
            <p className="text-xs text-rose-600 font-medium">
              {String(create.error.message || create.error)}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold mt-2"
            disabled={create.isPending}
          >
            {create.isPending ? 'Creating group…' : 'Create group'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
