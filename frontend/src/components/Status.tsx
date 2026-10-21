import { AlertCircle, Film, Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div 
      className="w-full flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 select-none animate-in fade-in duration-300" 
      role="status"
    >
      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      <p className="text-xs font-medium text-text-muted tracking-wider uppercase">
        {label}
      </p>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-6 text-center space-y-3 select-none animate-in zoom-in-95 duration-350">
      <div className="w-12 h-12 rounded-xl bg-canvas-elevated border border-border-elevated flex items-center justify-center text-text-muted shadow-inner">
        <Film className="w-6 h-6" />
      </div>
      
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-text-headline tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div 
      className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs font-medium text-rose-300 flex items-center space-x-3 shadow-sm animate-in slide-in-from-top-2 duration-200" 
      role="alert"
    >
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
      <span className="leading-normal break-words flex-1">
        {message}
      </span>
    </div>
  );
}
