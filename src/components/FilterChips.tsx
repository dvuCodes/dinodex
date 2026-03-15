"use client";

import type { Era, Diet } from "@/lib/types";
import { ERA_COLORS, DIET_COLORS } from "@/lib/constants";

interface FilterChipsProps {
  activeEra: Era | "all";
  activeDiet: Diet | "all";
  onEraChange: (era: Era | "all") => void;
  onDietChange: (diet: Diet | "all") => void;
}

const ERAS: (Era | "all")[] = ["all", "triassic", "jurassic", "cretaceous"];
const DIETS: (Diet | "all")[] = ["all", "carnivore", "herbivore", "omnivore"];

function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 h-8 px-4 rounded-pill font-body text-[13px] font-medium capitalize transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      style={
        active
          ? { backgroundColor: color, color: "white" }
          : {
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-secondary)",
              backgroundColor: "transparent",
            }
      }
      aria-label={`Filter by ${label}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function FilterChips({
  activeEra,
  activeDiet,
  onEraChange,
  onDietChange,
}: FilterChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ERAS.map((era) => (
          <Chip
            key={era}
            label={era === "all" ? "All Eras" : era}
            active={activeEra === era}
            color={
              era === "all"
                ? "var(--color-text-primary)"
                : ERA_COLORS[era].primary
            }
            onClick={() => onEraChange(era)}
          />
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DIETS.map((diet) => (
          <Chip
            key={diet}
            label={
              diet === "all"
                ? "All Diets"
                : `${DIET_COLORS[diet as Diet].emoji} ${diet}`
            }
            active={activeDiet === diet}
            color={
              diet === "all"
                ? "var(--color-text-primary)"
                : DIET_COLORS[diet].primary
            }
            onClick={() => onDietChange(diet)}
          />
        ))}
      </div>
    </div>
  );
}
