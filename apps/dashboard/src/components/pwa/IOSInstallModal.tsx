import { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Download,
  ExternalLink,
  Laptop,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export interface IOSInstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDirectInstall?: () => Promise<boolean>;
  hasDirectPrompt?: boolean;
}

export function IOSInstallModal({
  open,
  onOpenChange,
  onDirectInstall,
  hasDirectPrompt = false,
}: IOSInstallModalProps) {
  const [triedDirect, setTriedDirect] = useState(false);

  // iOS detection including modern iPadOS (which reports MacIntel with touch points)
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const isAndroid =
    typeof navigator !== 'undefined' &&
    /Android/i.test(navigator.userAgent);

  const isMobile =
    isIOS ||
    isAndroid ||
    (typeof navigator !== 'undefined' &&
      /Mobi|Mobile|Tablet/i.test(navigator.userAgent)) ||
    (typeof window !== 'undefined' && window.innerWidth < 768);

  const isFirefoxDesktop =
    !isMobile &&
    typeof navigator !== 'undefined' &&
    /Firefox|Zen/i.test(navigator.userAgent);

  const platformTitle = isIOS
    ? 'Install on iPhone / iPad'
    : isMobile
      ? 'Install on Mobile'
      : isFirefoxDesktop
        ? 'Desktop Browser Notice'
        : 'Install on Desktop';

  const platformDescription = isIOS
    ? 'Follow these two simple steps in Safari to add Splitwiser to your home screen:'
    : isMobile
      ? 'Choose how to install Splitwiser on your mobile device:'
      : isFirefoxDesktop
        ? 'Firefox and Zen Browser do not support standalone desktop PWAs:'
        : 'Choose how to install Splitwiser on your computer:';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setTriedDirect(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            {isMobile ? (
              <Smartphone className="h-4 w-4" />
            ) : (
              <Laptop className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider">{platformTitle}</span>
          </div>
          <DialogTitle>
            {isFirefoxDesktop ? 'Desktop PWA Compatibility' : 'Add Splitwiser to Home Screen'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {platformDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {isIOS ? (
            <div className="space-y-3">
              {/* iOS Step 1 */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-teal-600 shadow-2xs">
                  <Share className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900">1. Tap the Share button</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tap the <strong className="text-slate-800">Share</strong> icon in the bottom Safari toolbar.
                  </p>
                </div>
              </div>

              {/* iOS Step 2 */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-teal-600 shadow-2xs">
                  <PlusSquare className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900">2. Tap "Add to Home Screen"</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Scroll down and tap <strong className="text-slate-800">"Add to Home Screen"</strong>, then tap <strong className="text-slate-800">Add</strong> in the top right.
                  </p>
                </div>
              </div>
            </div>
          ) : isMobile ? (
            /* Android & Mobile Browsers (Notice: NO address bar mention here!) */
            <div className="space-y-3">
              {/* Option 1: Direct 1-Tap Install */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-2xs">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-teal-950">Option 1: 1-Tap Install</span>
                  </div>
                  {hasDirectPrompt ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Trigger your device's native installation prompt:
                </p>
                <Button
                  className="w-full h-10 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs gap-1.5"
                  onClick={async () => {
                    setTriedDirect(true);
                    const success = await onDirectInstall?.();
                    if (success) {
                      onOpenChange(false);
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  Install Splitwiser Now
                </Button>
                {triedDirect && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg p-2 leading-tight">
                    Didn't see the system prompt? Use <strong>Option 2</strong> below to install directly from your browser menu.
                  </p>
                )}
              </div>

              {/* Option 2: Fallback via Browser Menu */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <MoreVertical className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Option 2: From Browser Menu</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  If the 1-tap button above didn't trigger on your browser:
                </p>
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-800 mt-0.5">
                      1
                    </span>
                    <span className="leading-snug">
                      Tap your browser's menu <strong className="text-slate-900 font-semibold">(⋮ three dots)</strong> in the top or bottom corner
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-800 mt-0.5">
                      2
                    </span>
                    <span className="leading-snug">
                      Tap <strong className="text-slate-900 font-semibold">"Install app"</strong> or <strong className="text-slate-900 font-semibold">"Add to Home screen"</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : isFirefoxDesktop ? (
            /* Desktop Firefox / Zen */
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-teal-600 shadow-2xs">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900">Bookmark for Quick Access</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">⌘ + D</kbd> (or <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">Ctrl + D</kbd>) to bookmark Splitwiser in your bookmarks bar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-teal-200/80 bg-teal-50/50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-teal-200 text-teal-600 shadow-2xs">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900">Prefer a standalone desktop app?</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Open Splitwiser in <strong className="text-slate-800">Chrome</strong>, <strong className="text-slate-800">Edge</strong>, or on your <strong className="text-slate-800">mobile phone</strong> to install it with 1 click.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Chromium (Chrome / Edge / Brave / etc.) */
            <div className="space-y-3">
              {/* Option 1: Direct 1-Tap Install */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-2xs">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-teal-950">Option 1: 1-Tap Install</span>
                  </div>
                  {hasDirectPrompt ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  )}
                </div>
                <Button
                  className="w-full h-10 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs gap-1.5"
                  onClick={async () => {
                    setTriedDirect(true);
                    const success = await onDirectInstall?.();
                    if (success) {
                      onOpenChange(false);
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  Install Splitwiser App
                </Button>
                {triedDirect && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg p-2 leading-tight">
                    Didn't see a prompt? Use Option 2 below.
                  </p>
                )}
              </div>

              {/* Option 2: From Address Bar (Omnibox) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Option 2: From Address Bar</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Click the <strong className="text-slate-900 font-semibold">Installer</strong> button or <strong className="text-slate-900 font-semibold">Install icon (⊕)</strong> on the right side of your browser's address bar.
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Re-export as PWAInstallModal for semantic clarity
export const PWAInstallModal = IOSInstallModal;
