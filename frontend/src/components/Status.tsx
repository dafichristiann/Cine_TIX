export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div 
      className="w-full flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 select-none animate-in fade-in duration-300" 
      role="status"
    >
      {/* Spinner Bulat Kreatif Sinematik */}
      <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-teal-500 animate-spin shadow-md shadow-teal-500/5" />
      
      <p className="text-sm font-medium text-slate-400 font-sans tracking-wide">
        {label}
      </p>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center space-y-3 select-none animate-in zoom-in-95 duration-350">
      {/* Icon Placeholder Avatar Box */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 flex items-center justify-center font-black text-slate-700 text-xl shadow-inner shadow-slate-950">
        C
      </div>
      
      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-200 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div 
      className="w-full bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs font-semibold text-rose-400 flex items-center space-x-2.5 shadow-sm shadow-rose-950/10 animate-in slide-in-from-top-2 duration-200" 
      role="alert"
    >
      {/* Icon Alert Warning */}
      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-rose-500/10 text-[10px] font-black shrink-0 border border-rose-500/20 select-none">
        ⚠️
      </span>
      <span className="leading-normal break-words flex-1">
        {message}
      </span>
    </div>
  );
}