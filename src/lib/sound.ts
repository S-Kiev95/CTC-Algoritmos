"use client";

import { useEffect, useState } from "react";

/**
 * Efectos de sonido para las animaciones, sintetizados con la Web Audio API
 * (sin archivos de audio). Hay un único AudioContext perezoso que se crea en la
 * primera reproducción (disparada por un gesto del usuario, así el browser lo
 * permite). El estado on/off se guarda en localStorage.
 */

export type StepSound =
  | "tick"
  | "place"
  | "pop"
  | "carve"
  | "found"
  | "error"
  | "success";

const STORAGE_KEY = "sound-enabled";

let enabled = true;
let loaded = false;
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  const v = window.localStorage.getItem(STORAGE_KEY);
  enabled = v === null ? true : v === "1";
  loaded = true;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = w.AudioContext || w.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isSoundEnabled(): boolean {
  ensureLoaded();
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  loaded = true;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }
  listeners.forEach((l) => l());
  if (value) playSound("tick"); // feedback al activar
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Un beep corto con envolvente exponencial (evita clicks). */
function blip(
  freq: number,
  durMs: number,
  type: OscillatorType = "sine",
  gain = 0.05,
): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durMs / 1000);
  osc.start(t);
  osc.stop(t + durMs / 1000 + 0.02);
}

export function playSound(name: StepSound): void {
  ensureLoaded();
  if (!enabled) return;
  switch (name) {
    case "tick":
      blip(520, 40, "sine", 0.035);
      break;
    case "place":
      blip(660, 70, "triangle", 0.05);
      break;
    case "pop":
      blip(300, 80, "sawtooth", 0.045);
      break;
    case "carve":
      blip(740, 55, "sine", 0.045);
      break;
    case "found":
      blip(880, 110, "triangle", 0.06);
      break;
    case "error":
      blip(170, 110, "square", 0.04);
      break;
    case "success":
      [523, 659, 784, 1047].forEach((f, i) =>
        window.setTimeout(() => blip(f, 150, "triangle", 0.06), i * 85),
      );
      break;
  }
}

/** Hook para el botón de mute: estado reactivo del flag global. */
export function useSoundEnabled(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(isSoundEnabled());
    return subscribe(() => setOn(isSoundEnabled()));
  }, []);
  return [on, setSoundEnabled];
}
