"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface CountUpProps {
  target: number;
  duration?: number;
  suffix?: string;
}

function CountUp({ target, duration = 2, suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const increment = target / (duration * 60);
    let frame: number;

    function animate() {
      start += increment;
      if (start >= target) {
        setCount(target);
        return;
      }
      setCount(Math.floor(start));
      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="font-display font-black text-4xl sm:text-5xl md:text-6xl">
      {count}{suffix}
    </span>
  );
}

const stats = [
  { value: 30, suffix: "", label: "Species", color: "from-era-cretaceous to-accent", icon: "🦕" },
  { value: 3, suffix: "", label: "Ancient Eras", color: "from-era-triassic to-era-jurassic", icon: "🌍" },
  { value: 90, suffix: "", label: "Evolutions", color: "from-era-jurassic to-era-triassic", icon: "⚡" },
  { value: 1, suffix: "", label: "Tamagotchi", color: "from-accent to-era-cretaceous", icon: "🥚" },
];

export function StatsBanner() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-text-primary">
            The Collection
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-era-triassic via-era-jurassic to-era-cretaceous rounded-full mx-auto mt-3" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative text-center p-6 rounded-2xl bg-white/70 border border-border-default shadow-sm hover:shadow-md transition-shadow group"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform" aria-hidden="true">
                {stat.icon}
              </span>
              <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </span>
              <p className="font-body text-sm text-text-secondary mt-1 tracking-wide uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
