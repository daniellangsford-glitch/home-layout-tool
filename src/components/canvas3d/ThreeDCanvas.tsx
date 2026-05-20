import { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { Plan, MeasurementUnit } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';
import type { Zone } from '../../types/zone';

// ─── Unit helpers ────────────────────────────────────────────────────────────

function wallHeight(unit: MeasurementUnit): number {
  return unit === 'm' ? 2.4 : unit === 'cm' ? 240 : unit === 'ft' ? 8 : 96;
}

function defaultObjectHeight(unit: MeasurementUnit): number {
  return unit === 'm' ? 0.75 : unit === 'cm' ? 75 : unit === 'ft' ? 2.5 : 30;
}

// ─── Floor ───────────────────────────────────────────────────────────────────

function SceneFloor({ plan }: { plan: Plan }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const pts = plan.boundary.points;
    s.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
    s.closePath();
    return s;
  }, [plan.boundary.points]);

  return (
    <>
      {/* Ground base extends slightly beyond plan for a grounded look */}
      <mesh position={[plan.width / 2, -0.04, plan.height / 2]} receiveShadow>
        <boxGeometry args={[plan.width + 6, 0.08, plan.height + 6]} />
        <meshStandardMaterial color="#d1d5db" roughness={1} />
      </mesh>
      {/* Usable floor area from boundary polygon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ─── Walls ───────────────────────────────────────────────────────────────────

function SceneWalls({ plan }: { plan: Plan }) {
  const wh = wallHeight(plan.unit);
  const pts = plan.boundary.points;

  return (
    <>
      {pts.map((pt, i) => {
        const next = pts[(i + 1) % pts.length];
        const dx = next.x - pt.x;
        const dz = next.y - pt.y;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length < 0.001) return null;
        const angle = Math.atan2(dz, dx);
        const cx = (pt.x + next.x) / 2;
        const cz = (pt.y + next.y) / 2;

        return (
          <mesh
            key={i}
            position={[cx, wh / 2, cz]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[length, wh, 0.12]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Zones ───────────────────────────────────────────────────────────────────

function SceneZone({ zone }: { zone: Zone }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const pts = zone.points;
    s.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
    s.closePath();
    return s;
  }, [zone.points]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={zone.fill}
        opacity={Math.min(zone.opacity + 0.2, 0.85)}
        transparent
        side={THREE.DoubleSide}
        roughness={0.9}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Objects ─────────────────────────────────────────────────────────────────

function SceneObject({ object, unit }: { object: LayoutObject; unit: MeasurementUnit }) {
  if (!object.visible || object.shape === 'text' || object.shape === 'line') return null;

  const cx = object.x + object.width / 2;
  const cz = object.y + object.height / 2;
  const h = object.height3d ?? defaultObjectHeight(unit);
  const color = object.fill || '#94a3b8';
  const isTransparent = object.opacity < 0.99;

  const material = (
    <meshStandardMaterial
      color={color}
      opacity={object.opacity}
      transparent={isTransparent}
      roughness={0.55}
      metalness={0.05}
    />
  );

  if (object.shape === 'rectangle') {
    return (
      <mesh position={[cx, h / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[object.width, h, object.height]} />
        {material}
      </mesh>
    );
  }

  if (object.shape === 'circle' || object.shape === 'ellipse') {
    const rx = object.width / 2;
    const rz = object.height / 2;
    const isCircle = Math.abs(rx - rz) < 0.01;

    if (isCircle) {
      return (
        <mesh position={[cx, h / 2, cz]} castShadow receiveShadow>
          <cylinderGeometry args={[rx, rx, h, 40]} />
          {material}
        </mesh>
      );
    }
    // Ellipse: scale a unit cylinder
    return (
      <mesh position={[cx, h / 2, cz]} scale={[object.width, 1, object.height]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, h, 40]} />
        {material}
      </mesh>
    );
  }

  return null;
}

// ─── Camera setup helper ─────────────────────────────────────────────────────

function CameraSetup({ cx, cz }: { cx: number; cz: number; far?: number }) {
  const { camera } = useThree();
  // One-time setup to ensure camera looks at plan center
  useMemo(() => {
    camera.lookAt(cx, 0, cz);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(() => {}); // keep renderer active
  return null;
}

// ─── Main export ─────────────────────────────────────────────────────────────

type Props = { plan: Plan };

export function ThreeDCanvas({ plan }: Props) {
  const cx = plan.width / 2;
  const cz = plan.height / 2;
  const far = Math.max(plan.width, plan.height);

  return (
    <div className="relative w-full h-full bg-slate-100">
      <Canvas
        shadows
        camera={{
          position: [cx, far * 0.75, cz + far * 1.4],
          fov: 48,
          near: 0.05,
          far: far * 20,
        }}
      >
        <color attach="background" args={['#f1f5f9']} />
        <fog attach="fog" args={['#f1f5f9', far * 3, far * 10]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[cx + far, far * 1.8, cz - far * 0.8]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={far * 6}
          shadow-camera-left={-far * 2}
          shadow-camera-right={far * 2}
          shadow-camera-top={far * 2}
          shadow-camera-bottom={-far * 2}
        />
        <directionalLight
          position={[cx - far * 0.5, far * 0.8, cz + far]}
          intensity={0.35}
        />
        <hemisphereLight args={[0xdbeafe, 0xd1fae5, 0.4]} />

        <Suspense fallback={null}>
          {/* Environment for realistic reflections */}
          <Environment preset="apartment" />

          {/* Scene geometry */}
          <SceneFloor plan={plan} />
          <SceneWalls plan={plan} />
          {(plan.zones ?? []).filter((z) => z.visible).map((z) => (
            <SceneZone key={z.id} zone={z} />
          ))}
          {plan.objects.map((obj) => (
            <SceneObject key={obj.id} object={obj} unit={plan.unit} />
          ))}
        </Suspense>

        {/* Controls */}
        <OrbitControls
          target={[cx, 0, cz]}
          maxPolarAngle={Math.PI / 2 - 0.03}
          minDistance={far * 0.15}
          maxDistance={far * 6}
          enablePan
          panSpeed={0.8}
          rotateSpeed={0.7}
          zoomSpeed={1.2}
        />

        {/* Orientation cube */}
        <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
        </GizmoHelper>

        <CameraSetup cx={cx} cz={cz} far={far} />
      </Canvas>

      {/* Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/25 backdrop-blur-sm rounded-full text-xs text-white/90 pointer-events-none select-none">
        Left drag: orbit · Right drag: pan · Scroll: zoom
      </div>

      {/* View-only badge */}
      <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-700 text-xs rounded font-medium pointer-events-none select-none">
        3D View — switch to 2D to edit
      </div>
    </div>
  );
}
