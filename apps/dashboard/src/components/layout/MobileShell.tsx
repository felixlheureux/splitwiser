import type { ReactNode } from 'react';

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md min-h-screen bg-slate-50 border-x border-slate-200/80 flex flex-col shadow-2xl relative">
        {children}
      </div>
    </div>
  );
}
