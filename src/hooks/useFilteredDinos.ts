"use client";

import { useState, useMemo, useEffect } from "react";
import type { DinoEntry, Era, Diet } from "@/lib/types";

interface UseFilteredDinosReturn {
  filteredDinos: DinoEntry[];
  searchQuery: string;
  eraFilter: Era | "all";
  dietFilter: Diet | "all";
  setSearchQuery: (query: string) => void;
  setEraFilter: (era: Era | "all") => void;
  setDietFilter: (diet: Diet | "all") => void;
}

function getInitialParams() {
  if (typeof window === "undefined") return { era: "all" as const, diet: "all" as const, q: "" };

  const params = new URLSearchParams(window.location.search);
  const era = params.get("era");
  const diet = params.get("diet");
  const q = params.get("q") || "";

  return {
    era: era && ["triassic", "jurassic", "cretaceous"].includes(era) ? (era as Era) : ("all" as const),
    diet: diet && ["carnivore", "herbivore", "omnivore", "piscivore"].includes(diet) ? (diet as Diet) : ("all" as const),
    q,
  };
}

export function useFilteredDinos(
  dinos: DinoEntry[]
): UseFilteredDinosReturn {
  const initial = getInitialParams();
  const [searchQuery, setSearchQuery] = useState(initial.q);
  const [eraFilter, setEraFilter] = useState<Era | "all">(initial.era);
  const [dietFilter, setDietFilter] = useState<Diet | "all">(initial.diet);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (eraFilter !== "all") params.set("era", eraFilter);
    if (dietFilter !== "all") params.set("diet", dietFilter);
    if (searchQuery) params.set("q", searchQuery);

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, [eraFilter, dietFilter, searchQuery]);

  const filteredDinos = useMemo(() => {
    return dinos.filter((dino) => {
      if (
        searchQuery &&
        !dino.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (eraFilter !== "all" && dino.era !== eraFilter) {
        return false;
      }
      if (dietFilter !== "all" && dino.diet !== dietFilter) {
        return false;
      }
      return true;
    });
  }, [dinos, searchQuery, eraFilter, dietFilter]);

  return {
    filteredDinos,
    searchQuery,
    eraFilter,
    dietFilter,
    setSearchQuery,
    setEraFilter,
    setDietFilter,
  };
}
