"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function TamagotchiTeaser() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-era-jurassic/10 via-stage-hatchling/5 to-era-triassic/10" />
          <div className="absolute inset-0 dex-stripes" />

          <div className="relative p-8 sm:p-12 text-center">
            {/* Animated egg */}
            <motion.div
              animate={{
                rotate: [-3, 3, -3],
                y: [0, -5, 0],
              }}
              transition={{
                rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
              className="text-7xl sm:text-8xl mb-6 inline-block"
              aria-hidden="true"
            >
              🥚
            </motion.div>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-text-primary mb-3">
              Adopt Your Own{" "}
              <span className="bg-gradient-to-r from-era-jurassic to-stage-hatchling bg-clip-text text-transparent">
                Dino
              </span>
            </h2>

            <p className="font-body text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
              Hatch an egg, feed your dinosaur, play with it, and watch it evolve from a tiny hatchling
              into a fearsome adult. Your very own prehistoric Tamagotchi!
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["🍖 Feed", "🎮 Play", "😴 Sleep", "⚡ Evolve"].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-pill bg-white/80 border border-border-default font-body text-sm text-text-secondary"
                >
                  {feature}
                </span>
              ))}
            </div>

            <Link href="/tamagotchi">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-era-jurassic to-stage-hatchling text-white font-display font-bold text-lg shadow-lg shadow-era-jurassic/25 cursor-pointer"
              >
                Start Caring
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
