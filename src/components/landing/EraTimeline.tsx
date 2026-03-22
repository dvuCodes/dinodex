"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DinoEntry, Era } from "@/lib/types";
import { ERA_COLORS } from "@/lib/constants";

interface EraCardProps {
  era: Era;
  label: string;
  period: string;
  dinos: DinoEntry[];
  index: number;
}

function EraCard({ era, label, period, dinos, index }: EraCardProps) {
  const color = ERA_COLORS[era];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative"
    >
      <Link href={`/dex?era=${era}`}>
        <div
          className="group relative rounded-2xl overflow-hidden p-6 border-2 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          style={{ borderColor: `${color.primary}30` }}
        >
          {/* Era color accent bar */}
          <div
            className="absolute top-0 left-0 w-full h-1.5"
            style={{ backgroundColor: color.primary }}
          />

          {/* Era badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-pill text-xs font-mono uppercase tracking-widest mb-3"
            style={{ backgroundColor: color.light, color: color.dark }}
          >
            {label}
          </div>

          <p className="font-body text-xs text-text-muted mb-4">{period}</p>

          {/* Sample dinos */}
          <div className="flex flex-wrap gap-1.5">
            {dinos.slice(0, 5).map((dino) => (
              <span
                key={dino.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-body bg-gray-50 text-text-secondary group-hover:bg-gray-100 transition-colors"
              >
                {dino.name}
              </span>
            ))}
            {dinos.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono text-text-muted">
                +{dinos.length - 5} more
              </span>
            )}
          </div>

          {/* Count */}
          <div className="mt-4 flex items-center justify-between">
            <span
              className="font-display font-black text-3xl"
              style={{ color: color.primary }}
            >
              {dinos.length}
            </span>
            <span className="font-body text-xs text-text-muted uppercase tracking-wider group-hover:text-accent transition-colors">
              Explore →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface EraTimelineProps {
  dinos: DinoEntry[];
}

export function EraTimeline({ dinos }: EraTimelineProps) {
  const triassic = dinos.filter((d) => d.era === "triassic");
  const jurassic = dinos.filter((d) => d.era === "jurassic");
  const cretaceous = dinos.filter((d) => d.era === "cretaceous");

  return (
    <section className="py-20 px-4 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-era-jurassic/[0.03] to-transparent" />

      <div className="max-w-[1100px] mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-text-primary">
            Journey Through Time
          </h2>
          <p className="font-body text-sm text-text-secondary mt-2">
            252 million years of prehistoric life, organized by geological era.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-era-triassic via-era-jurassic to-era-cretaceous rounded-full mx-auto mt-3" />
        </motion.div>

        {/* Timeline connector line (desktop) */}
        <div className="hidden md:block absolute top-[180px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-era-triassic via-era-jurassic to-era-cretaceous opacity-30 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <EraCard era="triassic" label="Triassic" period="252–201 Mya" dinos={triassic} index={0} />
          <EraCard era="jurassic" label="Jurassic" period="201–145 Mya" dinos={jurassic} index={1} />
          <EraCard era="cretaceous" label="Cretaceous" period="145–66 Mya" dinos={cretaceous} index={2} />
        </div>
      </div>
    </section>
  );
}
