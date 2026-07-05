"use client";

import { useEffect, useRef } from "react";

/**
 * Motor de raycasting "estilo Doom": renderiza una vista en primera persona
 * (pseudo-3D) a partir de un mapa 2D. Por cada columna de pantalla se lanza un
 * rayo (DDA sobre la grilla) hasta la primera pared y se dibuja una franja
 * vertical cuya altura es proporcional a 1/distancia. Es el mismo ray casting de
 * la visibilidad 2D, usado para "fingir" 3D. Implementación propia.
 */

// Mapa: '#' = pared, '.' = piso. Filas = Y, columnas = X.
const MAP = [
  "################",
  "#..............#",
  "#..###..####...#",
  "#..#.......#...#",
  "#..#..##...#..##",
  "#.....#........#",
  "#..####..###...#",
  "#.....#....#...#",
  "#..##.#..#.#...#",
  "#..#.....#.....#",
  "#..............#",
  "################",
];
const MAP_W = MAP[0].length;
const MAP_H = MAP.length;

const isWall = (x: number, y: number): boolean => {
  const c = Math.floor(x);
  const r = Math.floor(y);
  if (r < 0 || r >= MAP_H || c < 0 || c >= MAP_W) return true;
  return MAP[r][c] === "#";
};

const RW = 300; // resolución interna
const RH = 188;
const FOV_PLANE = 0.66; // ~66° de campo de visión

export function Raycaster3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = useRef({ x: 2.5, y: 1.5, dir: 0 });
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      keys.current.add(k);
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let raf = 0;
    let last = performance.now();

    const tryMove = (nx: number, ny: number) => {
      const p = player.current;
      const m = 0.18; // margen para no meterse en la pared
      if (!isWall(nx + Math.sign(nx - p.x) * m, p.y)) p.x = nx;
      if (!isWall(p.x, ny + Math.sign(ny - p.y) * m)) p.y = ny;
    };

    const update = (dt: number) => {
      const p = player.current;
      const k = keys.current;
      const speed = 2.8 * dt;
      const rot = 2.6 * dt;
      const fwd = (k.has("arrowup") || k.has("w") ? 1 : 0) - (k.has("arrowdown") || k.has("s") ? 1 : 0);
      const turn = (k.has("arrowright") || k.has("d") ? 1 : 0) - (k.has("arrowleft") || k.has("a") ? 1 : 0);
      if (turn) p.dir += turn * rot;
      if (fwd) {
        const nx = p.x + Math.cos(p.dir) * fwd * speed;
        const ny = p.y + Math.sin(p.dir) * fwd * speed;
        tryMove(nx, ny);
      }
    };

    const render = () => {
      const p = player.current;
      const dirX = Math.cos(p.dir);
      const dirY = Math.sin(p.dir);
      const planeX = -dirY * FOV_PLANE;
      const planeY = dirX * FOV_PLANE;

      // Cielo y piso.
      const skyGrad = ctx.createLinearGradient(0, 0, 0, RH / 2);
      skyGrad.addColorStop(0, "#1e293b");
      skyGrad.addColorStop(1, "#0b1220");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, RW, RH / 2);
      const floorGrad = ctx.createLinearGradient(0, RH / 2, 0, RH);
      floorGrad.addColorStop(0, "#111827");
      floorGrad.addColorStop(1, "#020617");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, RH / 2, RW, RH / 2);

      // Una columna por píxel: DDA hasta la primera pared.
      for (let x = 0; x < RW; x++) {
        const cameraX = (2 * x) / RW - 1;
        const rdx = dirX + planeX * cameraX;
        const rdy = dirY + planeY * cameraX;

        let mapX = Math.floor(p.x);
        let mapY = Math.floor(p.y);
        const deltaX = Math.abs(1 / rdx);
        const deltaY = Math.abs(1 / rdy);

        let stepX: number, stepY: number;
        let sideDistX: number, sideDistY: number;
        if (rdx < 0) { stepX = -1; sideDistX = (p.x - mapX) * deltaX; }
        else { stepX = 1; sideDistX = (mapX + 1 - p.x) * deltaX; }
        if (rdy < 0) { stepY = -1; sideDistY = (p.y - mapY) * deltaY; }
        else { stepY = 1; sideDistY = (mapY + 1 - p.y) * deltaY; }

        let side = 0;
        let guard = 0;
        while (guard++ < 64) {
          if (sideDistX < sideDistY) { sideDistX += deltaX; mapX += stepX; side = 0; }
          else { sideDistY += deltaY; mapY += stepY; side = 1; }
          if (mapX < 0 || mapX >= MAP_W || mapY < 0 || mapY >= MAP_H) break;
          if (MAP[mapY][mapX] === "#") break;
        }

        const perp = side === 0 ? sideDistX - deltaX : sideDistY - deltaY;
        const dist = Math.max(0.05, perp);
        const lineH = RH / dist;
        const start = Math.max(0, -lineH / 2 + RH / 2);
        const end = Math.min(RH, lineH / 2 + RH / 2);

        // Sombreado: por lado (las paredes N/S más oscuras) y por distancia.
        const shade = Math.max(0.12, Math.min(1, 1 - dist / 16)) * (side === 1 ? 0.66 : 1);
        const r = Math.round(190 * shade);
        const g = Math.round(150 * shade);
        const b = Math.round(120 * shade);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, start, 1, end - start);
      }

      drawMinimap(ctx, p, dirX, dirY, planeX, planeY);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      render();
      raf = requestAnimationFrame(frame);
    };
    render(); // primer frame inmediato (por si el rAF arranca pausado)
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Botones táctiles: mantener presionado.
  const hold = (key: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keys.current.add(key);
    },
    onPointerUp: () => keys.current.delete(key),
    onPointerLeave: () => keys.current.delete(key),
  });

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={RW}
        height={RH}
        className="w-full max-w-lg rounded-lg border border-zinc-800"
        style={{ imageRendering: "pixelated", aspectRatio: `${RW} / ${RH}` }}
      />

      <div className="flex items-center gap-2">
        <CtrlBtn label="←" {...hold("arrowleft")} />
        <div className="flex flex-col gap-2">
          <CtrlBtn label="↑" {...hold("arrowup")} />
          <CtrlBtn label="↓" {...hold("arrowdown")} />
        </div>
        <CtrlBtn label="→" {...hold("arrowright")} />
      </div>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        Movete con las <strong>flechas</strong> o <strong>WASD</strong> (o los
        botones). El mapa de arriba a la izquierda es la vista 2D real; el 3D se
        arma dibujando, por cada rayo, una franja más alta cuanto más{" "}
        <strong>cerca</strong> está la pared.
      </p>
    </div>
  );
}

