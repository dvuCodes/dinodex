"use client";

import { useCallback, useEffect, useState } from "react";
import { getArtRecoveryProbeSrc, shouldAttemptArtRecovery } from "@/lib/utils";

const ART_RECOVERY_INTERVAL_MS = 1500;

export function useArtSource(expectedArtSrc: string, fallbackArtSrc: string) {
  const [artSrc, setArtSrc] = useState(expectedArtSrc);

  useEffect(() => {
    setArtSrc(expectedArtSrc);
  }, [expectedArtSrc]);

  useEffect(() => {
    if (!shouldAttemptArtRecovery(artSrc, fallbackArtSrc) || typeof window === "undefined") {
      return;
    }

    let isDisposed = false;

    const probeExpectedArt = () => {
      const recoveryToken = Date.now().toString();
      const probeSrc = getArtRecoveryProbeSrc(expectedArtSrc, recoveryToken);
      const probeImage = new window.Image();

      probeImage.onload = () => {
        if (!isDisposed) {
          setArtSrc(probeSrc);
        }
      };
      probeImage.onerror = () => {};
      probeImage.src = probeSrc;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        probeExpectedArt();
      }
    };

    const intervalId = window.setInterval(probeExpectedArt, ART_RECOVERY_INTERVAL_MS);

    window.addEventListener("focus", probeExpectedArt);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    probeExpectedArt();

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", probeExpectedArt);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [artSrc, expectedArtSrc, fallbackArtSrc]);

  const handleArtError = useCallback(() => {
    setArtSrc(fallbackArtSrc);
  }, [fallbackArtSrc]);

  return { artSrc, handleArtError };
}
