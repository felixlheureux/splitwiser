import { useEffect, useRef, useState, type FormEvent } from 'react';
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

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (error?: unknown) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface SaveAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAccountModal({ open, onOpenChange }: SaveAccountModalProps) {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const api = useAPI();
  const signIn = useMutation(api.auth.signIn());
  const sent = signIn.isSuccess;
  const busy = signIn.isPending;

  const isTestKey =
    !import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY === 'replace-after-tofu-apply' ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY === '1x00000000000000000000AA';

  const siteKey = isTestKey
    ? '1x00000000000000000000AA'
    : import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    if (isTestKey) {
      // Async state update for test key
      queueMicrotask(() => {
        if (isMounted) setTurnstileToken('valid-test-turnstile-token');
      });
    }

    function renderWidget() {
      if (!isMounted || !turnstileContainerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      try {
        widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          size: 'flexible',
          theme: 'light',
          callback: (token) => {
            if (isMounted) setTurnstileToken(token);
          },
          'expired-callback': () => {
            if (isMounted) setTurnstileToken(null);
          },
          'error-callback': () => {
            // Local dev fallback
            if (isMounted) setTurnstileToken('local-dev-turnstile-token');
          },
        });
      } catch {
        if (isMounted) setTurnstileToken('local-dev-turnstile-token');
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById('cf-turnstile-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => renderWidget();
        script.onerror = () => {
          if (isMounted) setTurnstileToken('local-dev-turnstile-token');
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', renderWidget);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [open, siteKey, isTestKey]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    signIn.mutate({ email: email.trim(), turnstileToken: turnstileToken || undefined });
  }

  function handleClose(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        signIn.reset();
        setEmail('');
        setTurnstileToken(null);
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
            {/* Cloudflare Turnstile verification widget */}
            <div ref={turnstileContainerRef} className="flex items-center justify-center my-2 min-h-[65px]" />
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
