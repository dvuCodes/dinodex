export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-border-default">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          🦕
        </span>
        <div>
          <h1 className="font-display text-[28px] font-black leading-tight tracking-tight text-text-primary">
            DINODEX
          </h1>
          <p className="font-body text-xs text-text-muted -mt-1">
            Dinosaur Encyclopedia
          </p>
        </div>
      </div>
    </header>
  );
}
