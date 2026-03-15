"use client";

import { motion } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { useFilteredDinos } from "@/hooks/useFilteredDinos";
import { SearchBar } from "./SearchBar";
import { FilterChips } from "./FilterChips";
import { DinoCard } from "./DinoCard";
import { EmptyState } from "./EmptyState";

interface DinoGridProps {
  dinos: DinoEntry[];
}

export function DinoGrid({ dinos }: DinoGridProps) {
  const {
    filteredDinos,
    searchQuery,
    eraFilter,
    dietFilter,
    setSearchQuery,
    setEraFilter,
    setDietFilter,
  } = useFilteredDinos(dinos);

  return (
    <div className="flex flex-col gap-5">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <FilterChips
        activeEra={eraFilter}
        activeDiet={dietFilter}
        onEraChange={setEraFilter}
        onDietChange={setDietFilter}
      />

      {/* Result count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2"
      >
        <div className="h-px flex-1 bg-border-default" />
        <span className="font-mono text-[11px] text-text-muted tracking-wider">
          {filteredDinos.length} {filteredDinos.length === 1 ? "SPECIES" : "SPECIES"} FOUND
        </span>
        <div className="h-px flex-1 bg-border-default" />
      </motion.div>

      {filteredDinos.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.03,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {filteredDinos.map((dino) => (
            <DinoCard key={dino.id} dino={dino} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
