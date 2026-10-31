"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Castle,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Dices,
  Dumbbell,
  Fence,
  Ghost,
  Home,
  Library,
  Lightbulb,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Scissors,
  Spline,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TOPICS } from "@/lib/topics";
import { PYTHON_POINTS } from "@/lib/python/points";
import { EXERCISES } from "@/lib/ejercicios/exercises";
import { CITIES } from "@/lib/mapas/cities";
import { LIBRARIES } from "@/lib/librerias/libraries";

const STORAGE_KEY = "sidebar-collapsed";

/**
 * Sidebar con colapso persistente en localStorage. Cuando está colapsado
 * solo se ven los iconos — el resto del layout (main flex-1) se ensancha
 * automáticamente al cambiar la width del aside.
 */
export function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [collapsed, setCollapsed] = useState(false);

  // Cargar preferencia (efecto solo en cliente, evita mismatch de SSR)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <aside
      className={[
        "shrink-0 border-r border-zinc-200 bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950",
        collapsed ? "w-14" : "w-64",
      ].join(" ")}
    >
      <div className="sticky top-0 flex h-full flex-col">
        {/* Cabecera + toggle */}
        <div
          className={[
            "flex items-center border-b border-zinc-200 dark:border-zinc-800",
            collapsed ? "justify-center px-2 py-4" : "justify-between px-5 py-4",
          ].join(" ")}
        >
          {!collapsed && (
            <Link href="/" className="block">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Curso
              </p>
              <h1 className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Algoritmos
              </h1>
            </Link>
          )}
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            title={collapsed ? "Expandir" : "Colapsar"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          className={[
            "flex-1 overflow-y-auto py-3",
            collapsed ? "px-2" : "px-3",
          ].join(" ")}
        >
          <SidebarLink
            href="/"
            icon={<Home className="h-4 w-4 shrink-0" />}
            label="Inicio"
            active={isHome}
            collapsed={collapsed}
          />

          {/* Secciones desplegables arriba de los temas. */}
          <PythonGroup collapsed={collapsed} />
          <EjerciciosGroup collapsed={collapsed} />
          <RecorridoLink collapsed={collapsed} />
          <MinimaxLink collapsed={collapsed} />
          <AlfaBetaLink collapsed={collapsed} />
          <AristasLink collapsed={collapsed} />
          <VisibilidadLink collapsed={collapsed} />
          <TowerDefenseLink collapsed={collapsed} />
          <DanoLink collapsed={collapsed} />
          <LineasLink collapsed={collapsed} />
          <PacmanLink collapsed={collapsed} />
          <MapasGroup collapsed={collapsed} />
          <LibreriasGroup collapsed={collapsed} />

          {!collapsed && (
            <p className="mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Temas
            </p>
          )}
          {collapsed && (
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />
          )}

          <ul
            className={["space-y-0.5", collapsed ? "mt-0" : "mt-1.5"].join(" ")}
          >
            {TOPICS.map((topic) => {
              const href = `/temas/${topic.slug}`;
              const active = pathname.startsWith(href);
              const Icon = topic.icon;
              return (
                <li key={topic.slug} className="flex items-center gap-1">
                  <SidebarLink
                    href={href}
                    icon={<Icon className="h-4 w-4 shrink-0" />}
                    label={topic.title}
                    active={active}
                    collapsed={collapsed}
                    className="flex-1"
                  />
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  collapsed,
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  className?: string;
}) {
  const baseClasses = [
    "flex items-center rounded-md text-sm transition-colors",
    active
      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
    collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2",
    className,
  ].join(" ");

  return (
    <Link href={href} className={baseClasses} title={collapsed ? label : undefined}>
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

const PY_GROUP_KEY = "python-group-open";

/**
 * Grupo "Python" desplegable en el sidebar.
 */
function PythonGroup({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(PY_GROUP_KEY);
    if (saved === "false") setOpen(false);
  }, []);


  const sectionActive = pathname.startsWith("/python");

  // Sidebar colapsado: solo un icono que linkea al landing.
  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/python"
          title="Python"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            sectionActive
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Code2 className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  function toggleOpen() {
    setOpen((o) => {
      localStorage.setItem(PY_GROUP_KEY, String(!o));
      return !o;
    });
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        <button
          onClick={toggleOpen}
          aria-expanded={open}
          className={[
            "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            sectionActive
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Code2 className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Python</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      </div>

      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {PYTHON_POINTS.map((point) => {
            const href = `/python/${point.slug}`;
            const active = pathname.startsWith(href);
            const Icon = point.icon;

            if (!point.ready) {
              return (
                <li
                  key={point.slug}
                  title="Próximamente"
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{point.title}</span>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                </li>
              );
            }

            return (
              <li key={point.slug}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{point.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const EJ_GROUP_KEY = "ejercicios-group-open";

/**
 * Grupo "Ejercicios prácticos" en el sidebar.
 */
function EjerciciosGroup({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(EJ_GROUP_KEY);
    if (saved === "false") setOpen(false);
  }, []);


  const sectionActive = pathname.startsWith("/ejercicios");


  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/ejercicios"
          title="Ejercicios prácticos"
          className={[
            "flex h-9 w-full EXERCISES-center justify-center rounded-md transition-colors",
            sectionActive
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Dumbbell className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  function toggleOpen() {
    setOpen((o) => {
      localStorage.setItem(EJ_GROUP_KEY, String(!o));
      return !o;
    });
  }

  return (
    <div className="mt-1">
      <div className="flex EXERCISES-center gap-1">
        <button
          onClick={toggleOpen}
          aria-expanded={open}
          className={[
            "flex flex-1 EXERCISES-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            sectionActive
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Dumbbell className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Ejercicios</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      </div>

      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {EXERCISES.map((ex) => {
            const href = `/ejercicios/${ex.slug}`;
            const active = pathname.startsWith(href);
            const Icon = ex.icon;

            if (!ex.ready) {
              return (
                <li
                  key={ex.slug}
                  title="Próximamente"
                  className="flex cursor-not-allowed EXERCISES-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{ex.title}</span>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                </li>
              );
            }

            return (
              <li key={ex.slug} className="flex EXERCISES-center gap-1">
                <Link
                  href={href}
                  className={[
                    "flex flex-1 EXERCISES-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{ex.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Link simple "Recorrer laberinto" (una sola página con pestañas, sin acordeón).
 */
function RecorridoLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/recorrido");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/recorrido"
          title="Recorrer laberinto"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Route className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/recorrido"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Route className="h-4 w-4 shrink-0" />
        <span className="flex-1">Recorrer laberinto</span>
      </Link>
    </div>
  );
}

const MAPS_GROUP_KEY = "mapas-group-open";

/** Grupo "Mapas" en el sidebar: una entrada por ciudad. */
function MapasGroup({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(MAPS_GROUP_KEY);
    if (saved === "false") setOpen(false);
  }, []);


  const sectionActive = pathname.startsWith("/mapas");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/mapas"
          title="Mapas"
          className={[
            "flex h-9 w-full CITIES-center justify-center rounded-md transition-colors",
            sectionActive
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <MapIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  function toggleOpen() {
    setOpen((o) => {
      localStorage.setItem(MAPS_GROUP_KEY, String(!o));
      return !o;
    });
  }

  return (
    <div className="mt-1">
      <div className="flex CITIES-center gap-1">
        <button
          onClick={toggleOpen}
          aria-expanded={open}
          className={[
            "flex flex-1 CITIES-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            sectionActive
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <MapIcon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Mapas</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      </div>

      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {CITIES.map((c) => {
            const href = `/mapas/${c.slug}`;
            const active = pathname.startsWith(href);
            const Icon = c.icon;

            if (!c.ready) {
              return (
                <li
                  key={c.slug}
                  title="Próximamente"
                  className="flex cursor-not-allowed CITIES-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{c.title}</span>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                </li>
              );
            }

            return (
              <li key={c.slug} className="flex CITIES-center gap-1">
                <Link
                  href={href}
                  className={[
                    "flex flex-1 CITIES-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const LIBS_GROUP_KEY = "librerias-group-open";

/** Grupo "Librerías" en el sidebar: una entrada por librería. */
function LibreriasGroup({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(LIBS_GROUP_KEY);
    if (saved === "false") setOpen(false);
  }, []);


  const sectionActive = pathname.startsWith("/librerias");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/librerias"
          title="Librerías"
          className={[
            "flex h-9 w-full LIBRARIES-center justify-center rounded-md transition-colors",
            sectionActive
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Library className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  function toggleOpen() {
    setOpen((o) => {
      localStorage.setItem(LIBS_GROUP_KEY, String(!o));
      return !o;
    });
  }

  return (
    <div className="mt-1">
      <div className="flex LIBRARIES-center gap-1">
        <button
          onClick={toggleOpen}
          aria-expanded={open}
          className={[
            "flex flex-1 LIBRARIES-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            sectionActive
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Library className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Librerías</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </button>
      </div>

      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {LIBRARIES.map((l) => {
            const href = `/librerias/${l.slug}`;
            const active = pathname.startsWith(href);
            const Icon = l.icon;

            if (!l.ready) {
              return (
                <li
                  key={l.slug}
                  title="Próximamente"
                  className="flex cursor-not-allowed LIBRARIES-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{l.title}</span>
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                </li>
              );
            }

            return (
              <li key={l.slug} className="flex LIBRARIES-center gap-1">
                <Link
                  href={href}
                  className={[
                    "flex flex-1 LIBRARIES-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Link simple "Minimax" (una página con pestañas). */
function MinimaxLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/minimax");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/minimax"
          title="Minimax"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Brain className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/minimax"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Brain className="h-4 w-4 shrink-0" />
        <span className="flex-1">Minimax</span>
      </Link>
    </div>
  );
}

/** Link simple "Poda alfa-beta" (una página con pestañas). */
function AlfaBetaLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/alfa-beta");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/alfa-beta"
          title="Poda alfa-beta"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Scissors className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/alfa-beta"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Scissors className="h-4 w-4 shrink-0" />
        <span className="flex-1">Poda alfa-beta</span>
      </Link>
    </div>
  );
}

/** Link simple "Aristas y muros" (una página con pestañas). */
function AristasLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/aristas");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/aristas"
          title="Aristas y muros"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Fence className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/aristas"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Fence className="h-4 w-4 shrink-0" />
        <span className="flex-1">Aristas y muros</span>
      </Link>
    </div>
  );
}

/** Link simple "Visibilidad 2D" (una página con pestañas). */
function VisibilidadLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/visibilidad");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/visibilidad"
          title="Visibilidad 2D"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Lightbulb className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/visibilidad"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Lightbulb className="h-4 w-4 shrink-0" />
        <span className="flex-1">Visibilidad 2D</span>
      </Link>
    </div>
  );
}

/** Link simple "Tower Defense" (una página con pestañas). */
function TowerDefenseLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/tower-defense");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/tower-defense"
          title="Tower Defense"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Castle className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/tower-defense"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Castle className="h-4 w-4 shrink-0" />
        <span className="flex-1">Tower Defense</span>
      </Link>
    </div>
  );
}

/** Link simple "Daño en juegos" (una página con pestañas). */
function DanoLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/dano");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/dano"
          title="Daño en juegos"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Dices className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/dano"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Dices className="h-4 w-4 shrink-0" />
        <span className="flex-1">Daño en juegos</span>
      </Link>
    </div>
  );
}

/** Link simple "Trazar líneas" (una página con pestañas). */
function LineasLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/lineas");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/lineas"
          title="Trazar líneas"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Spline className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/lineas"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Spline className="h-4 w-4 shrink-0" />
        <span className="flex-1">Trazar líneas</span>
      </Link>
    </div>
  );
}

/** Link simple "Laberinto Pacman" (una página con pestañas). */
function PacmanLink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();


  const active = pathname.startsWith("/pacman");

  if (collapsed) {
    return (
      <div className="mt-1">
        <Link
          href="/pacman"
          title="Laberinto Pacman"
          className={[
            "flex h-9 w-full items-center justify-center rounded-md transition-colors",
            active
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900",
          ].join(" ")}
        >
          <Ghost className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <Link
        href="/pacman"
        className={[
          "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900",
        ].join(" ")}
      >
        <Ghost className="h-4 w-4 shrink-0" />
        <span className="flex-1">Laberinto Pacman</span>
      </Link>
    </div>
  );
}
