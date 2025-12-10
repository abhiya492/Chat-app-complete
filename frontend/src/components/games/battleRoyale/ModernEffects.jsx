import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export function MuzzleFlash({ position, visible, onComplete }) {
  const ref = useRef();
  
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onComplete, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight intensity={10} distance={5} color="#ffaa00" />
    </group>
  );
}

export function HitMarker({ position, damage, onComplete }) {
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(1);

  useFrame((_, delta) => {
    setScale(s => s + delta * 2);
    setOpacity(o => {
      const newO = o - delta * 3;
      if (newO <= 0) onComplete();
      return Math.max(0, newO);
    });
  });

  return (
    <Html position={position} center>
      <div 
        className="text-red-500 font-bold text-xl pointer-events-none"
        style={{ 
          transform: `scale(${scale})`,
          opacity: opacity
        }}
      >
        -{Math.round(damage)}
      </div>
    </Html>
  );
}

export function KillFeed({ kills, position = [0, 0, 0] }) {
  return (
    <Html position={position} center>
      <div className="bg-black/80 rounded-lg p-2 text-white text-sm">
        {kills.slice(-3).map((kill, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className="text-blue-400">{kill.killer}</span>
            <span className="text-red-500">eliminated</span>
            <span className="text-red-400">{kill.victim}</span>
          </div>
        ))}
      </div>
    </Html>
  );
}