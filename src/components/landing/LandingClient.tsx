"use client";

import type { DinoEntry } from "@/lib/types";
import { HeroSection } from "./HeroSection";
import { StatsBanner } from "./StatsBanner";
import { FeaturedDinos } from "./FeaturedDinos";
import { EraTimeline } from "./EraTimeline";
import { TamagotchiTeaser } from "./TamagotchiTeaser";

interface LandingClientProps {
  dinos: DinoEntry[];
}

export function LandingClient({ dinos }: LandingClientProps) {
  return (
    <main>
      <HeroSection />
      <StatsBanner />
      <FeaturedDinos dinos={dinos} />
      <EraTimeline dinos={dinos} />
      <TamagotchiTeaser />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border-default">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-display font-black text-lg bg-gradient-to-r from-era-cretaceous via-accent to-era-jurassic bg-clip-text text-transparent">
              DINODEX
            </span>
            <p className="font-body text-xs text-text-muted mt-0.5">
              Your Prehistoric Pocket Encyclopedia
            </p>
          </div>
          <p className="font-mono text-[10px] text-text-muted/60 tracking-wider">
            030 SPECIES · 003 ERAS · 090 EVOLUTIONS
          </p>
        </div>
      </footer>
    </main>
  );
}
