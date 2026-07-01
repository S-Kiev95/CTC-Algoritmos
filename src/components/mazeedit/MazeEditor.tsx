"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, MapPin, Pencil, Play, RotateCcw, Trash2, Wand2 } from "lucide-react";
import {
  type Algo,
  type EditMaze,
  type SearchResult,
  perfectMazeWalls,
  pickCell,
  pickEdge,
  rc,
  search,
  wkey,
} from "@/lib/mazeedit/editor";
import { playSound } from "@/lib/sound";

const ROWS = 10;
const COLS = 14;
const CELL = 30;
const W = COLS * CELL;
const H = ROWS * CELL;

type Mode = "wall" | "start" | "goal";

type Mark = "visited" | "frontier" | "current" | "path";

const MARK_FILL: Record<Mark, string> = {
  visited: "fill-sky-200 dark:fill-sky-900/60",
  frontier: "fill-amber-200 dark:fill-amber-900/50",
  current: "fill-amber-400 dark:fill-amber-500",
  path: "fill-yellow-300 dark:fill-yellow-500/70",
};

/**
 * Editor de laberinto **por aristas**: el alumno hace clic (o arrastra) cerca de
 * una arista para poner o sacar una pared, coloca inicio y meta, y corre BFS o A*
 * para ver cómo exploran. Reimplementa la técnica de "pixel lookup" (celda vs
 * arista) de redblobgames/grids/edges.
 */
