"use client";

import { motion } from "framer-motion";
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
      type="button"
      onClick={onClick}
      className={`shrink-0 h-8 px-4 rounded-pill border font-body text-[13px] font-medium capitalize cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
        active
          ? "border-transparent text-white hover:brightness-[1.08] focus-visible:brightness-[1.08]"
          : "border-border-default bg-parchment text-text-secondary hover:border-text-secondary/35 hover:bg-[var(--chip-hover-bg)] hover:text-text-primary focus-visible:border-text-secondary/35 focus-visible:bg-[var(--chip-hover-bg)] focus-visible:text-text-primary"
      }`}
      style={
        active
          ? {
              backgroundColor: color,
              color: "white",
            }
          : {
              ["--chip-hover-bg" as string]: `${color}1F`,
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
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest shrink-0 w-8">
          Era
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {ERAS.map((era) => (
            <Chip
              key={era}
              label={era === "all" ? "All" : era}
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
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest shrink-0 w-8">
          Diet
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {DIETS.map((diet) => (
            <Chip
              key={diet}
              label={
                diet === "all"
                  ? "All"
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
    </motion.div>
  );
}
