import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDinos, getDinoById, getRelatedDinos, getAdjacentDinos } from "@/lib/data";
import { getDinoPageTitle, parseStageParam } from "@/lib/utils";
import type { Stage } from "@/lib/types";
import { DinoDetailClient } from "./DinoDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stage?: string | string[] }>;
}

function getRequestedStage(stageParam?: string | string[]): Stage {
  return parseStageParam(Array.isArray(stageParam) ? stageParam[0] : stageParam);
}

export async function generateStaticParams() {
  const dinos = getAllDinos();
  return dinos.map((dino) => ({
    id: String(dino.id).padStart(3, "0"),
  }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { stage } = await searchParams;
  const dinoId = parseInt(id, 10);
  const dino = getDinoById(dinoId);

  if (!dino) {
    return { title: "Dino Not Found | Dinodex" };
  }

  const requestedStage = getRequestedStage(stage);

  return {
    title: getDinoPageTitle(dino.name, dino.id, requestedStage),
    description: `${dino.funFact} Learn about ${dino.name} — ${dino.meaning}.`,
    openGraph: {
      title: getDinoPageTitle(dino.name, dino.id, requestedStage),
      description: dino.funFact,
      images: ["/opengraph-image"],
    },
  };
}

export default async function DinoDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { stage } = await searchParams;
  const dinoId = parseInt(id, 10);
  const dino = getDinoById(dinoId);

  if (!dino) {
    return notFound();
  }

  const relatedDinos = getRelatedDinos(dino);
  const { prev: prevDino, next: nextDino } = getAdjacentDinos(dino.id);
  const initialStage = getRequestedStage(stage);

  return (
    <DinoDetailClient
      dino={dino}
      relatedDinos={relatedDinos}
      prevDino={prevDino}
      nextDino={nextDino}
      initialStage={initialStage}
    />
  );
}
