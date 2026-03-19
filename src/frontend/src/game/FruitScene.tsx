import { Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useRef, useMemo, useCallback, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "./gameStore";
import type { FruitInstance, FruitType } from "./types";

const GRAVITY = -9.8;

const FRUIT_COLORS: Record<FruitType, { outer: string; inner: string }> = {
  watermelon: { outer: "#2d8c2d", inner: "#e8394a" },
  orange: { outer: "#e8832a", inner: "#ffd580" },
  apple: { outer: "#c0392b", inner: "#f9c74f" },
  banana: { outer: "#f9c74f", inner: "#fff176" },
  pineapple: { outer: "#e6b800", inner: "#fffde7" },
  bomb: { outer: "#1a1a1a", inner: "#ff2020" },
  power: { outer: "#a855f7", inner: "#e879f9" },
};

function getFruitPosition(
  fruit: FruitInstance,
  now: number,
): [number, number, number] {
  const t = Math.max(0, now - fruit.spawnTime);
  const x = fruit.startX + fruit.velX * t;
  const y = fruit.startY + fruit.velY * t + 0.5 * GRAVITY * t * t;
  const z = fruit.startZ + fruit.velZ * t;
  return [x, y, z];
}

interface FruitMeshProps {
  fruit: FruitInstance;
  now: number;
  onSlice: (id: string) => void;
}

const FruitMesh = React.memo(({ fruit, now, onSlice }: FruitMeshProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const half1Ref = useRef<THREE.Mesh>(null);
  const half2Ref = useRef<THREE.Mesh>(null);
  const colors = FRUIT_COLORS[fruit.type];

  useFrame(() => {
    if (!groupRef.current) return;
    const t = Math.max(0, performance.now() / 1000 - fruit.spawnTime);
    const x = fruit.startX + fruit.velX * t;
    const y = fruit.startY + fruit.velY * t + 0.5 * GRAVITY * t * t;
    const z = fruit.startZ + fruit.velZ * t;
    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.y += 0.02;
    groupRef.current.rotation.x += 0.01;

    if (fruit.sliced && fruit.sliceTime) {
      const sliceAge = performance.now() / 1000 - fruit.sliceTime;
      if (half1Ref.current && half2Ref.current) {
        half1Ref.current.position.x = -sliceAge * 1.5;
        half1Ref.current.position.y = sliceAge * 0.5;
        half1Ref.current.rotation.z = sliceAge * 3;
        half2Ref.current.position.x = sliceAge * 1.5;
        half2Ref.current.position.y = sliceAge * 0.5;
        half2Ref.current.rotation.z = -sliceAge * 3;
        groupRef.current.scale.setScalar(Math.max(0, 1 - sliceAge * 2));
      }
    }
  });

  if (fruit.missed) return null;

  const pos = getFruitPosition(fruit, now);
  const isBomb = fruit.type === "bomb";
  const isPower = fruit.type === "power";

  return (
    <group ref={groupRef} position={pos}>
      {!fruit.sliced ? (
        // biome-ignore lint/a11y/useKeyWithClickEvents: 3D canvas mesh, keyboard navigation not applicable
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSlice(fruit.id);
          }}
        >
          {/* Bug 7 fix: increased hit radius from 0.5 to 0.6 for easier targeting */}
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color={colors.outer}
            roughness={isBomb ? 0.9 : 0.3}
            metalness={isBomb ? 0.1 : isPower ? 0.8 : 0.2}
            emissive={isBomb ? "#ff0000" : isPower ? "#a855f7" : colors.outer}
            emissiveIntensity={isBomb ? 0.3 : isPower ? 0.5 : 0.1}
          />
        </mesh>
      ) : (
        <>
          <mesh ref={half1Ref}>
            <sphereGeometry args={[0.5, 8, 8, 0, Math.PI]} />
            <meshStandardMaterial color={colors.inner} roughness={0.4} />
          </mesh>
          <mesh ref={half2Ref}>
            <sphereGeometry args={[0.5, 8, 8, Math.PI, Math.PI]} />
            <meshStandardMaterial color={colors.inner} roughness={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
});

FruitMesh.displayName = "FruitMesh";

function BackgroundSphere() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 32, 32]} />
      <meshBasicMaterial side={THREE.BackSide}>
        <primitive object={new THREE.Color("#0B0614")} attach="color" />
      </meshBasicMaterial>
    </mesh>
  );
}

