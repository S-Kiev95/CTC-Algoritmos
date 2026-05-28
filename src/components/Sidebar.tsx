"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { TOPICS } from "@/lib/topics";

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

          {!collapsed && (
            <p className="mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Temas
            </p>
          )}
          {collapsed && (
            <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />
          )}

          <ul
            className={[
              "space-y-0.5",
              collapsed ? "mt-0" : "mt-1.5",
            ].join(" ")}
          >
            {TOPICS.map((topic) => {
              const href = `/temas/${topic.slug}`;
              const active = pathname.startsWith(href);
              const Icon = topic.icon;
              return (
                <li key={topic.slug}>
                  <SidebarLink
                    href={href}
                    icon={<Icon className="h-4 w-4 shrink-0" />}
                    label={topic.title}
                    active={active}
                    collapsed={collapsed}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        {!collapsed && (
          <div className="border-t border-zinc-200 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800">
            Próximo: animaciones por tema.
          </div>
        )}
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  const baseClasses = [
    "flex items-center rounded-md text-sm transition-colors",
    active
      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
    collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3 py-2",
  ].join(" ");

  return (
    <Link href={href} className={baseClasses} title={collapsed ? label : undefined}>
      {icon}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
