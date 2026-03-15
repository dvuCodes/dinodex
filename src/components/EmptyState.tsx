export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4" aria-hidden="true">
        🦴
      </span>
      <h3 className="font-display text-lg font-bold text-text-primary mb-1">
        No dinosaurs found
      </h3>
      <p className="font-body text-sm text-text-secondary max-w-xs">
        Try different filters or search terms to discover more prehistoric
        creatures!
      </p>
    </div>
  );
}
