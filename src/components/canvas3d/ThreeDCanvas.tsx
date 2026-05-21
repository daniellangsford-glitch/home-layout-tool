import { Suspense, useMemo, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Plan, MeasurementUnit } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';
import type { Zone } from '../../types/zone';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';

// ─── Unit helpers ─────────────────────────────────────────────────────────────

function defaultWallHeight(unit: MeasurementUnit): number {
  return unit === 'm' ? 2.4 : unit === 'cm' ? 240 : unit === 'ft' ? 8 : 96;
}

function defaultObjectHeight(unit: MeasurementUnit): number {
  return unit === 'm' ? 0.75 : unit === 'cm' ? 75 : unit === 'ft' ? 2.5 : 30;
}

function resolvePointHeight(plan: Plan, i: number): number {
  const perPoint = plan.boundary.pointHeights?.[i];
  if (perPoint != null) return perPoint;
  return plan.wallHeight ?? defaultWallHeight(plan.unit);
}

function polygonCentroid(pts: { x: number; y: number }[]): [number, number] {
  const n = pts.length;
  return [
    pts.reduce((s, p) => s + p.x, 0) / n,
    pts.reduce((s, p) => s + p.y, 0) / n,
  ];
}

// ─── Floor ────────────────────────────────────────────────────────────────────

