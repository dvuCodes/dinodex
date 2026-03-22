"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { formatDexNumber } from "@/lib/utils";
import { ERA_COLORS } from "@/lib/constants";

interface DinoNavStripProps {
  prevDino: DinoEntry;
  nextDino: DinoEntry;
  currentEraColor: string;
}

export function DinoNavStrip({ prevDino, nextDino, currentEraColor }: DinoNavStripProps) {
  const router = useRouter();
  const prevId = String(prevDino.id).padStart(3, "0");
  const nextId = String(nextDino.id).padStart(3, "0");
  const prevEra = ERA_COLORS[prevDino.era];
  const nextEra = ERA_COLORS[nextDino.era];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        router.push(`/dino/${prevId}`);
      } else if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        router.push(`/dino/${nextId}`);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, prevId, nextId]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-stretch border-b-2 relative"
      style={{ borderBottomColor: `${currentEraColor}30` }}
      aria-label="Dinosaur navigation"
    >
      <Link
        href={`/dino/${prevId}`}
        className="flex-1 flex items-center gap-2 px-4 py-3 group transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
        aria-label={`Navigate to previous dinosaur, ${prevDino.name} number ${prevDino.id}`}
      >
        <span
          className="text-lg group-hover:-translate-x-1 transition-transform duration-200"
          style={{ color: prevEra.primary }}
          aria-hidden="true"
        >
          &larr;
        </span>
        <span
          className="font-mono text-xs tracking-wider"
          style={{ color: prevEra.primary }}
        >
          {formatDexNumber(prevDino.id)}
        </span>
        <span className="font-display text-sm font-bold text-text-primary hidden md:inline truncate">
          {prevDino.name}
        </span>
      </Link>

      {/* Center divider */}
      <div className="w-px bg-border-default/60 self-stretch" />

      <Link
        href={`/dino/${nextId}`}
        className="flex-1 flex items-center justify-end gap-2 px-4 py-3 group transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
        aria-label={`Navigate to next dinosaur, ${nextDino.name} number ${nextDino.id}`}
      >
        <span className="font-display text-sm font-bold text-text-primary hidden md:inline truncate">
          {nextDino.name}
        </span>
        <span
          className="font-mono text-xs tracking-wider"
          style={{ color: nextEra.primary }}
        >
          {formatDexNumber(nextDino.id)}
        </span>
        <span
          className="text-lg group-hover:translate-x-1 transition-transform duration-200"
          style={{ color: nextEra.primary }}
          aria-hidden="true"
        >
          &rarr;
        </span>
      </Link>
    </motion.nav>
  );
}
