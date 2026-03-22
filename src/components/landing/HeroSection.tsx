"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const floatingDinos = [
  { emoji: "🦕", x: "10%", y: "20%", size: "text-6xl", delay: 0, duration: 7 },
  { emoji: "🦖", x: "80%", y: "15%", size: "text-7xl", delay: 1.5, duration: 8 },
  { emoji: "🦴", x: "20%", y: "70%", size: "text-4xl", delay: 0.8, duration: 6 },
  { emoji: "🥚", x: "75%", y: "65%", size: "text-5xl", delay: 2, duration: 9 },
  { emoji: "🌿", x: "90%", y: "40%", size: "text-3xl", delay: 0.5, duration: 7.5 },
  { emoji: "🌋", x: "5%", y: "45%", size: "text-4xl", delay: 1.2, duration: 8.5 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-era-triassic/10 via-cream to-era-cretaceous/10" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-accent/8 to-transparent blur-3xl" />

      {/* Floating dino emojis */}
      {floatingDinos.map((dino, i) => (
        <motion.span
          key={i}
          className={`absolute ${dino.size} opacity-[0.15] select-none pointer-events-none`}
          style={{ left: dino.x, top: dino.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.15,
            scale: 1,
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: dino.delay },
            scale: { duration: 0.6, delay: dino.delay, type: "spring" },
            y: { duration: dino.duration, repeat: Infinity, ease: "easeInOut" },
          }}
          aria-hidden="true"
        >
          {dino.emoji}
        </motion.span>
      ))}

      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Dex number badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white/80 border border-border-default shadow-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-text-secondary uppercase">
            v1.0 — 030 Species Catalogued
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 100 }}
          className="font-display font-black leading-none mb-4"
        >
          <span className="block text-7xl sm:text-8xl md:text-9xl bg-gradient-to-r from-era-cretaceous via-accent to-era-triassic bg-clip-text text-transparent drop-shadow-lg"
            style={{ WebkitTextStroke: "1px rgba(0,0,0,0.03)" }}
          >
            DINO
          </span>
          <span className="block text-6xl sm:text-7xl md:text-8xl bg-gradient-to-r from-era-jurassic via-era-triassic to-era-cretaceous bg-clip-text text-transparent -mt-2 md:-mt-4">
            DEX
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="font-body text-lg sm:text-xl text-text-secondary max-w-md mx-auto mb-10 leading-relaxed"
        >
          Your <span className="text-text-primary font-semibold">Prehistoric Pocket Encyclopedia</span>.
          <br className="hidden sm:block" />
          {" "}Discover 30 dinosaurs across 3 ancient eras.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dex">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-era-cretaceous to-accent text-white font-display font-bold text-lg shadow-lg shadow-accent/25 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                Enter the Dex
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-era-cretaceous to-accent opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
            </motion.div>
          </Link>

          <Link href="/tamagotchi">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl bg-white/80 border-2 border-era-jurassic/30 text-text-primary font-display font-bold text-lg shadow-sm hover:border-era-jurassic/60 hover:shadow-md transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                🥚 Adopt a Dino
              </span>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-text-muted"
        >
          <span className="font-body text-xs tracking-widest uppercase">Scroll to explore</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-muted/60">
            <path d="M10 4L10 16M10 16L5 11M10 16L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
