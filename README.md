# Algoritmos — visualizaciones interactivas

Curso de algoritmos y estructuras de datos con visualizaciones paso a paso, código Python sincronizado y material de lectura tipo apunte.

Cada tema combina:

- **Teoría** — analogías de la vida cotidiana, preguntas de comprensión y un ejercicio guiado en Python.
- **Animación** — visualización interactiva con controles paso a paso, atajos de teclado y un panel "watch" estilo debugger.
- **Código** — el Python que corresponde al algoritmo, con la línea activa resaltada en cada paso.

## Temas cubiertos

| Tema | Estado |
| --- | --- |
| Notación Big O | Borrador |
| Recursividad | Borrador |
| Arreglos (1D, 2D, granos de arroz) | ✅ |
| Ordenación | Borrador |
| Listas enlazadas | ✅ |
| Pilas (Stack) | ✅ teoría |
| Colas (Queue) | ✅ teoría |
| Tablas hash | ✅ |
| Árboles (recorridos) | ✅ |
| Árboles binarios (BST: insertar, buscar, recorridos) | ✅ |
| Heap / Cola de prioridad | ✅ teoría |
| Grafos | ✅ |

## Stack

- **Next.js 16** (App Router, Turbopack) en modo *static export*
- **React 19**
- **Tailwind CSS 4**
- **Framer Motion 12** para animaciones declarativas
- **Shiki** para syntax highlighting del código Python
- **TypeScript** estricto

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:3000
```

Atajos en cualquier animación:

- `→` / `←` — siguiente / anterior paso
- `Espacio` — play / pausa
- `R` — reiniciar

## Build de producción

```bash
npm run build      # genera out/ con HTML estático
```

El sitio queda en `out/` listo para servir desde cualquier host estático.

## Deploy

El repo incluye `netlify.toml` con la configuración de build, Node 20 y headers de cache + seguridad. Conectando el repo en Netlify se despliega automáticamente — detecta el archivo y no requiere configuración adicional.

## Estructura

```
src/
├── app/                # rutas (App Router) — una carpeta por tema
│   ├── temas/<slug>/
│   └── layout.tsx      # sidebar + main
├── components/
│   ├── AlgorithmPlayer.tsx   # reproductor genérico paso a paso
│   ├── Teoria.tsx            # layout reusable de tab "Teoría"
│   └── algorithms/           # visualizaciones específicas (BSTView, Array1D, etc.)
├── hooks/
│   └── useStepPlayer.ts      # estado del reproductor + autoplay
└── lib/
    ├── algorithms/<tema>/    # generadores de Step[] por algoritmo
    ├── topics.ts             # registro de temas (icono, descripción)
    └── types.ts              # Step<TState>, WatchEntry
```

## Convención de animaciones

Cada algoritmo se modela como una lista de `Step<TState>` precomputada:

```ts
type Step<TState> = {
  state: TState;        // estado de la estructura en ese instante
  line: number;         // línea de código activa
  note?: string;        // explicación textual del paso
  watch?: WatchEntry[]; // variables en scope (estilo debugger)
};
```

El componente `<AlgorithmPlayer>` recibe `code`, `steps` y una función `renderVisualization(step)` — no necesita saber del algoritmo en sí. Eso permite reusar el mismo reproductor para arrays, listas, árboles, grafos.

## Licencia

MIT.
