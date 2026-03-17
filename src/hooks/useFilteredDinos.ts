"use client";

import { startTransition, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DinoEntry, Era, Diet } from "@/lib/types";
import { createFilterQueryString, parseFilterState } from "@/lib/filter-state";

interface UseFilteredDinosReturn {
  filteredDinos: DinoEntry[];
  searchQuery: string;
  eraFilter: Era | "all";
  dietFilter: Diet | "all";
  setSearchQuery: (query: string) => void;
  setEraFilter: (era: Era | "all") => void;
  setDietFilter: (diet: Diet | "all") => void;
}

export function useFilteredDinos(
  dinos: DinoEntry[]
): UseFilteredDinosReturn {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, eraFilter, dietFilter } = useMemo(
    () => parseFilterState(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  function updateFilters(nextFilters: {
    searchQuery?: string;
    eraFilter?: Era | "all";
    dietFilter?: Diet | "all";
  }) {
    const queryString = createFilterQueryString({
      searchQuery: nextFilters.searchQuery ?? searchQuery,
      eraFilter: nextFilters.eraFilter ?? eraFilter,
      dietFilter: nextFilters.dietFilter ?? dietFilter,
    });
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

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
    setSearchQuery: (nextSearchQuery) => updateFilters({ searchQuery: nextSearchQuery }),
    setEraFilter: (nextEraFilter) => updateFilters({ eraFilter: nextEraFilter }),
    setDietFilter: (nextDietFilter) => updateFilters({ dietFilter: nextDietFilter }),
  };
}
