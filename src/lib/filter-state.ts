import type { Diet, Era } from "./types";

export interface FilterState {
  searchQuery: string;
  eraFilter: Era | "all";
  dietFilter: Diet | "all";
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: "",
  eraFilter: "all",
  dietFilter: "all",
};

const VALID_ERAS = new Set<Era>(["triassic", "jurassic", "cretaceous"]);
const VALID_DIETS = new Set<Diet>(["carnivore", "herbivore", "omnivore", "piscivore"]);

export function parseFilterState(searchParams: URLSearchParams): FilterState {
  const era = searchParams.get("era");
  const diet = searchParams.get("diet");
  const searchQuery = searchParams.get("q") ?? "";

  return {
    eraFilter: era && VALID_ERAS.has(era as Era) ? (era as Era) : DEFAULT_FILTER_STATE.eraFilter,
    dietFilter: diet && VALID_DIETS.has(diet as Diet) ? (diet as Diet) : DEFAULT_FILTER_STATE.dietFilter,
    searchQuery,
  };
}

export function createFilterQueryString(filters: FilterState): string {
  const params = new URLSearchParams();

  if (filters.eraFilter !== "all") {
    params.set("era", filters.eraFilter);
  }
  if (filters.dietFilter !== "all") {
    params.set("diet", filters.dietFilter);
  }
  if (filters.searchQuery) {
    params.set("q", filters.searchQuery);
  }

  return params.toString();
}
