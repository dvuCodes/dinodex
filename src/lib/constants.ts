export const ERA_COLORS = {
  triassic: { primary: "#F59E0B", light: "#FEF3C7", dark: "#78350F" },
  jurassic: { primary: "#10B981", light: "#D1FAE5", dark: "#064E3B" },
  cretaceous: { primary: "#EF4444", light: "#FEE2E2", dark: "#7F1D1D" },
} as const;

export const DIET_COLORS = {
  carnivore: { primary: "#DC2626", light: "#FEE2E2", emoji: "🥩" },
  herbivore: { primary: "#16A34A", light: "#DCFCE7", emoji: "🌿" },
  omnivore: { primary: "#D97706", light: "#FEF3C7", emoji: "🍽️" },
  piscivore: { primary: "#2563EB", light: "#DBEAFE", emoji: "🐟" },
} as const;

export const STAGE_COLORS = {
  hatchling: { primary: "#16A34A", bg: "#BBF7D0", emoji: "🥚" },
  juvenile: { primary: "#D97706", bg: "#FDE68A", emoji: "⚡" },
  adult: { primary: "#DC2626", bg: "#FECACA", emoji: "🔥" },
} as const;

export const STAT_COLORS = {
  height: "#EF4444",
  length: "#F97316",
  weight: "#EAB308",
  speed: "#3B82F6",
  danger: "#8B5CF6",
  defense: "#06B6D4",
} as const;

export const STAT_MAXES = {
  height: 15,
  length: 35,
  weight: 80000,
  speed: 70,
  danger: 10,
  defense: 10,
} as const;
