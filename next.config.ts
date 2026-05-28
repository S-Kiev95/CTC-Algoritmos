import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: genera HTML/JS planos en `out/`. Funciona porque toda la
  // app es client-side (animaciones + lógica en el browser, sin server actions
  // ni route handlers). Listo para Netlify, GitHub Pages o cualquier estático.
  output: "export",
  // Asegura un URL por carpeta (`/temas/pilas/index.html`) — más amigable
  // para hosts estáticos que sirven directorios.
  trailingSlash: true,
  images: {
    // El optimizador de imágenes necesita un server. En export usamos las
    // imágenes tal cual están — esto evita errores si más adelante usás <Image>.
    unoptimized: true,
  },
};

export default nextConfig;
