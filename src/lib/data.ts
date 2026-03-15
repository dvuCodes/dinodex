import type { DinoEntry, Era, Diet } from "./types";
import dinosData from "@/data/dinos.json";

const dinos: DinoEntry[] = dinosData as DinoEntry[];

export function getAllDinos(): DinoEntry[] {
  return dinos;
}

export function getDinoById(id: number): DinoEntry | undefined {
  return dinos.find((d) => d.id === id);
}

export function getDinosByEra(era: Era): DinoEntry[] {
  return dinos.filter((d) => d.era === era);
}

export function getDinosByDiet(diet: Diet): DinoEntry[] {
  return dinos.filter((d) => d.diet === diet);
}

export function getRelatedDinos(dino: DinoEntry): DinoEntry[] {
  return dino.relatedIds
    .map((id) => getDinoById(id))
    .filter((d): d is DinoEntry => d !== undefined);
}
