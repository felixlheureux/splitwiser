import { Coffee, Download, LogIn, LogOut, PlusCircle, ShieldCheck, User } from 'lucide-react';
import type { Me } from '@splitwiser/shared';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { IOSInstallModal } from '../pwa/IOSInstallModal';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

interface AppMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Me | null;
  onNewGroup: () => void;
  onSaveAccount: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function AppMenuSheet({
  open,
  onOpenChange,
  user,
  onNewGroup,
  onSaveAccount,
  onSignOut,
  isSigningOut,
}: AppMenuSheetProps) {
  const isGuest = !user?.email;
  const { isInstalled, promptInstall, showIOSGuide, setShowIOSGuide, hasPrompt } = usePWAInstall();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full p-6">
          <div className="flex-1 space-y-6 overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-xs">
                  s.
                </span>
                <div>
                  <SheetTitle className="text-lg">Splitwiser</SheetTitle>
                  <SheetDescription className="text-xs">
                    Zero friction expense sharing
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* User Account / Guest Status */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-sm">
              {isGuest ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Guest mode</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your groups are saved on this device. Sign in with email to access them anywhere.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={() => {
                      onOpenChange(false);
                      onSaveAccount();
                    }}
                  >
                    <LogIn className="h-3.5 w-3.5 mr-1 text-teal-600" />
                    Save my groups (Sign in)
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <span className="truncate">{user.name || user.email}</span>
                  </div>
                  {user.email && (
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-0 h-8"
                    onClick={onSignOut}
                    disabled={isSigningOut}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    {isSigningOut ? 'Signing out…' : 'Sign out'}
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Actions
              </p>
              <Button
                variant="outline"
                className="w-full justify-start text-slate-800"
                onClick={() => {
                  onOpenChange(false);
                  onNewGroup();
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2 text-teal-600" />
                Create new group
              </Button>
            </div>
          </div>

          {/* Bottom Section: Install Button + Divider + Buy Me A Coffee */}
          <div className="space-y-4 pt-4">
            {!isInstalled && (
              <Button
                variant="outline"
                className="w-full justify-start text-slate-800"
                onClick={() => {
                  onOpenChange(false);
                  void promptInstall();
                }}
              >
                <Download className="h-4 w-4 mr-2 text-teal-600" />
                Install Splitwiser app
              </Button>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <a
                href={import.meta.env.VITE_BUY_ME_A_COFFEE_URL || 'https://buymeacoffee.com/felixlheureux'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-4 py-3 text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <Coffee className="h-4 w-4 fill-slate-900 stroke-slate-900" />
                <span>Buy me a coffee</span>
              </a>
              <p className="text-center text-[11px] text-slate-400">
                Splitwiser · Built for the things we share
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Install Guide */}
      <IOSInstallModal
        open={showIOSGuide}
        onOpenChange={setShowIOSGuide}
        onDirectInstall={promptInstall}
        hasDirectPrompt={hasPrompt}
      />
    </>
  );
}

