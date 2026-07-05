"use client";

import { useRef, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * Versión 3D de la visibilidad: una luz-punto ilumina la escena y los **cubos**
 * proyectan sombras reales, así que "no se ve" lo que queda detrás de ellos.
 * La bombita se **arrastra con el mouse**; la cámara se orbita arrastrando el
 * fondo. Usa Three.js.
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

function Scene({
  light,
  setLight,
  dragging,
  setDragging,
  controlsRef,
}: {
  light: [number, number, number];
  setLight: (l: [number, number, number]) => void;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  controlsRef: React.MutableRefObject<{ enabled: boolean } | null>;
}) {
  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
    if (controlsRef.current) controlsRef.current.enabled = false;
  };

  const onDragMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();
    // El punto de intersección con el plano horizontal a la altura de la luz.
    setLight([e.point.x, light[1], e.point.z]);
  };

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight
        position={light}
        intensity={70}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0006}
        shadow-camera-far={40}
      />

      {/* La bombita (con una esfera invisible más grande para agarrarla fácil) */}
      <group position={light}>
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#fde68a" />
        </mesh>
        <mesh onPointerDown={startDrag}>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

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

      {/* Plano invisible a la altura de la luz: solo activo mientras se arrastra,
          captura el mouse para mover la bombita sin puntos muertos. */}
      {dragging && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, light[1], 0]}
          onPointerMove={onDragMove}
        >
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

export function Visibility3D() {
  const [light, setLight] = useState<[number, number, number]>([2.8, 3.5, 3.2]);
  const [dragging, setDragging] = useState(false);
  const controlsRef = useRef<{ enabled: boolean } | null>(null);

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <label className="flex items-center gap-2 text-[11px] text-zinc-500">
        altura de la luz
        <input
          type="range"
          min={12}
          max={70}
          value={Math.round(light[1] * 10)}
          onChange={(e) => setLight([light[0], Number(e.target.value) / 10, light[2]])}
          className="h-1 w-32 accent-amber-500"
        />
      </label>

      <div className="aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg border border-zinc-800">
        <Canvas
          shadows
          frameloop="demand"
          camera={{ position: [7, 6, 7], fov: 45 }}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          style={{ cursor: dragging ? "grabbing" : "default" }}
        >
          <color attach="background" args={["#0b0f1a"]} />
          <Scene
            light={light}
            setLight={setLight}
            dragging={dragging}
            setDragging={setDragging}
            controlsRef={controlsRef}
          />
          <OrbitControls
            ref={controlsRef as never}
            enablePan={false}
            minDistance={5}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>
      </div>

      <p className="max-w-lg text-center text-[11px] text-zinc-400">
        <strong>Arrastrá la bombita</strong> amarilla para mover la luz por la escena
        (y el slider cambia su altura). Arrastrá el <strong>fondo</strong> para orbitar
        la cámara. Mirá cómo cada cubo proyecta una sombra y <strong>tapa lo que hay
        detrás</strong>.
      </p>
    </div>
  );
}
