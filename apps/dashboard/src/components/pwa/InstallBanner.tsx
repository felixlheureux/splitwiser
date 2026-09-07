import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { IOSInstallModal } from './IOSInstallModal';

export function InstallBanner() {
  const {
    isInstalled,
    isBannerDismissed,
    showIOSGuide,
    setShowIOSGuide,
    promptInstall,
    dismissBanner,
    hasPrompt,
  } = usePWAInstall();

  // If already installed in standalone mode, or user dismissed the banner, don't show
  if (isInstalled || isBannerDismissed) {
    return null;
  }

  return (
    <>
      <Card className="border-teal-200/80 bg-gradient-to-br from-teal-50/80 via-teal-50/40 to-white shadow-xs overflow-hidden relative">
        <CardContent className="space-y-2.5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-2xs">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="space-y-0.5 flex-1 pr-6">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                Install Splitwiser
              </h4>
              <p className="text-xs text-slate-600 leading-snug">
                Install Splitwiser on your home screen for quick offline access.
              </p>
            </div>
            {/* Quick close button in top-right */}
            <button
              type="button"
              onClick={dismissBanner}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-teal-100/50 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="h-8 px-3.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs gap-1.5"
              onClick={() => void promptInstall()}
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
              onClick={dismissBanner}
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step installation instructions */}
      <IOSInstallModal
        open={showIOSGuide}
        onOpenChange={setShowIOSGuide}
        onDirectInstall={promptInstall}
        hasDirectPrompt={hasPrompt}
      />
    </>
  );
}