export function MazeEditor() {
  const [walls, setWalls] = useState<Set<string>>(() => new Set());
  const [start, setStart] = useState(0);
  const [goal, setGoal] = useState(ROWS * COLS - 1);
  const [mode, setMode] = useState<Mode>("wall");
  const [algo, setAlgo] = useState<Algo>("astar");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const paintAdd = useRef(true);
  const lastEdge = useRef<string | null>(null);

  const maze: EditMaze = useMemo(
    () => ({ rows: ROWS, cols: COLS, walls, start, goal }),
    [walls, start, goal],
  );

  // Reinicia la búsqueda cuando se edita el laberinto.
  const clearResult = () => {
    setResult(null);
    setFrame(0);
    setPlaying(false);
  };

  // Bucle de animación. Avanza en pasos proporcionales al tamaño de la búsqueda
  // para que una búsqueda chica se vea fluida y una grande (BFS en toda la
  // grilla) no se haga eterna: cualquier recorrido termina en ~100 ticks.
  useEffect(() => {
    if (!playing || !result) return;
    const last = result.frames.length - 1;
    if (frame >= last) {
      setPlaying(false);
      return;
    }
    const stepSize = Math.max(1, Math.ceil(result.frames.length / 70));
    const id = setTimeout(() => setFrame((f) => Math.min(f + stepSize, last)), 30);
    return () => clearTimeout(id);
  }, [playing, frame, result]);

  // Coordenadas locales (viewBox) del puntero.
  const localXY = (e: React.PointerEvent): [number, number] | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return [p.x, p.y];
  };

  const applyEdge = (key: string) => {
    setWalls((prev) => {
      const next = new Set(prev);
      if (paintAdd.current) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const xy = localXY(e);
    if (!xy) return;
    const [x, y] = xy;
    if (mode === "wall") {
      const edge = pickEdge(x, y, ROWS, COLS, CELL);
      if (!edge) return;
      const key = wkey(edge[0], edge[1]);
      paintAdd.current = !walls.has(key); // clic alterna; el arrastre mantiene
      applyEdge(key);
      lastEdge.current = key;
      dragging.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // pointerId inválido: el arrastre igual funciona.
      }
      playSound(paintAdd.current ? "place" : "pop");
      clearResult();
    } else {
      const cell = pickCell(x, y, ROWS, COLS, CELL);
      if (mode === "start" && cell !== goal) setStart(cell);
      if (mode === "goal" && cell !== start) setGoal(cell);
      playSound("tick");
      clearResult();
    }
  };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || mode !== "wall") return;
    const xy = localXY(e);
    if (!xy) return;
    const edge = pickEdge(xy[0], xy[1], ROWS, COLS, CELL);
    if (!edge) return;
    const key = wkey(edge[0], edge[1]);
    if (key === lastEdge.current) return;
    lastEdge.current = key;
    applyEdge(key);
  };

  const onUp = () => {
    dragging.current = false;
    lastEdge.current = null;
  };

  const runSearch = () => {
    const res = search(maze, algo);
    setResult(res);
    setFrame(0);
    setPlaying(true);
    playSound(res.found ? "found" : "error");
  };

  const generate = () => {
    setWalls(perfectMazeWalls(ROWS, COLS));
    setStart(0);
    setGoal(ROWS * COLS - 1);
    clearResult();
  };

  const clearWalls = () => {
    setWalls(new Set());
    clearResult();
  };

  // Marcas de la celda para el frame actual.
  const marks = useMemo(() => {
    const m = new Map<number, Mark>();
    if (!result) return m;
    const fr = result.frames[Math.min(frame, result.frames.length - 1)];
    for (const v of fr.visited) m.set(v, "visited");
    for (const f of fr.frontier) m.set(f, "frontier");
    if (fr.current != null) m.set(fr.current, "current");
    if (fr.path) for (const p of fr.path) m.set(p, "path");
    return m;
  }, [result, frame]);

  const cellFill = (i: number): string => {
    if (i === start) return "fill-emerald-400 dark:fill-emerald-500";
    if (i === goal) return "fill-rose-400 dark:fill-rose-500";
    const mk = marks.get(i);
    return mk ? MARK_FILL[mk] : "fill-white dark:fill-zinc-900";
  };

  const cur = result?.frames[Math.min(frame, (result?.frames.length ?? 1) - 1)];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <Toolbar
        mode={mode}
        setMode={setMode}
        algo={algo}
        setAlgo={(a) => {
          setAlgo(a);
          clearResult();
        }}
        onRun={runSearch}
        onGenerate={generate}
        onClearWalls={clearWalls}
        onReset={clearResult}
        hasResult={!!result}
      />

      <div className="w-full overflow-auto">
        <svg
          ref={svgRef}
          viewBox={`-2 -2 ${W + 4} ${H + 4}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="mx-auto block w-full max-w-lg touch-none select-none"
          style={{ cursor: mode === "wall" ? "crosshair" : "pointer" }}
        >
          {/* Celdas (fondo + estado de búsqueda) */}
          {Array.from({ length: ROWS * COLS }).map((_, i) => {
            const [r, c] = rc(i, COLS);
            return (
              <rect
                key={`c${i}`}
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                className={cellFill(i)}
              />
            );
          })}

          {/* Líneas finas de la grilla */}
          {Array.from({ length: COLS + 1 }).map((_, c) => (
            <line
              key={`gv${c}`}
              x1={c * CELL}
              y1={0}
              x2={c * CELL}
              y2={H}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: ROWS + 1 }).map((_, r) => (
            <line
              key={`gh${r}`}
              x1={0}
              y1={r * CELL}
              x2={W}
              y2={r * CELL}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth={1}
            />
          ))}

          {/* Paredes (aristas bloqueadas) — líneas gruesas */}
          {[...walls].map((key) => {
            const [a, b] = key.split("-").map(Number);
            const [ra, ca] = rc(a, COLS);
            const [rb, cb] = rc(b, COLS);
            // Vertical si son vecinos horizontales; horizontal si verticales.
            if (rb === ra) {
              const x = Math.max(ca, cb) * CELL;
              return (
                <line
                  key={`w${key}`}
                  x1={x}
                  y1={ra * CELL}
                  x2={x}
                  y2={(ra + 1) * CELL}
                  className="stroke-zinc-700 dark:stroke-zinc-300"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            }
            const y = Math.max(ra, rb) * CELL;
            return (
              <line
                key={`w${key}`}
                x1={ca * CELL}
                y1={y}
                x2={(ca + 1) * CELL}
                y2={y}
                className="stroke-zinc-700 dark:stroke-zinc-300"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

          {/* Borde exterior */}
          <rect
            x={0}
            y={0}
            width={W}
            height={H}
            fill="none"
            className="stroke-zinc-700 dark:stroke-zinc-300"
            strokeWidth={3}
          />

          {/* Inicio y meta */}
          <StartGoal cell={start} kind="start" />
          <StartGoal cell={goal} kind="goal" />
        </svg>
      </div>

      {/* Estado / contador */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>
          Algoritmo:{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {algo === "astar" ? "A*" : "BFS"}
          </strong>
        </span>
        {cur && (
          <span>
            Celdas exploradas:{" "}
            <strong className="text-zinc-700 dark:text-zinc-300">{cur.explored}</strong>
          </span>
        )}
        {result && !result.found && frame >= result.frames.length - 1 && (
          <span className="font-medium text-rose-500">Sin camino a la meta</span>
        )}
        {result && result.found && result.path.length > 0 && frame >= result.frames.length - 1 && (
          <span className="rounded-md bg-yellow-100 px-2 py-0.5 font-medium text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">
            Camino: {result.path.length - 1} pasos
          </span>
        )}
      </div>

      <div className="max-w-lg text-center text-xs text-zinc-400">
        Hacé clic o arrastrá cerca de una línea para poner o sacar una{" "}
        <strong>pared</strong>. Con <strong>Inicio</strong> / <strong>Meta</strong>{" "}
        movés los puntos. Cambiá entre <strong>BFS</strong> y <strong>A*</strong> y
        mirá cuántas celdas explora cada uno.
      </div>
    </div>
  );
}

function StartGoal({ cell, kind }: { cell: number; kind: "start" | "goal" }) {
  const [r, c] = rc(cell, COLS);
  const cx = c * CELL + CELL / 2;
  const cy = r * CELL + CELL / 2;
  const Icon = kind === "start" ? MapPin : Flag;
  return (
    <g transform={`translate(${cx - 7} ${cy - 7})`} className="text-white">
      <Icon width={14} height={14} strokeWidth={2.5} />
    </g>
  );
}

function Toolbar({
  mode,
  setMode,
  algo,
  setAlgo,
  onRun,
  onGenerate,
  onClearWalls,
  onReset,
  hasResult,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  algo: Algo;
  setAlgo: (a: Algo) => void;
  onRun: () => void;
  onGenerate: () => void;
  onClearWalls: () => void;
  onReset: () => void;
  hasResult: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <ModeBtn active={mode === "wall"} onClick={() => setMode("wall")} icon={<Pencil className="h-3.5 w-3.5" />} label="Pared" />
        <ModeBtn active={mode === "start"} onClick={() => setMode("start")} icon={<MapPin className="h-3.5 w-3.5" />} label="Inicio" />
        <ModeBtn active={mode === "goal"} onClick={() => setMode("goal")} icon={<Flag className="h-3.5 w-3.5" />} label="Meta" />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <ModeBtn active={algo === "bfs"} onClick={() => setAlgo("bfs")} label="BFS" />
        <ModeBtn active={algo === "astar"} onClick={() => setAlgo("astar")} label="A*" />
      </div>

      <button
        onClick={onRun}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
      >
        <Play className="h-3.5 w-3.5" /> Buscar
      </button>

      <button
        onClick={onGenerate}
        title="Generar un laberinto perfecto"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <Wand2 className="h-3.5 w-3.5" /> Laberinto
      </button>
      <button
        onClick={onClearWalls}
        title="Sacar todas las paredes"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <Trash2 className="h-3.5 w-3.5" /> Limpiar
      </button>
      {hasResult && (
        <button
          onClick={onReset}
          title="Borrar el resultado de la búsqueda"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
        </button>
      )}
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
