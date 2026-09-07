import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail, Sparkles } from 'lucide-react';
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

interface SaveAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAccountModal({ open, onOpenChange }: SaveAccountModalProps) {
  const [email, setEmail] = useState('');
  const api = useAPI();
  const signIn = useMutation(api.auth.signIn());
  const sent = signIn.isSuccess;
  const busy = signIn.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    signIn.mutate(email.trim());
  }

  function handleClose(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        signIn.reset();
        setEmail('');
      }, 300);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Save your groups</span>
          </div>
          <DialogTitle>Access anywhere</DialogTitle>
          <DialogDescription className="text-xs">
            Link an email so you never lose your groups. We'll send you a password-free magic link.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900">Check your email</h4>
              <p className="text-xs text-slate-500">
                We sent a magic link to <strong className="text-slate-700">{email}</strong>.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => signIn.reset()}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="save-email" className="text-xs font-semibold text-slate-700">
                Email address
              </label>
              <Input
                id="save-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                autoFocus
              />
            </div>
            {signIn.error && (
              <p className="text-xs text-rose-600 font-medium">
                {String(signIn.error.message || signIn.error)}
              </p>
            )}
            <Button type="submit" className="w-full font-semibold" disabled={busy || !email.trim()}>
              {busy ? 'Sending link…' : 'Send magic link'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
