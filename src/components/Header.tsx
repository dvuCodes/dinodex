"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Dex" },
  { href: "/tamagotchi", label: "Dino Care" },
];

export function Header() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-3">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-[background-color,box-shadow] duration-200 hover:bg-white/80 hover:shadow-[0_12px_26px_rgba(28,25,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <motion.div
            initial={reduceMotion ? false : { rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 200, damping: 12, delay: 0.1 }
            }
            className="relative"
          >
            <span className="text-3xl drop-shadow-sm" aria-hidden="true">
              🦕
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          </motion.div>
          <div>
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
              className="font-display text-[28px] font-black leading-tight tracking-tight block"
            >
              <span className="bg-gradient-to-r from-era-cretaceous via-accent to-era-jurassic bg-clip-text text-transparent">
                DINODEX
              </span>
            </motion.span>
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.3, delay: 0.35 }}
              className="font-body text-[11px] text-text-muted -mt-1 tracking-widest uppercase block"
            >
              Dinosaur Encyclopedia
            </motion.span>
          </div>
        </Link>

        {/* Navigation */}
        <motion.nav
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.4 }}
          className="ml-auto flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              (link.href === "/" && pathname === "/") ||
              pathname === link.href ||
              pathname.startsWith(link.href + "/") ||
              (link.href === "/" && pathname.startsWith("/dex"));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={buttonVariants({
                  variant: "nav",
                  size: "sm",
                  active: isActive,
                  className: isActive
                    ? "font-medium"
                    : "text-text-secondary",
                })}
              >
                {link.label}
              </Link>
            );
          })}
        </motion.nav>
      </div>
      {/* Gradient bottom border — era colors flowing left to right */}
      <div className="h-[2px] bg-gradient-to-r from-era-triassic via-era-jurassic to-era-cretaceous" />
    </header>
  );
}
