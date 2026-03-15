import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDinos, getDinoById, getRelatedDinos } from "@/lib/data";
import { formatDexNumber } from "@/lib/utils";
import { DinoDetailClient } from "./DinoDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const dinos = getAllDinos();
  return dinos.map((dino) => ({
    id: String(dino.id).padStart(3, "0"),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const dinoId = parseInt(id, 10);
  const dino = getDinoById(dinoId);

  if (!dino) {
    return { title: "Dino Not Found | Dinodex" };
  }

  return {
    title: `${dino.name} | Dinodex ${formatDexNumber(dino.id)}`,
    description: `${dino.funFact} Learn about ${dino.name} — ${dino.meaning}.`,
    openGraph: {
      title: `${dino.name} | Dinodex ${formatDexNumber(dino.id)}`,
      description: dino.funFact,
    },
  };
}

export default async function DinoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dinoId = parseInt(id, 10);
  const dino = getDinoById(dinoId);

  if (!dino) {
    return notFound();
  }

  const relatedDinos = getRelatedDinos(dino);

  return <DinoDetailClient dino={dino} relatedDinos={relatedDinos} />;
}
