# DINODEX — Data Schema & Sample Entries

> TypeScript interfaces and 3 complete sample dino entries for reference.
> Use these as the template for all 30 entries in dinos.json.

---

## 1. TypeScript Interfaces

```typescript
// src/lib/types.ts

export type Era = "triassic" | "jurassic" | "cretaceous";
export type Diet = "carnivore" | "herbivore" | "omnivore" | "piscivore";
export type Locomotion = "biped" | "quadruped" | "both" | "flight";
export type Stage = "hatchling" | "juvenile" | "adult";

export interface DinoStage {
  height: number;         // meters
  length: number;         // meters  
  weight: number;         // kilograms
  speed: number;          // km/h
  danger: number;         // 1-10 scale
  defense: number;        // 1-10 scale
  dietDescription: string; // stage-specific diet detail
  description: string;     // 2-3 sentences about this life stage
}

export interface DinoEntry {
  id: number;              // 1-30 (displayed as #001-#030)
  name: string;            // Full species name
  meaning: string;         // Name translation/meaning
  pronunciation: string;   // Phonetic pronunciation
  era: Era;
  period: string;          // Specific period with dates, e.g. "Late Cretaceous (68–66 Mya)"
  diet: Diet;              // Primary diet classification
  type: string;            // Taxonomic group, e.g. "Theropod"
  locomotion: Locomotion;
  region: string;          // Discovery/habitat region
  discoveredBy: string;    // Scientist name
  discoveredYear: number;
  funFact: string;         // A compelling 1-sentence hook
  relatedIds: number[];    // IDs of related dinos (same era/family)
  stages: {
    hatchling: DinoStage;
    juvenile: DinoStage;
    adult: DinoStage;
  };
}
```

---

## 2. Constants

```typescript
// src/lib/constants.ts

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

// Maximum values in the dataset (for normalizing stat bars)
// These should be computed from the actual data, but here are reasonable maxes:
export const STAT_MAXES = {
  height: 15,      // meters (Brachiosaurus ~13m)
  length: 35,      // meters (Diplodocus ~26m, some room)
  weight: 80000,   // kg (Brachiosaurus ~58,000kg)
  speed: 70,       // km/h (fastest estimates)
  danger: 10,
  defense: 10,
} as const;
```

---

## 3. Sample Entries (3 of 30)

These demonstrate the full data structure. Use as reference template for the remaining 27.

