"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PlayerSpeed = 0.5 | 1 | 1.5 | 2 | 4;

export type StepPlayer = {
  index: number;
  total: number;
  isPlaying: boolean;
  speed: PlayerSpeed;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  reset: () => void;
  togglePlay: () => void;
  setSpeed: (s: PlayerSpeed) => void;
  isFirst: boolean;
  isLast: boolean;
};

const BASE_INTERVAL_MS = 800;

/**
 * Hook genérico para reproducir una secuencia de pasos.
 * Soporta avance manual (prev/next), reproducción automática con velocidad
 * ajustable, y reseteo. La auto-reproducción se detiene al llegar al final.
 */
export function useStepPlayer(total: number): StepPlayer {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlayerSpeed>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFirst = index <= 0;
  const isLast = index >= total - 1;

  const next = useCallback(() => {
    setIndex((i) => (i < total - 1 ? i + 1 : i));
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(total - 1, i));
      setIndex(clamped);
    },
    [total],
  );

  const reset = useCallback(() => {
    setIndex(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => {
      if (!p && index >= total - 1) {
        setIndex(0);
        return true;
      }
      return !p;
    });
  }, [index, total]);

  useEffect(() => {
    if (!isPlaying) return;
    if (index >= total - 1) {
      setIsPlaying(false);
      return;
    }
    const delay = BASE_INTERVAL_MS / speed;
    timerRef.current = setTimeout(() => {
      setIndex((i) => i + 1);
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, index, total, speed]);

  return {
    index,
    total,
    isPlaying,
    speed,
    next,
    prev,
    goTo,
    reset,
    togglePlay,
    setSpeed,
    isFirst,
    isLast,
  };
}
