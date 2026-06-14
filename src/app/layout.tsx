import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { VisibilityProvider } from "@/components/VisibilityProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curso de Algoritmos",
  description:
    "Visualizaciones animadas de estructuras de datos y algoritmos con código sincronizado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <VisibilityProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </VisibilityProvider>
      </body>
    </html>
  );
}