```json
[
  {
    "id": 1,
    "name": "Eoraptor",
    "meaning": "Dawn Plunderer",
    "pronunciation": "EE-oh-RAP-tor",
    "era": "triassic",
    "period": "Late Triassic (231–228 Mya)",
    "diet": "omnivore",
    "type": "Theropod",
    "locomotion": "biped",
    "region": "South America",
    "discoveredBy": "Ricardo Martínez",
    "discoveredYear": 1991,
    "funFact": "One of the earliest dinosaurs ever discovered, Eoraptor was no bigger than a dog and lived at the very dawn of the age of dinosaurs.",
    "relatedIds": [2, 4],
    "stages": {
      "hatchling": {
        "height": 0.05,
        "length": 0.12,
        "weight": 0.08,
        "speed": 5,
        "danger": 1,
        "defense": 1,
        "dietDescription": "Tiny insects and grubs",
        "description": "A palm-sized hatchling with oversized eyes and stubby limbs. Baby Eoraptor scurried through Triassic undergrowth, snapping at beetles and hiding from larger predators."
      },
      "juvenile": {
        "height": 0.2,
        "length": 0.5,
        "weight": 2,
        "speed": 18,
        "danger": 2,
        "defense": 1,
        "dietDescription": "Insects, small lizards, soft plants",
        "description": "A nimble juvenile learning to hunt. At this stage, Eoraptor's mixed diet helped it survive — eating whatever it could find in the harsh Triassic landscape."
      },
      "adult": {
        "height": 0.4,
        "length": 1.0,
        "weight": 10,
        "speed": 25,
        "danger": 3,
        "defense": 2,
        "dietDescription": "Insects, small vertebrates, plants",
        "description": "A small but scrappy dinosaur about the size of a beagle. Despite its tiny stature, Eoraptor represents one of the first steps in dinosaur evolution — a glimpse at what would become the most dominant land animals in history."
      }
    }
  },
  {
    "id": 18,
    "name": "Tyrannosaurus Rex",
    "meaning": "Tyrant Lizard King",
    "pronunciation": "tie-RAN-oh-SORE-us REX",
    "era": "cretaceous",
    "period": "Late Cretaceous (68–66 Mya)",
    "diet": "carnivore",
    "type": "Theropod",
    "locomotion": "biped",
    "region": "North America",
    "discoveredBy": "Barnum Brown",
    "discoveredYear": 1902,
    "funFact": "T. Rex had the strongest bite force of any land animal ever — powerful enough to crush bone and swallow prey in massive chunks.",
    "relatedIds": [6, 27, 25],
    "stages": {
      "hatchling": {
        "height": 0.3,
        "length": 0.6,
        "weight": 5,
        "speed": 10,
        "danger": 1,
        "defense": 1,
        "dietDescription": "Insects and tiny lizards",
        "description": "A fluffy, downy-feathered hatchling with disproportionately large feet. Baby T. Rex was vulnerable and likely stayed close to its nest, relying on parental protection from larger predators."
      },
      "juvenile": {
        "height": 2.5,
        "length": 6.0,
        "weight": 1500,
        "speed": 40,
        "danger": 6,
        "defense": 3,
        "dietDescription": "Medium-sized dinosaurs and carrion",
        "description": "A lanky, fast-growing teenager that was actually faster than the adult. Juvenile T. Rex was a pursuit predator, chasing down prey that the heavier adults couldn't catch. Its jaws were already formidable but not yet bone-crushing."
      },
      "adult": {
        "height": 5.6,
        "length": 12.3,
        "weight": 8000,
        "speed": 32,
        "danger": 10,
        "defense": 4,
        "dietDescription": "Large dinosaurs — Triceratops, hadrosaurs",
        "description": "The undisputed king of the Cretaceous. An adult T. Rex combined a 1.5-meter skull, bone-crushing bite force of 12,800 pounds, and keen binocular vision. It was slower than its juvenile form but far more powerful — a tank rather than a sprinter."
      }
    }
  },
  {
    "id": 7,
    "name": "Stegosaurus",
    "meaning": "Roof Lizard",
    "pronunciation": "STEG-oh-SORE-us",
    "era": "jurassic",
    "period": "Late Jurassic (155–150 Mya)",
    "diet": "herbivore",
    "type": "Thyreophoran",
    "locomotion": "quadruped",
    "region": "North America",
    "discoveredBy": "Othniel Charles Marsh",
    "discoveredYear": 1877,
    "funFact": "Despite being the size of a bus, Stegosaurus had a brain the size of a walnut — one of the smallest brain-to-body ratios of any dinosaur.",
    "relatedIds": [14, 22],
    "stages": {
      "hatchling": {
        "height": 0.15,
        "length": 0.4,
        "weight": 2,
        "speed": 6,
        "danger": 1,
        "defense": 2,
        "dietDescription": "Soft ferns and mosses",
        "description": "A tiny armored baby with soft, flexible back plates that haven't hardened yet. Hatchling Stegosaurus huddled in groups for protection, their developing tail spikes still too small to be useful."
      },
      "juvenile": {
        "height": 1.5,
        "length": 4.0,
        "weight": 800,
        "speed": 10,
        "danger": 3,
        "defense": 6,
        "dietDescription": "Ferns, cycads, low-growing plants",
        "description": "A stocky juvenile with rapidly growing back plates and hardening tail spikes. At this stage, Stegosaurus was learning to swing its spiked tail — the 'thagomizer' — as a defensive weapon against predators like Allosaurus."
      },
      "adult": {
        "height": 4.0,
        "length": 9.0,
        "weight": 5000,
        "speed": 12,
        "danger": 4,
        "defense": 9,
        "dietDescription": "Ferns, cycads, horsetails, mosses",
        "description": "A bus-sized herbivore with 17 bony plates along its back and 4 lethal tail spikes. The plates may have been used for temperature regulation or display, flushing with blood to appear larger. Its tail spikes could deliver devastating blows to any predator foolish enough to attack."
      }
    }
  }
]
```

---

## 4. Helper Utilities

```typescript
// src/lib/utils.ts

/**
 * Format dino ID as Pokédex-style number
 */
export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

/**
 * Format weight for display
 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  if (kg < 1) return `${(kg * 1000).toFixed(0)}g`;
  return `${kg.toFixed(0)}kg`;
}

/**
 * Format height/length for display
 */
export function formatMeters(m: number): string {
  if (m < 1) return `${(m * 100).toFixed(0)}cm`;
  return `${m.toFixed(1)}m`;
}

/**
 * Format speed for display
 */
export function formatSpeed(kmh: number): string {
  return `${kmh}km/h`;
}

/**
 * Get stat bar percentage (0–100)
 */
export function getStatPercent(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

/**
 * Get art path for a dino stage
 */
export function getArtPath(id: number, stage: Stage): string {
  const paddedId = String(id).padStart(3, "0");
  return `/dinos/${paddedId}/${stage}.webp`;
}
```

---

## 5. Data Validation Rules

When authoring dinos.json, each entry must satisfy:

1. `id` is unique, sequential 1-30
2. `name` is the accepted common/scientific name
3. `era` matches the actual geological period
4. All 3 stages must be present with all fields filled
5. Stage stats should follow: hatchling < juvenile < adult (for height, length, weight)
6. Speed may be higher for juveniles than adults (this is real — juvenile T. Rex was faster)
7. `danger` and `defense` are integers 1–10
8. `relatedIds` references only valid IDs within 1–30
9. `description` is 1–3 sentences, engaging and educational
10. `period` includes the geological period name AND date range in Mya
