import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '../ui/button';

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  onOpenMenu: () => void;
}

export function AppHeader({ title, onBack, onOpenMenu }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-hidden">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 -ml-1 text-slate-600 hover:text-slate-900 rounded-full"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2 truncate">
          {!onBack && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white shadow-xs">
              s.
            </span>
          )}
          <h1 className="truncate text-base font-semibold text-slate-900">
            {title || 'Splitwiser'}
          </h1>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        className="h-9 w-9 text-slate-600 hover:text-slate-900 rounded-full"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </header>
  );
}
