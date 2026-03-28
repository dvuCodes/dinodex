"use client";

import { motion, useReducedMotion } from "framer-motion";

interface EggCountdownProps {
  timeRemainingMs: number;
  progress: number;
  dinoName: string;
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

export function EggCountdown({ timeRemainingMs, progress, dinoName }: EggCountdownProps) {
  const reduceMotion = useReducedMotion();
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
  const isAlmostReady = progress > 80;
  const isVeryClose = progress > 95;

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

        {reduceMotion ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl select-none">🥚</span>
          </div>
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: isVeryClose
                ? [-8, 8, -6, 6, -8]
                : isAlmostReady
                  ? [-4, 4, -3, 3, -4]
                  : [-2, 2, -1, 1, -2],
            }}
            transition={{
              duration: isVeryClose ? 0.6 : isAlmostReady ? 1.2 : 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-6xl select-none">🥚</span>
          </motion.div>
        )}

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
        <p className="font-body text-xs text-text-muted mt-1.5">
          {isVeryClose
            ? "Almost there... cracks appearing!"
            : isAlmostReady
              ? `${dinoName} is stirring inside...`
              : `Incubating ${dinoName}'s egg...`}
        </p>
      </div>

      <div className="w-full max-w-[200px]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">
            Incubation
          </span>
          <span className="font-mono text-[10px] font-bold" style={{ color: "#A78BFA" }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
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
