import { ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface SaveGroupPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function SaveGroupPromptModal({
  open,
  onOpenChange,
  onSave,
}: SaveGroupPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left space-y-3">
          <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-lg font-bold text-slate-900">
              Save your group permanently?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              You created this group as a guest. Link your email with a quick 6-digit code so you can access this group from any device and never lose your records.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            className="w-full font-semibold gap-2"
            onClick={onSave}
          >
            <Sparkles className="h-4 w-4" />
            <span>Save with email</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-slate-500 hover:text-slate-700"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
