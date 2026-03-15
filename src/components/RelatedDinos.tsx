import Link from "next/link";
import Image from "next/image";
import type { DinoEntry } from "@/lib/types";
import { ERA_COLORS } from "@/lib/constants";
import { formatDexNumber } from "@/lib/utils";

interface RelatedDinosProps {
  relatedDinos: DinoEntry[];
  currentId: number;
}

export function RelatedDinos({ relatedDinos, currentId }: RelatedDinosProps) {
  const dinos = relatedDinos.filter((d) => d.id !== currentId);

  if (dinos.length === 0) return null;

  return (
    <div>
      <h3 className="font-body text-base font-bold text-text-primary mb-3">
        Related Dinosaurs
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {dinos.map((dino) => {
          const paddedId = String(dino.id).padStart(3, "0");
          const eraColor = ERA_COLORS[dino.era];

          return (
            <Link
              key={dino.id}
              href={`/dino/${paddedId}`}
              className="shrink-0 w-28"
            >
              <div className="bg-white rounded-xl p-2 shadow-sm border border-border-default hover:shadow-md transition-shadow">
                <div
                  className="aspect-square rounded-lg overflow-hidden mb-1.5"
                  style={{ backgroundColor: eraColor.light }}
                >
                  <Image
                    src={`/dinos/${paddedId}/adult.svg`}
                    alt={`${dino.name}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="font-mono text-[10px] text-text-muted">
                  {formatDexNumber(dino.id)}
                </p>
                <p className="font-display text-xs font-bold text-text-primary truncate">
                  {dino.name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
