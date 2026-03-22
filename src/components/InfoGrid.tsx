import type { DinoEntry } from "@/lib/types";
import { ERA_COLORS, DIET_COLORS } from "@/lib/constants";

interface InfoGridProps {
  dino: DinoEntry;
  eraColor: string;
}

interface InfoCellProps {
  label: string;
  value: string;
  accent?: string;
  className?: string;
}

function InfoCell({ label, value, accent, className = "" }: InfoCellProps) {
  return (
    <div className={`px-3 py-2.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block mb-0.5">
        {label}
      </span>
      <span
        className="font-body text-sm font-medium block"
        style={{ color: accent || "var(--color-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function InfoGrid({ dino, eraColor }: InfoGridProps) {
  const dietInfo = DIET_COLORS[dino.diet];
  const era = ERA_COLORS[dino.era];

  return (
    <div
      className="bg-white rounded-card overflow-hidden shadow-sm border border-border-default"
    >
      {/* Era-colored top border */}
      <div className="h-1" style={{ backgroundColor: era.primary }} />

      <div className="grid grid-cols-2">
        <InfoCell
          label="Era"
          value={dino.period}
          accent={era.primary}
          className="border-b border-r border-border-default/40"
        />
        <InfoCell
          label="Region"
          value={dino.region}
          className="border-b border-border-default/40"
        />
        <InfoCell
          label="Type"
          value={dino.type}
          className="border-b border-r border-border-default/40"
        />
        <InfoCell
          label="Movement"
          value={dino.locomotion.charAt(0).toUpperCase() + dino.locomotion.slice(1)}
          className="border-b border-border-default/40"
        />
        <InfoCell
          label="Discovered"
          value={`${dino.discoveredBy}, ${dino.discoveredYear}`}
          className="border-r border-border-default/40"
        />
        <InfoCell
          label="Diet"
          value={`${dietInfo.emoji} ${dino.diet.charAt(0).toUpperCase() + dino.diet.slice(1)}`}
          accent={dietInfo.primary}
        />
      </div>
    </div>
  );
}
