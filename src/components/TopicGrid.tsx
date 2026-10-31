"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOPICS } from "@/lib/topics";

/** Grilla de temas de la página de inicio. */
export function TopicGrid() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TOPICS.map((topic) => {
        const Icon = topic.icon;
        return (
          <li key={topic.slug}>
            <Link
              href={`/temas/${topic.slug}`}
              className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {topic.title}
              </h3>
              <p className="mt-0.5 text-sm text-zinc-500">{topic.short}</p>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {topic.description}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
