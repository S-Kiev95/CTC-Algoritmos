"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { PlayerSpeed, StepPlayer } from "@/hooks/useStepPlayer";
import { useSoundEnabled } from "@/lib/sound";

const SPEEDS: PlayerSpeed[] = [0.5, 1, 1.5, 2, 4];

type Props = {
  player: StepPlayer;
};

export function PlayerControls({ player }: Props) {
  const {
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
  } = player;

  const [soundOn, setSoundOn] = useSoundEnabled();

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-zinc-500">
          Paso {total === 0 ? 0 : index + 1} / {total}
        </span>

        <div className="flex items-center gap-1">
          <IconButton onClick={reset} title="Reiniciar (R)">
            <RotateCcw className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={prev} disabled={isFirst} title="Anterior (←)">
            <SkipBack className="h-4 w-4" />
          </IconButton>
          <button
            onClick={togglePlay}
            disabled={total === 0}
            title={isPlaying ? "Pausar (espacio)" : "Reproducir (espacio)"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </button>
          <IconButton onClick={next} disabled={isLast} title="Siguiente (→)">
            <SkipForward className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-1.5">
          <IconButton
            onClick={() => setSoundOn(!soundOn)}
            title={soundOn ? "Silenciar" : "Activar sonido"}
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-zinc-400" />
            )}
          </IconButton>
          <span className="text-xs text-zinc-500">Velocidad</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value) as PlayerSpeed)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={index}
        onChange={(e) => goTo(Number(e.target.value))}
        disabled={total === 0}
        className="w-full accent-zinc-900 dark:accent-zinc-100"
      />
    </div>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}
