"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { DinoEntry } from "@/lib/types";
import { ERA_COLORS, DIET_COLORS } from "@/lib/constants";
import { formatDexNumber } from "@/lib/utils";

interface DinoSelectorProps {
  dinos: DinoEntry[];
  isOpen: boolean;
  onSelect: (dinoId: number) => void;
  onClose: () => void;
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));
}

export function DinoSelector({ dinos, isOpen, onSelect, onClose }: DinoSelectorProps) {
  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const searchId = useId();

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const filtered = dinos.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
      if (focusableElements.length === 0) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-cream rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-border-default overscroll-contain"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border-default">
              <div className="flex items-center justify-between mb-4">
                <h2 id={titleId} className="font-display font-bold text-xl text-text-primary">
                  Choose Your Dino
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close dinosaur selector"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  ×
                </button>
              </div>

              <label htmlFor={searchId} className="sr-only">
                Search dinosaurs
              </label>
              <input
                ref={searchInputRef}
                id={searchId}
                name="dino-search"
                type="search"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dinosaurs…"
                className="w-full px-4 py-2.5 rounded-xl border border-border-default bg-white font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
              />
            </div>

            {/* Dino list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.map((dino, i) => {
                const eraColor = ERA_COLORS[dino.era];
                const dietColor = DIET_COLORS[dino.diet];

                return (
                  <motion.button
                    key={dino.id}
                    initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: i * 0.02 }}
                    onClick={() => onSelect(dino.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-border-default hover:border-accent/30 hover:shadow-sm transition-[border-color,box-shadow] text-left cursor-pointer group"
                  >
                    {/* Mini art placeholder */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: eraColor.light }}
                    >
                      🦕
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] tracking-wider" style={{ color: eraColor.primary }}>
                          {formatDexNumber(dino.id)}
                        </span>
                        <span className="font-display font-bold text-sm text-text-primary truncate">
                          {dino.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: eraColor.light, color: eraColor.dark }}
                        >
                          {dino.era}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {dietColor.emoji} {dino.diet}
                        </span>
                      </div>
                    </div>

                    <span className="text-text-muted/40 group-hover:text-accent transition-colors">→</span>
                  </motion.button>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="font-body text-sm text-text-muted">No dinosaurs found</p>
                </div>
              )}
            </div>

            {/* Random button */}
            <div className="p-4 border-t border-border-default">
              <button
                onClick={() => {
                  const random = dinos[Math.floor(Math.random() * dinos.length)];
                  onSelect(random.id);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-era-triassic/10 via-era-jurassic/10 to-era-cretaceous/10 border border-border-default font-display font-bold text-sm text-text-secondary hover:text-text-primary hover:shadow-sm transition-[border-color,box-shadow,color] cursor-pointer"
              >
                🎲 Random Dino
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
