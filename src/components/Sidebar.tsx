"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Eye,
  EyeOff,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TOPICS } from "@/lib/topics";
import { PYTHON_POINTS } from "@/lib/python/points";
import { useVisibility } from "./VisibilityProvider";
import { AdminControls } from "./AdminControls";

const STORAGE_KEY = "sidebar-collapsed";

/**
 * Sidebar con colapso persistente en localStorage. Cuando está colapsado
 * solo se ven los iconos — el resto del layout (main flex-1) se ensancha
 * automáticamente al cambiar la width del aside.
 *
 * La lista de temas se filtra según la visibilidad: los estudiantes solo ven
 * los temas habilitados; el profesor (logueado) ve todos, con un toggle para
 * mostrar/ocultar cada uno.
 */
export function Sidebar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [collapsed, setCollapsed] = useState(false);

  const { isAdmin, canSee, loading, toggleTopic, visibility } = useVisibility();

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

  // El profesor ve todos; el estudiante solo los habilitados.
  const visibleTopics = isAdmin ? TOPICS : TOPICS.filter((t) => canSee(t.slug));

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

          {/* Sección Python: grupo desplegable arriba de los temas. */}
          <PythonGroup collapsed={collapsed} />

          {!collapsed && (
            <p className="mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Temas
            </p>
          )}
          {collapsed && (
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />
          )}

          {/* Estado de carga / vacío para estudiantes */}
          {!isAdmin && loading && !collapsed && (
            <p className="mt-2 px-3 text-xs text-zinc-400">Cargando temas…</p>
          )}
          {!isAdmin && !loading && visibleTopics.length === 0 && !collapsed && (
            <p className="mt-2 px-3 text-xs text-zinc-400">
              Todavía no hay temas habilitados.
            </p>
          )}

          <ul
            className={["space-y-0.5", collapsed ? "mt-0" : "mt-1.5"].join(" ")}
          >
            {visibleTopics.map((topic) => {
              const href = `/temas/${topic.slug}`;
              const active = pathname.startsWith(href);
              const Icon = topic.icon;
              const isVisible = visibility[topic.slug] === true;
              return (
                <li key={topic.slug} className="flex items-center gap-1">
                  <SidebarLink
                    href={href}
                    icon={<Icon className="h-4 w-4 shrink-0" />}
                    label={topic.title}
                    active={active}
                    collapsed={collapsed}
                    // En modo profesor atenuamos los temas ocultos.
                    dimmed={isAdmin && !isVisible}
                    className="flex-1"
                  />
                  {isAdmin && !collapsed && (
                    <button
                      onClick={() => void toggleTopic(topic.slug, !isVisible)}
                      title={isVisible ? "Ocultar a estudiantes" : "Mostrar a estudiantes"}
                      aria-label={isVisible ? "Ocultar tema" : "Mostrar tema"}
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                        isVisible
                          ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                      ].join(" ")}
                    >
                      {isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pie: control de acceso de profesor */}
        <div
          className={[
            "border-t border-zinc-200 dark:border-zinc-800",
            collapsed ? "flex justify-center px-2 py-3" : "px-5 py-3",
          ].join(" ")}
        >
          <AdminControls collapsed={collapsed} />
        </div>
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
  dimmed = false,
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  dimmed?: boolean;
  className?: string;
}) {
  const baseClasses = [
    "flex items-center rounded-md text-sm transition-colors",
    active
      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
    collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2",
    dimmed ? "opacity-40" : "",
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
 * Grupo "Python" desplegable en el sidebar. Toda la sección se controla con un
 * único slug de visibilidad: `python`. El estudiante solo ve el grupo si está
 * habilitado; el profesor lo ve siempre, atenuado si está oculto, con un toggle
 * 👁 en el header.
 */
function PythonGroup({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { isAdmin, canSee, visibility, toggleTopic } = useVisibility();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(PY_GROUP_KEY);
    if (saved === "false") setOpen(false);
  }, []);

  // El estudiante no ve nada si la sección está oculta.
  if (!isAdmin && !canSee("python")) return null;

  const sectionActive = pathname.startsWith("/python");
  const isVisible = visibility["python"] === true;
  const dimmed = isAdmin && !isVisible;

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
            dimmed ? "opacity-40" : "",
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
    <div className={["mt-3", dimmed ? "opacity-50" : ""].join(" ")}>
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
        {isAdmin && (
          <button
            onClick={() => void toggleTopic("python", !isVisible)}
            title={isVisible ? "Ocultar a estudiantes" : "Mostrar a estudiantes"}
            aria-label={isVisible ? "Ocultar Python" : "Mostrar Python"}
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
              isVisible
                ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            ].join(" ")}
          >
            {isVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        )}
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
