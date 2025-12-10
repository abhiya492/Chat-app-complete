import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

export function LoadingScreen() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="p-6 bg-black/80 rounded-lg text-white text-center">
        <div className="text-2xl font-bold mb-2">Loading Game...</div>
        <div className="text-sm mb-3">Assets: {Math.round(progress)}%</div>
        <div className="w-64 h-2 bg-gray-700 rounded overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Html>
  );
}

export function InstancedTrees({ count = 200, radius = 80 }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const scale = 0.6 + Math.random() * 1.2;
      const y = 0;
      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, radius, dummy]);
  return (
    <instancedMesh ref={ref} args={[null, null, count]} castShadow receiveShadow>
      <cylinderGeometry args={[0.2, 0.4, 4, 8]} />
      <meshStandardMaterial color="#6b8e23" />
    </instancedMesh>
  );
}

export function WeaponPickup({ weapon, position, onPickup }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.6;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref} castShadow onClick={onPickup}>
        <boxGeometry args={[0.9, 0.2, 0.4]} />
        <meshStandardMaterial color={weapon.color} metalness={0.7} roughness={0.2} emissive={weapon.color} emissiveIntensity={0.2} />
      </mesh>
      <Html position={[0, 0.8, 0]} center>
        <div className="px-2 py-1 rounded-md text-white font-bold text-xs bg-black/70">
          {weapon.name}
        </div>
      </Html>
      <pointLight intensity={1.5} distance={6} color={weapon.color} position={[0, 0.6, 0]} />
    </group>
  );
}

export function BulletTracer({ start, end, onComplete }) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const len = new THREE.Vector3().subVectors(endVec, startVec).length();
  
  useEffect(() => {
    const timer = setTimeout(onComplete, 120);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <mesh position={startVec.clone().add(endVec).multiplyScalar(0.5)}>
      <cylinderGeometry args={[0.02, 0.02, len, 6]} />
      <meshBasicMaterial color="#ffd54f" />
      <pointLight intensity={1.5} distance={6} color="#ffd54f" />
    </mesh>
  );
}

export function Explosion({ position, onComplete }) {
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);
  useFrame((state, delta) => {
    setScale((s) => s + delta * 6);
    setOpacity((o) => {
      const n = o - delta * 2.5;
      if (n <= 0) {
        onComplete();
        return 0;
      }
      return n;
    });
  });
  return (
    <group position={position}>
      <mesh scale={[scale, scale, scale]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ff6b35" transparent opacity={opacity} />
      </mesh>
      <pointLight intensity={8} distance={10} color="#ff6b35" />
    </group>
  );
}