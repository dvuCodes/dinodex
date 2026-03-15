"use client";

import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-3">
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="relative"
        >
          <span className="text-3xl drop-shadow-sm" aria-hidden="true">
            🦕
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
        </motion.div>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="font-display text-[28px] font-black leading-tight tracking-tight"
          >
            <span className="bg-gradient-to-r from-era-cretaceous via-accent to-era-jurassic bg-clip-text text-transparent">
              DINODEX
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="font-body text-[11px] text-text-muted -mt-1 tracking-widest uppercase"
          >
            Dinosaur Encyclopedia
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ml-auto font-mono text-[11px] text-text-muted/60 hidden sm:block"
        >
          030 SPECIES
        </motion.div>
      </div>
      {/* Gradient bottom border — era colors flowing left to right */}
      <div className="h-[2px] bg-gradient-to-r from-era-triassic via-era-jurassic to-era-cretaceous" />
    </header>
  );
}
