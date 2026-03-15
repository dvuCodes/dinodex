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
    <div className="flex flex-col gap-4">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <FilterChips
        activeEra={eraFilter}
        activeDiet={dietFilter}
        onEraChange={setEraFilter}
        onDietChange={setDietFilter}
      />

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