function SceneFloor({ plan }: { plan: Plan }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const pts = plan.boundary.points;
    s.moveTo(pts[0].x, -pts[0].y);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, -pts[i].y);
    s.closePath();
    return s;
  }, [plan.boundary.points]);

  const floorColor = plan.floorColor ?? '#f8fafc';

  return (
    <>
      <mesh position={[plan.width / 2, -0.25, plan.height / 2]}>
        <boxGeometry args={[plan.width + 6, 0.5, plan.height + 6]} />
        <meshStandardMaterial color="#d1d5db" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ─── Walls ────────────────────────────────────────────────────────────────────

const WALL_THICKNESS = 0.12;

type WallSegmentProps = {
  x0: number; z0: number; h0: number;
  x1: number; z1: number; h1: number;
  opacity: number;
  color: string;
};

function WallSegment({ x0, z0, h0, x1, z1, h1, opacity, color }: WallSegmentProps) {
  if (h0 < 0.001 && h1 < 0.001) return null;

  const geo = useMemo(() => {
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return null;

    const nx = (-dz / len) * WALL_THICKNESS / 2;
    const nz = (dx / len) * WALL_THICKNESS / 2;

    const verts = new Float32Array([
      x0 + nx, 0,  z0 + nz,
      x1 + nx, 0,  z1 + nz,
      x1 + nx, h1, z1 + nz,
      x0 + nx, h0, z0 + nz,
      x0 - nx, 0,  z0 - nz,
      x1 - nx, 0,  z1 - nz,
      x1 - nx, h1, z1 - nz,
      x0 - nx, h0, z0 - nz,
    ]);

    const indices = [
      0, 1, 2,  0, 2, 3,
      5, 4, 7,  5, 7, 6,
      3, 2, 6,  3, 6, 7,
      4, 5, 1,  4, 1, 0,
      4, 0, 3,  4, 3, 7,
      1, 5, 6,  1, 6, 2,
    ];

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [x0, z0, h0, x1, z1, h1]);

  if (!geo) return null;
  const isTransparent = opacity < 0.99;

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        key={`${isTransparent ? 't' : 'o'}-${color}`}
        color={color}
        roughness={0.7}
        opacity={opacity}
        transparent={isTransparent}
      />
    </mesh>
  );
}

// ─── Wall height drag handles ─────────────────────────────────────────────────

type WallHeightHandleProps = {
  plan: Plan;
  pointIndex: number;
  x: number;
  z: number;
  height: number;
  isSelected: boolean;
  orbitRef: React.RefObject<{ enabled: boolean } | null>;
};

function WallHeightHandle({ plan, pointIndex, x, z, height, isSelected, orbitRef }: WallHeightHandleProps) {
  const setPointHeightNoPush = useProjectStore((s) => s.setPointHeightNoPush);
  const pushUndoSnapshot = useProjectStore((s) => s.pushUndoSnapshot);
  const setSelectedWallPoint = useCanvasStore((s) => s.setSelectedWallPoint);
  const { camera, size } = useThree();

  const handleRadius = Math.max(plan.width, plan.height) * 0.015;

  const onPointerDown = useCallback((e: Parameters<NonNullable<React.ComponentProps<'mesh'>['onPointerDown']>>[0]) => {
    e.stopPropagation();
    setSelectedWallPoint(pointIndex);
    if (orbitRef.current) orbitRef.current.enabled = false;

    // One undo snapshot at the start of the whole drag gesture
    pushUndoSnapshot();

    const cam = camera as THREE.PerspectiveCamera;
    const pos = new THREE.Vector3(x, height, z);
    const dist = cam.position.distanceTo(pos);
    const fovRad = cam.fov * Math.PI / 180;
    const worldPerPx = (2 * Math.tan(fovRad / 2) * dist) / size.height;

    let lastY = e.clientY;
    let currentH = height;

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientY - lastY;
      lastY = ev.clientY;
      currentH = Math.max(0, currentH - delta * worldPerPx);
      // No-push: continuous updates without flooding undo history
      setPointHeightNoPush(plan.id, pointIndex, Math.round(currentH * 100) / 100);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (orbitRef.current) orbitRef.current.enabled = true;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [camera, size, x, z, height, plan.id, pointIndex, orbitRef, setPointHeightNoPush, pushUndoSnapshot, setSelectedWallPoint]);

  return (
    <mesh position={[x, height, z]} onPointerDown={onPointerDown} onClick={(e) => e.stopPropagation()}>
      <sphereGeometry args={[handleRadius, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? '#3b82f6' : '#64748b'}
        roughness={0.3}
        metalness={0.2}
        emissive={isSelected ? '#1d4ed8' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
}

type WallEdgeHandleProps = {
  plan: Plan;
  edgeIndex: number;
  x0: number; z0: number; h0: number;
  x1: number; z1: number; h1: number;
};

function WallEdgeHandle({ plan, edgeIndex, x0, z0, h0, x1, z1, h1 }: WallEdgeHandleProps) {
  const addBoundaryPointWithHeight = useProjectStore((s) => s.addBoundaryPointWithHeight);
  const mx = (x0 + x1) / 2;
  const mz = (z0 + z1) / 2;
  const mh = (h0 + h1) / 2;
  const handleRadius = Math.max(plan.width, plan.height) * 0.009;

  return (
    <mesh
      position={[mx, mh, mz]}
      onClick={(e) => {
        e.stopPropagation();
        addBoundaryPointWithHeight(plan.id, edgeIndex, { x: mx, y: mz }, mh);
      }}
    >
      <sphereGeometry args={[handleRadius, 12, 12]} />
      <meshStandardMaterial color="#94a3b8" opacity={0.75} transparent roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function SceneWalls({ plan, orbitRef }: { plan: Plan; orbitRef: React.RefObject<{ enabled: boolean } | null> }) {
  const wallOpacity = useCanvasStore((s) => s.wallOpacity);
  const wallHeightEditMode = useCanvasStore((s) => s.wallHeightEditMode);
  const selectedWallPointIndex = useCanvasStore((s) => s.selectedWallPointIndex);
  const pts = plan.boundary.points;
  const defaultWallColor = plan.wallColor ?? '#e2e8f0';

  return (
    <>
      {pts.map((pt, i) => {
        const next = pts[(i + 1) % pts.length];
        const h0 = resolvePointHeight(plan, i);
        const h1 = resolvePointHeight(plan, (i + 1) % pts.length);
        const segColor = plan.boundary.wallColors?.[i] ?? defaultWallColor;
        return (
          <WallSegment
            key={i}
            x0={pt.x} z0={pt.y} h0={h0}
            x1={next.x} z1={next.y} h1={h1}
            opacity={wallOpacity}
            color={segColor}
          />
        );
      })}
      {wallHeightEditMode && pts.map((pt, i) => (
        <WallHeightHandle
          key={i}
          plan={plan}
          pointIndex={i}
          x={pt.x}
          z={pt.y}
          height={resolvePointHeight(plan, i)}
          isSelected={selectedWallPointIndex === i}
          orbitRef={orbitRef}
        />
      ))}
      {wallHeightEditMode && pts.map((pt, i) => {
        const next = pts[(i + 1) % pts.length];
        const h0 = resolvePointHeight(plan, i);
        const h1 = resolvePointHeight(plan, (i + 1) % pts.length);
        return (
          <WallEdgeHandle
            key={`edge-${i}`}
            plan={plan}
            edgeIndex={i}
            x0={pt.x} z0={pt.y} h0={h0}
            x1={next.x} z1={next.y} h1={h1}
          />
        );
      })}
    </>
  );
}

// ─── Zones ────────────────────────────────────────────────────────────────────

function SceneZone({ zone }: { zone: Zone }) {
  const setSelectedZone = useCanvasStore((s) => s.setSelectedZone);
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);
  const isSelected = selectedZoneId === zone.id;

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const pts = zone.points;
    s.moveTo(pts[0].x, -pts[0].y);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, -pts[i].y);
    s.closePath();
    return s;
  }, [zone.points]);

  const [cx, cy] = polygonCentroid(zone.points);
  // Enforce strong minimum opacity so zones are clearly visible on the floor
  const effectiveOpacity = Math.max(zone.opacity, 0.75);
  const bounds = zone.points.reduce(
    (b, p) => ({ minX: Math.min(b.minX, p.x), maxX: Math.max(b.maxX, p.x), minY: Math.min(b.minY, p.y), maxY: Math.max(b.maxY, p.y) }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );
  const zoneW = bounds.maxX - bounds.minX;
  const zoneH = bounds.maxY - bounds.minY;
  const zoneDiag = Math.hypot(zoneW, zoneH);
  const labelFontSize = Math.max(0.35, Math.min(1.4, zoneDiag * 0.10));
  // Raised well above the floor to avoid depth-fighting at oblique angles
  const zoneY = isSelected ? 0.08 : 0.07;

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, zoneY, 0]}
        onClick={(e) => { e.stopPropagation(); setSelectedZone(zone.id); }}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={zone.fill}
          opacity={effectiveOpacity}
          transparent
          side={THREE.DoubleSide}
          roughness={0.75}
          depthWrite={false}
        />
      </mesh>
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, zoneY + 0.003, 0]}>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial
            color={zone.stroke || '#334155'}
            opacity={0.3}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      <Text
        position={[cx, zoneY + 0.04, cy]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={labelFontSize}
        maxWidth={zoneW * 0.85}
        overflowWrap="break-word"
        textAlign="center"
        color={zone.stroke || '#334155'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#ffffff"
      >
        {zone.name}
      </Text>
    </>
  );
}

// ─── Objects ──────────────────────────────────────────────────────────────────

function SceneObject({ object, unit }: { object: LayoutObject; unit: MeasurementUnit }) {
  const setSelectedObject = useCanvasStore((s) => s.setSelectedObject);
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const isSelected = selectedObjectIds.includes(object.id);

  if (!object.visible || object.shape === 'text' || object.shape === 'line') return null;

  const cx = object.x + object.width / 2;
  const cz = object.y + object.height / 2;
  const h = object.height3d ?? defaultObjectHeight(unit);
  const elev = object.elevation ?? 0;
  const yBase = elev;
  const color = object.fill || '#94a3b8';
  const isTransparent = object.opacity < 0.99;

  const handleClick = (e: Parameters<NonNullable<React.ComponentProps<'mesh'>['onClick']>>[0]) => {
    e.stopPropagation();
    setSelectedObject(object.id);
  };

  const material = (
    <meshStandardMaterial
      color={isSelected ? new THREE.Color(color).lerp(new THREE.Color('#3b82f6'), 0.3).getStyle() : color}
      opacity={object.opacity}
      transparent={isTransparent}
      roughness={0.55}
      metalness={0.05}
      emissive={isSelected ? '#1d4ed8' : '#000000'}
      emissiveIntensity={isSelected ? 0.12 : 0}
    />
  );

  let mesh: React.ReactNode = null;
  if (object.shape === 'rectangle') {
    mesh = (
      <mesh position={[cx, yBase + h / 2, cz]} onClick={handleClick}>
        <boxGeometry args={[object.width, h, object.height]} />
        {material}
      </mesh>
    );
  } else if (object.shape === 'circle' || object.shape === 'ellipse') {
    const rx = object.width / 2;
    const rz = object.height / 2;
    const isCircle = Math.abs(rx - rz) < 0.01;
    if (isCircle) {
      mesh = (
        <mesh position={[cx, yBase + h / 2, cz]} onClick={handleClick}>
          <cylinderGeometry args={[rx, rx, h, 40]} />
          {material}
        </mesh>
      );
    } else {
      mesh = (
        <mesh position={[cx, yBase + h / 2, cz]} scale={[object.width, 1, object.height]} onClick={handleClick}>
          <cylinderGeometry args={[0.5, 0.5, h, 40]} />
          {material}
        </mesh>
      );
    }
  }

  if (!mesh) return null;

  return (
    <>
      {mesh}
      <Text
        position={[cx, yBase + h + 0.15, cz]}
        fontSize={Math.max(0.3, Math.min(0.7, object.width * 0.25))}
        color={isSelected ? '#1d4ed8' : '#334155'}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {object.name}
      </Text>
    </>
  );
}

// ─── Camera setup ─────────────────────────────────────────────────────────────

function CameraSetup({ cx, cz }: { cx: number; cz: number }) {
  const { camera } = useThree();
  useMemo(() => { camera.lookAt(cx, 0, cz); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(() => {});
  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = { plan: Plan };

export function ThreeDCanvas({ plan }: Props) {
  const cx = plan.width / 2;
  const cz = plan.height / 2;
  const far = Math.max(plan.width, plan.height);
  const setSelectedObject = useCanvasStore((s) => s.setSelectedObject);
  const setSelectedZone = useCanvasStore((s) => s.setSelectedZone);

  const orbitRef = useRef<{ enabled: boolean } | null>(null);

  return (
    <div className="relative w-full h-full bg-slate-100">
      <Canvas
        camera={{
          position: [cx, far * 0.75, cz + far * 1.4],
          fov: 48,
          near: 0.05,
          far: far * 20,
        }}
        onPointerMissed={() => {
          setSelectedObject(null);
          setSelectedZone(null);
        }}
      >
        <color attach="background" args={['#f1f5f9']} />
        <fog attach="fog" args={['#f1f5f9', far * 3, far * 10]} />

        <ambientLight intensity={1.4} />
        <directionalLight position={[cx, far * 4, cz]} intensity={0.3} />
        <hemisphereLight args={[0xdbeafe, 0xd1fae5, 0.4]} />

        <Suspense fallback={null}>
          <SceneFloor plan={plan} />
          <SceneWalls plan={plan} orbitRef={orbitRef} />
          {(plan.zones ?? []).filter((z) => z.visible).map((z) => (
            <SceneZone key={z.id} zone={z} />
          ))}
          {plan.objects.map((obj) => (
            <SceneObject key={obj.id} object={obj} unit={plan.unit} />
          ))}
        </Suspense>

        <OrbitControls
          ref={orbitRef as React.RefObject<any>}
          target={[cx, 0, cz]}
          maxPolarAngle={Math.PI / 2 - 0.03}
          minDistance={far * 0.15}
          maxDistance={far * 6}
          enablePan
          panSpeed={0.8}
          rotateSpeed={0.7}
          zoomSpeed={1.2}
        />

        <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
        </GizmoHelper>

        <CameraSetup cx={cx} cz={cz} />
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/25 backdrop-blur-sm rounded-full text-xs text-white/90 pointer-events-none select-none">
        Left drag: orbit · Right drag: pan · Scroll: zoom
      </div>
    </div>
  );
}
