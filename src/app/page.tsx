import { getAllDinos } from "@/lib/data";
import { LandingClient } from "@/components/landing/LandingClient";

export default function LandingPage() {
  const dinos = getAllDinos();

  return <LandingClient dinos={dinos} />;
}
