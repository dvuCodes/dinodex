"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useArtSource } from "@/hooks/useArtSource";
import { getEggVariantLabel, getTamagotchiEggSheet } from "@/lib/tamagotchi-sprites";

interface EggCountdownProps {
  dinoName: string;
  speciesId: number;
  eggVariantSeed: number;
  timeRemainingMs: number;
  progress: number;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

const RING_SIZE = 160;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function EggCountdown({ dinoName, speciesId, eggVariantSeed, timeRemainingMs, progress }: EggCountdownProps) {
  const reduceMotion = useReducedMotion();
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
  const isAlmostReady = progress > 80;
  const isVeryClose = progress > 95;
  const eggSheet = getTamagotchiEggSheet(speciesId, eggVariantSeed);
  const { artSrc, usingFallback } = useArtSource(eggSheet.expectedSrc, eggSheet.fallbackSrc);
  const frameCount = usingFallback ? eggSheet.fallbackFrameCount : eggSheet.expectedFrameCount;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        {reduceMotion ? (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, rgba(167,139,250,0) 70%)",
            }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(167,139,250,0) 70%)",
            }}
            animate={{
              scale: isAlmostReady ? [1, 1.15, 1] : [1, 1.05, 1],
              opacity: isAlmostReady ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
            }}
            transition={{ duration: isAlmostReady ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0 -rotate-90">
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={STROKE_WIDTH}
          />
          <motion.circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#eggGradient)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="eggGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={
            reduceMotion
              ? { rotate: 0 }
              : {
                  rotate: isVeryClose ? [-6, 6, -4, 4, -6] : isAlmostReady ? [-3, 3, -2, 2, -3] : [0, 2, 0, -2, 0],
                }
          }
          transition={{
            duration: isVeryClose ? 0.6 : isAlmostReady ? 1.2 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="pixel-screen h-[88px] w-[88px] rounded-[1.25rem] border-violet-200/60 bg-[linear-gradient(180deg,#f7f2ff_0%,#efe7ff_100%)]">
            <div
              role="img"
              aria-label={`${dinoName} egg countdown`}
              className="pixel-sprite"
              style={{
                backgroundImage: `url("${artSrc}")`,
                backgroundSize: `${frameCount * 88}px 88px`,
                animation:
                  reduceMotion || frameCount <= 1
                    ? "none"
                    : `tamagotchi-sprite ${frameCount * eggSheet.frameDurationMs}ms steps(${frameCount}) infinite`,
                width: 88,
                height: 88,
              }}
            />
          </div>
        </motion.div>

        {!reduceMotion && isAlmostReady && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute text-sm pointer-events-none"
                style={{
                  left: `${40 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                }}
                animate={{
                  y: [-5, -15, -5],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              >
                ✨
              </motion.div>
            ))}
          </>
        )}
      </div>

      <div className="text-center">
        <p className="font-mono text-2xl font-bold tracking-wider" style={{ color: "#7C3AED" }}>
          {timeRemainingMs <= 0 ? "Hatching!" : formatTime(timeRemainingMs)}
        </p>
        <p className="mt-1.5 font-body text-xs text-text-muted">
          {isVeryClose
            ? "Almost there... cracks appearing!"
            : isAlmostReady
              ? `${dinoName} is stirring inside...`
              : `Incubating ${dinoName}'s ${getEggVariantLabel(eggVariantSeed)} egg...`}
        </p>
      </div>

      <div className="w-full max-w-[200px]">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Incubation
          </span>
          <span className="font-mono text-[10px] font-bold" style={{ color: "#A78BFA" }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          {reduceMotion ? (
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #A78BFA, #C4B5FD)",
              }}
            />
          ) : (
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #A78BFA, #C4B5FD)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
