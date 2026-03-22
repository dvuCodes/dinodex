interface BadgePillProps {
  label: string;
  color: string;
  emoji?: string;
}

export function BadgePill({ label, color, emoji }: BadgePillProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-pill font-body text-xs font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: `${color}18`,
        color: color,
      }}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </span>
  );
}
