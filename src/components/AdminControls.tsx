"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, LogOut, ShieldCheck, X } from "lucide-react";
import { useVisibility } from "./VisibilityProvider";

/**
 * Control de profesor para el pie del sidebar. Si no hay sesión muestra un
 * botón discreto que abre el modal de login; si hay sesión muestra el estado
 * y un botón para salir. Cuando está colapsado el sidebar se reduce a un icono.
 */
export function AdminControls({ collapsed }: { collapsed: boolean }) {
  const { isAdmin, logout } = useVisibility();
  const [open, setOpen] = useState(false);

  if (isAdmin) {
    if (collapsed) {
      return (
        <button
          onClick={logout}
          title="Profesor — cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ShieldCheck className="h-4 w-4" />
        </button>
      );
    }
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Modo profesor
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          Salir
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Acceso de profesor"
        aria-label="Acceso de profesor"
        className={[
          "flex items-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
          collapsed ? "h-8 w-8 justify-center" : "gap-2 px-2 py-1.5 text-xs",
        ].join(" ")}
      >
        <Lock className="h-3.5 w-3.5" />
        {!collapsed && "Profesor"}
      </button>
      {open && <LoginModal onClose={() => setOpen(false)} />}
    </>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useVisibility();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(user, password)) {
      onClose();
    } else {
      setError(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <Lock className="h-4 w-4" />
            Acceso de profesor
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label
              htmlFor="admin-user"
              className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Usuario
            </label>
            <input
              id="admin-user"
              ref={userRef}
              type="text"
              autoComplete="username"
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
                setError(false);
              }}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div>
            <label
              htmlFor="admin-pass"
              className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Contraseña
            </label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">
              Usuario o contraseña incorrectos.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
