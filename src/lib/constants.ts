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

// Tamagotchi-specific stage colors (extends STAGE_COLORS with egg)
export const TAMAGOTCHI_STAGE_COLORS = {
  egg: { primary: "#A78BFA", bg: "#EDE9FE", emoji: "🥚" },
  hatchling: { primary: "#16A34A", bg: "#BBF7D0", emoji: "🐣" },
  juvenile: { primary: "#D97706", bg: "#FDE68A", emoji: "⚡" },
  adult: { primary: "#DC2626", bg: "#FECACA", emoji: "🔥" },
} as const;

// Per-dinosaur egg hatch times in milliseconds (real-time hours)
// Based on estimated real incubation periods (~1 real month ≈ 1 game hour)
const H = 3_600_000; // 1 hour in ms
export const DINO_HATCH_TIMES: Record<number, number> = {
  1:  1 * H,       // Eoraptor — tiny early dino, fast hatch
  2:  1 * H,       // Coelophysis — small theropod
  3:  5 * H,       // Plateosaurus — large prosauropod
  4:  1.5 * H,     // Herrerasaurus — early medium predator
  5:  2 * H,       // Postosuchus — crocodilian relative
  6:  4 * H,       // Allosaurus — large theropod
  7:  3.5 * H,     // Stegosaurus — armored, medium incubation
  8:  8 * H,       // Brachiosaurus — massive sauropod, longest hatch
  9:  7 * H,       // Diplodocus — large sauropod
  10: 1 * H,       // Archaeopteryx — bird ancestor, small egg
  11: 0.75 * H,    // Compsognathus — tiny, fastest hatch (45 min)
  12: 2.5 * H,     // Dilophosaurus — medium theropod
  13: 2.5 * H,     // Ceratosaurus — medium theropod
  14: 3 * H,       // Kentrosaurus — armored
  15: 3 * H,       // Megalosaurus — medium-large theropod
  16: 7 * H,       // Apatosaurus — large sauropod
  17: 4 * H,       // Yangchuanosaurus — large theropod
  18: 5 * H,       // Tyrannosaurus Rex — large, ~3-4 month incubation
  19: 3 * H,       // Triceratops — ceratopsian, nest guarder
  20: 1 * H,       // Velociraptor — small dromaeosaurid
  21: 5 * H,       // Spinosaurus — giant theropod
  22: 3.5 * H,     // Ankylosaurus — heavily armored
  23: 2.5 * H,     // Parasaurolophus — hadrosaur
  24: 2 * H,       // Pachycephalosaurus — medium
  25: 3 * H,       // Carnotaurus — medium-large theropod
  26: 4 * H,       // Therizinosaurus — large, slow
  27: 5 * H,       // Giganotosaurus — giant theropod
  28: 1 * H,       // Deinonychus — small raptor
  29: 2 * H,       // Protoceratops — small ceratopsian (~83 day real estimate)
  30: 3 * H,       // Quetzalcoatlus — pterosaur, leathery eggs
};
export const DEFAULT_HATCH_TIME = 3 * H;

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
