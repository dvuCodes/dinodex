"use client";

import { useEffect, useState } from "react";

interface PixelSpriteProps {
  ariaLabel: string;
  artSrc: string;
  displaySizePx: number;
  frameCount: number;
  frameDurationMs: number;
  reduceMotion: boolean | null;
}

export function PixelSprite({
  ariaLabel,
  artSrc,
  displaySizePx,
  frameCount,
  frameDurationMs,
  reduceMotion,
}: PixelSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || frameCount <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frameCount);
    }, frameDurationMs);

    return () => window.clearInterval(interval);
  }, [frameCount, frameDurationMs, reduceMotion]);

  const visibleFrameIndex = reduceMotion || frameCount <= 1 ? 0 : frameIndex;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      data-testid="tamagotchi-pixel-screen"
      className="pixel-screen"
      style={{ width: displaySizePx, height: displaySizePx }}
    >
      <div className="pixel-sprite">
        <div
          data-testid="tamagotchi-pixel-sprite"
          className="pixel-sprite-strip"
          style={{
            width: `${frameCount * 100}%`,
            backgroundImage: `url("${artSrc}")`,
            backgroundSize: "100% 100%",
            transform: `translateX(-${visibleFrameIndex * (100 / Math.max(frameCount, 1))}%)`,
          }}
        />
      </div>
    </div>
  );
}
