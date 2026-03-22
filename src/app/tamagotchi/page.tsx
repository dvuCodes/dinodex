import { getAllDinos } from "@/lib/data";
import { TamagotchiGame } from "@/components/tamagotchi/TamagotchiGame";

export const metadata = {
  title: "Dino Care — Dinodex Tamagotchi",
  description: "Adopt, feed, play with, and evolve your very own prehistoric companion!",
};

export default function TamagotchiPage() {
  const dinos = getAllDinos();

  return <TamagotchiGame dinos={dinos} />;
}
