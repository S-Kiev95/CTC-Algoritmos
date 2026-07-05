"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * Versión 3D de la visibilidad: una luz-punto ilumina la escena y los **cubos**
 * proyectan sombras reales, así que "no se ve" lo que queda detrás de ellos.
 * Cámara orbitable; la luz se mueve con los sliders. Usa Three.js.
 */

type Cube = { pos: [number, number, number]; color: string };

const CUBES: Cube[] = [
  { pos: [-2.5, 0.5, -1.5], color: "#f59e0b" },
  { pos: [1.5, 0.5, -2.5], color: "#38bdf8" },
  { pos: [2.5, 0.5, 1.5], color: "#34d399" },
  { pos: [-1.5, 0.5, 2.5], color: "#f472b6" },
  { pos: [0, 1, 0.5], color: "#a78bfa" }, // uno más alto
  { pos: [-3, 0.5, 1], color: "#fb923c" },
];

function Scene({ ang, height }: { ang: number; height: number }) {
  const R = 4.2;
  const lx = Math.cos(ang) * R;
  const lz = Math.sin(ang) * R;

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight
        position={[lx, height, lz]}
        intensity={70}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0006}
        shadow-camera-far={40}
      />
      {/* La "bombita" que marca dónde está la luz */}
      <mesh position={[lx, height, lz]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      {/* Piso que recibe sombras */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Cubos que proyectan y reciben sombra */}
      {CUBES.map((c, i) => {
        const h = c.pos[1] * 2;
        return (
          <mesh key={i} position={c.pos} castShadow receiveShadow>
            <boxGeometry args={[1, h, 1]} />
            <meshStandardMaterial color={c.color} roughness={0.6} />
          </mesh>
        );
      })}
    </>
  );
}

export function Visibility3D() {
  const [ang, setAng] = useState(0.9);
  const [height, setHeight] = useState(3.5);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500">
        <label className="flex items-center gap-2">
          giro de la luz
          <input type="range" min={0} max={628} value={Math.round(ang * 100)} onChange={(e) => setAng(Number(e.target.value) / 100)} className="h-1 w-28 accent-amber-500" />
        </label>
        <label className="flex items-center gap-2">
          altura
          <input type="range" min={15} max={70} value={Math.round(height * 10)} onChange={(e) => setHeight(Number(e.target.value) / 10)} className="h-1 w-24 accent-amber-500" />
        </label>
      </div>

      <div className="aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg border border-zinc-800">
        <Canvas shadows frameloop="demand" camera={{ position: [7, 6, 7], fov: 45 }}>
          <color attach="background" args={["#0b0f1a"]} />
          <Scene ang={ang} height={height} />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={22} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </div>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        <strong>Arrastrá</strong> para orbitar la cámara. Movés la <strong>luz</strong> con los sliders: mirá cómo cada cubo proyecta una sombra y <strong>tapa lo que hay detrás</strong> — es la visibilidad 2D, ahora en 3D.
      </p>
    </div>
  );
}
