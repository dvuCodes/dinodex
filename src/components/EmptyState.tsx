"use client";

import { motion } from "framer-motion";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.span
        className="text-6xl mb-5 block"
        aria-hidden="true"
        animate={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        🦴
      </motion.span>
      <h3 className="font-display text-xl font-bold text-text-primary mb-2">
        No dinosaurs found
      </h3>
      <p className="font-body text-sm text-text-secondary max-w-xs leading-relaxed">
        These prehistoric creatures are hiding! Try different filters or search
        terms to discover them.
      </p>
      <div className="mt-6 flex gap-1">
        {[0.2, 0.4, 0.6].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-text-muted/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}
