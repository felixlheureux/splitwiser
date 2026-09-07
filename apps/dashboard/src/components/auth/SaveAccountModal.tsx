import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const queryClient = useQueryClient();
  const api = useAPI();
  const sendOtp = useMutation({
    ...api.auth.sendOtp(),
    onSuccess: () => {
      setStep('otp');
      setResendCooldown(30);
    },
  });

  const verifyOtp = useMutation({
    ...api.auth.verifyOtp(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.keys.profile });
      await queryClient.invalidateQueries({ queryKey: api.keys.groups.all });
      await queryClient.refetchQueries({ queryKey: api.keys.profile });
      await queryClient.refetchQueries({ queryKey: api.keys.groups.all });
      handleClose(false);
    },
  });

  const isTestKey =
    !import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY === 'replace-after-tofu-apply' ||
    import.meta.env.VITE_TURNSTILE_SITE_KEY === '1x00000000000000000000AA';

  const siteKey = isTestKey
    ? '1x00000000000000000000AA'
    : import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Turnstile widget setup
  useEffect(() => {
    if (!open || step !== 'email') {
      return;
    }

    let isMounted = true;

    if (isTestKey) {
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
  }, [open, step, siteKey, isTestKey]);

  function handleSendEmail(e: SyntheticEvent) {
    e.preventDefault();
    if (!email.trim() || sendOtp.isPending) return;
    sendOtp.mutate({ email: email.trim(), turnstileToken: turnstileToken || undefined });
  }

  function handleVerifyOtp(e?: SyntheticEvent) {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || verifyOtp.isPending) return;
    verifyOtp.mutate({ email: email.trim(), otp: cleanOtp });
  }

  function handleResend() {
    if (resendCooldown > 0 || sendOtp.isPending) return;
    sendOtp.mutate({ email: email.trim(), turnstileToken: turnstileToken || undefined });
  }

  function handleClose(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        sendOtp.reset();
        verifyOtp.reset();
        setEmail('');
        setOtp('');
        setStep('email');
        setTurnstileToken(null);
        setResendCooldown(0);
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
          <DialogTitle>{step === 'email' ? 'Access anywhere' : 'Enter 6-digit code'}</DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'email'
              ? "Link an email so you never lose your groups. We'll send you a 6-digit sign-in code."
              : `We sent a 6-digit code to ${email}. Enter it below to sign in.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Mail className="h-6 w-6" />
            </div>

            <div className="space-y-2 text-center">
              <label htmlFor="otp-input" className="text-xs font-semibold text-slate-700">
                Sign-in code
              </label>
              <Input
                id="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                className="text-center font-mono text-2xl font-bold tracking-[0.3em] h-13"
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  if (cleaned.length === 6) {
                    verifyOtp.mutate({ email: email.trim(), otp: cleaned });
                  }
                }}
                disabled={verifyOtp.isPending}
              />
            </div>

            {verifyOtp.error && (
              <p className="text-xs text-rose-600 font-medium text-center">
                {String(verifyOtp.error.message || verifyOtp.error)}
              </p>
            )}

            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={otp.length !== 6 || verifyOtp.isPending}
            >
              {verifyOtp.isPending ? 'Verifying code…' : 'Sign in'}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  verifyOtp.reset();
                }}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                Use different email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || sendOtp.isPending}
                className="font-medium text-teal-600 hover:text-teal-700 disabled:text-slate-400 transition-colors"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendEmail} className="space-y-4 pt-2">
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
                disabled={sendOtp.isPending}
              />
            </div>
            {/* Cloudflare Turnstile verification widget */}
            <div ref={turnstileContainerRef} className="flex items-center justify-center my-2 min-h-[65px]" />
            {sendOtp.error && (
              <p className="text-xs text-rose-600 font-medium">
                {String(sendOtp.error.message || sendOtp.error)}
              </p>
            )}
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={sendOtp.isPending || !email.trim()}
            >
              {sendOtp.isPending ? 'Sending code…' : 'Send login code'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
