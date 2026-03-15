export type Era = "triassic" | "jurassic" | "cretaceous";
export type Diet = "carnivore" | "herbivore" | "omnivore" | "piscivore";
export type Locomotion = "biped" | "quadruped" | "both" | "flight";
export type Stage = "hatchling" | "juvenile" | "adult";

export interface DinoStage {
  height: number;
  length: number;
  weight: number;
  speed: number;
  danger: number;
  defense: number;
  dietDescription: string;
  description: string;
}

export interface DinoEntry {
  id: number;
  name: string;
  meaning: string;
  pronunciation: string;
  era: Era;
  period: string;
  diet: Diet;
  type: string;
  locomotion: Locomotion;
  region: string;
  discoveredBy: string;
  discoveredYear: number;
  funFact: string;
  relatedIds: number[];
  stages: {
    hatchling: DinoStage;
    juvenile: DinoStage;
    adult: DinoStage;
  };
}
