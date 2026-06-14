import { TopicGrid } from "@/components/TopicGrid";

export default function Home() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Curso de algoritmos
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Visualizaciones animadas
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Cada tema combina una animación interactiva con el código Python que
            la genera. Usá los controles para avanzar paso a paso, o dejá que se
            reproduzca solo. La línea resaltada del código siempre coincide con
            lo que ves en pantalla.
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Temas
          </h2>
          <TopicGrid />
        </section>
      </div>
    </div>
  );
}