function GoldParticles() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#D4AF37" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

function RobotBlade() {
  const { fruits, sliceFruit, isPlaying, level } = useGameStore();
  const lastSliceRef = useRef(0);

  useFrame(() => {
    if (!isPlaying) return;
    const now = performance.now() / 1000;
    const reactionTime = level < 100 ? 0.8 : level < 500 ? 0.5 : 0.3;
    const accuracy = level < 100 ? 0.7 : level < 500 ? 0.85 : 0.95;

    if (now - lastSliceRef.current < reactionTime) return;

    // Bug 8 fix: robot should NOT slice bombs
    const target = fruits.find(
      (f) =>
        !f.sliced &&
        !f.missed &&
        f.type !== "bomb" &&
        now - f.spawnTime > reactionTime,
    );
    if (target && Math.random() < accuracy) {
      lastSliceRef.current = now;
      sliceFruit(target.id);
    }
  });

  return null;
}

function SceneInner({ mode }: { mode: string }) {
  const { fruits, sliceFruit, tickFruits } = useGameStore();
  const now = performance.now() / 1000;

  useFrame(() => {
    tickFruits(performance.now() / 1000);
  });

  return (
    <>
      <BackgroundSphere />
      <Stars
        radius={40}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <GoldParticles />

      <ambientLight intensity={0.3} color="#3A1B6E" />
      <pointLight position={[0, 5, 5]} intensity={2} color="#D4AF37" />
      <pointLight position={[-5, -3, 3]} intensity={1} color="#5A2FA0" />
      <pointLight position={[5, -3, 3]} intensity={1} color="#FFB24A" />

      {fruits.map((fruit) => (
        <FruitMesh
          key={fruit.id}
          fruit={fruit}
          now={now}
          onSlice={sliceFruit}
        />
      ))}

      {mode === "robot" && <RobotBlade />}
    </>
  );
}

interface SwipeState {
  active: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

function SwipeOverlay() {
  const { fruits, sliceFruit, isPlaying } = useGameStore();
  const { camera, gl } = useThree();
  const swipeRef = useRef<SwipeState>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });

  const checkIntersection = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const now = performance.now() / 1000;

      for (const fruit of fruits) {
        if (fruit.sliced || fruit.missed) continue;
        const t = Math.max(0, now - fruit.spawnTime);
        const fx = fruit.startX + fruit.velX * t;
        const fy = fruit.startY + fruit.velY * t + 0.5 * GRAVITY * t * t;
        const fz = fruit.startZ + fruit.velZ * t;
        const fruitPos = new THREE.Vector3(fx, fy, fz);
        const dist = ray.ray.distanceToPoint(fruitPos);
        if (dist < 0.6) {
          sliceFruit(fruit.id);
        }
      }
    },
    [fruits, sliceFruit, camera, gl],
  );

  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (!isPlaying) return;
      swipeRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
      };
      // Bug 6 fix: also check intersection on initial tap/click
      checkIntersection(e.clientX, e.clientY);
    };
    const onMove = (e: PointerEvent) => {
      if (!swipeRef.current.active || !isPlaying) return;
      const dx = e.clientX - swipeRef.current.lastX;
      const dy = e.clientY - swipeRef.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      // Bug 6 fix: lowered threshold from 5 to 2 for more responsive slicing
      if (speed > 2) {
        checkIntersection(e.clientX, e.clientY);
      }
      swipeRef.current.lastX = e.clientX;
      swipeRef.current.lastY = e.clientY;
    };
    const onUp = () => {
      swipeRef.current.active = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    // Bug 6 fix: handle pointer cancel (e.g. touch interrupted)
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [checkIntersection, isPlaying, gl]);

  return null;
}

export function FruitScene({ mode }: { mode: string }) {
  return (
    <Canvas
      camera={{ fov: 75, position: [0, 0, 8], near: 0.1, far: 100 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      gl={{ antialias: true, alpha: false }}
    >
      <SceneInner mode={mode} />
      <SwipeOverlay />
    </Canvas>
  );
}
