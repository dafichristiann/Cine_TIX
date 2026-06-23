export default function FilmCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full animate-pulse select-none">
      {/* 1. Dummy Poster Area */}
      <div className="aspect-[2/3] w-full bg-slate-950/60" />

      {/* 2. Dummy Body Content */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Dummy Genre */}
          <div className="h-3 w-1/3 bg-slate-800 rounded-full" />
          {/* Dummy Title */}
          <div className="h-5 w-3/4 bg-slate-800 rounded-full" />
          {/* Dummy Meta */}
          <div className="h-3 w-1/2 bg-slate-800 rounded-full" />
        </div>

        {/* Dummy CTA Button */}
        <div className="h-9 w-full bg-slate-800 rounded-xl pt-1" />
      </div>
    </div>
  );
}