function CtrlBtn({
  label,
  ...handlers
}: {
  label: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}) {
  return (
    <button
      {...handlers}
      className="flex h-10 w-10 select-none items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg text-zinc-700 shadow-sm active:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:active:bg-zinc-700"
    >
      {label}
    </button>
  );
}

/** Minimapa arriba a la izquierda: paredes, jugador y su cono de visión. */
function drawMinimap(
  ctx: CanvasRenderingContext2D,
  p: { x: number; y: number; dir: number },
  dirX: number,
  dirY: number,
  planeX: number,
  planeY: number,
) {
  const s = 7;
  const ox = 6;
  const oy = 6;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#0b0f1a";
  ctx.fillRect(ox - 2, oy - 2, MAP_W * s + 4, MAP_H * s + 4);
  for (let r = 0; r < MAP_H; r++) {
    for (let c = 0; c < MAP_W; c++) {
      ctx.fillStyle = MAP[r][c] === "#" ? "#334155" : "#0f172a";
      ctx.fillRect(ox + c * s, oy + r * s, s - 1, s - 1);
    }
  }
  // Cono de visión (los dos rayos extremos).
  ctx.strokeStyle = "#fcd34d";
  ctx.globalAlpha = 0.5;
  for (const cam of [-1, 1]) {
    const rx = dirX + planeX * cam;
    const ry = dirY + planeY * cam;
    ctx.beginPath();
    ctx.moveTo(ox + p.x * s, oy + p.y * s);
    ctx.lineTo(ox + (p.x + rx * 3) * s, oy + (p.y + ry * 3) * s);
    ctx.stroke();
  }
  // Jugador.
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(ox + p.x * s, oy + p.y * s, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
