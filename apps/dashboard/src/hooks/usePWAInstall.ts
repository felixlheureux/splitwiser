import { useEffect, useState } from 'react';

const DISMISS_STORAGE_KEY = 'splitwiser_pwa_banner_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Check if running on iOS device
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  useEffect(() => {
    if (isInstalled) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  async function promptInstall(): Promise<boolean> {
    if (isInstalled) return false;

    if (isIOS) {
      setShowIOSGuide(true);
      return false;
    }

    if (!deferredPrompt) {
      // If browser doesn't support beforeinstallprompt but user clicked, show instructions
      setShowIOSGuide(true);
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setShowIOSGuide(false);
        return true;
      }
    } catch {
      // Ignore user cancellation
    }
    return false;
  }

  function dismissBanner() {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }

  // Can install if not already installed, and either beforeinstallprompt fired or on iOS/desktop
  const canInstall = !isInstalled;

  return {
    canInstall,
    isInstalled,
    isIOS,
    hasPrompt: Boolean(deferredPrompt),
    isBannerDismissed,
    showIOSGuide,
    setShowIOSGuide,
    promptInstall,
    dismissBanner,
  };
}
