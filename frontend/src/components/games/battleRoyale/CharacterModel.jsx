import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

export function CharacterModel({ id, position = [0, 0, 0], color = "#ff69b4", isLocal = false, health = 100, isMoving = false, isShooting = false, onRef, team = "blue" }) {
  const group = useRef();
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  
  // Load character model from available FBX files
  let gltf, actions;
  try {
    // Use the X Bot model as the main character
    gltf = useGLTF('/models/X Bot.fbx');
    const { actions: loadedActions } = useAnimations(gltf.animations, group);
    actions = loadedActions;
  } catch (error) {
    // Fallback to null if model doesn't exist
    gltf = null;
    actions = null;
  }

  useEffect(() => {
    if (onRef) onRef(group);
  }, [onRef]);

  // Animation logic - map to available FBX animations
  useEffect(() => {
    if (isShooting) {
      setCurrentAnimation('standing melee attack horizontal'); // Use melee attack for shooting
      const timer = setTimeout(() => setCurrentAnimation(isMoving ? 'Unarmed Walk Forward' : 'standing idle'), 500);
      return () => clearTimeout(timer);
    } else if (isMoving) {
      setCurrentAnimation('Unarmed Walk Forward');
    } else {
      setCurrentAnimation('standing idle');
    }
  }, [isMoving, isShooting]);

  // Play animations
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Stop all animations
      Object.values(actions).forEach(action => action?.stop());
      
      // Find and play the closest matching animation
      const availableAnimations = Object.keys(actions);
      let animationToPlay = availableAnimations.find(name => 
        name.toLowerCase().includes(currentAnimation.toLowerCase().split(' ')[0])
      ) || availableAnimations[0]; // Fallback to first available
      
      if (actions[animationToPlay]) {
        const action = actions[animationToPlay];
        action.reset().fadeIn(0.2).play();
        
        if (['standing idle', 'Unarmed Walk Forward'].includes(animationToPlay)) {
          action.setLoop(THREE.LoopRepeat);
        } else {
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
        }
      }
    }
  }, [currentAnimation, actions]);

  useFrame((state) => {
    if (!group.current) return;
    
    // Subtle breathing when idle
    if (currentAnimation === 'standing idle') {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
    
    // Bobbing when running
    if (currentAnimation === 'Unarmed Walk Forward') {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.05;
    }
  });

  return (
    <group ref={group} position={position} scale={[1.5, 1.5, 1.5]}>
      {/* 3D Character Model */}
      {gltf ? (
        <primitive 
          object={gltf.scene.clone()} 
          scale={[0.01, 0.01, 0.01]}
          position={[0, -0.8, 0]}
          rotation={[0, team === 'red' ? Math.PI : 0, 0]}
          castShadow 
          receiveShadow
          onUpdate={(self) => {
            self.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Apply team colors to materials
                if (child.material) {
                  const material = child.material.clone();
                  // Apply team color tint
                  const teamColor = team === 'blue' ? new THREE.Color(0.2, 0.4, 1.0) : new THREE.Color(1.0, 0.2, 0.2);
                  material.color.multiply(teamColor);
                  material.emissive.copy(teamColor).multiplyScalar(0.1);
                  child.material = material;
                }
              }
            });
          }}
        />
      ) : (
        // Fallback to enhanced basic model
        <>
          {/* Body */}
          <mesh castShadow receiveShadow>
            <capsuleGeometry args={[0.4, 1.4, 8, 16]} />
            <meshStandardMaterial 
              color={team === 'blue' ? '#1e40af' : '#dc2626'} 
              roughness={0.7} 
              metalness={0.1}
              normalScale={[0.5, 0.5]}
            />
          </mesh>
          
          {/* Head */}
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#ffdbac" roughness={0.8} />
          </mesh>
          
          {/* Helmet */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial 
              color={team === 'blue' ? '#1e40af' : '#dc2626'} 
              roughness={0.2} 
              metalness={0.8}
              emissive={team === 'blue' ? '#1e3a8a' : '#991b1b'}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Weapon */}
          <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
            <boxGeometry args={[0.8, 0.1, 0.1]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              metalness={0.9} 
              roughness={0.1}
              emissive="#333333"
              emissiveIntensity={0.1}
            />
          </mesh>
          
          {/* Weapon Barrel */}
          <mesh position={[0.7, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#0a0a0a" metalness={1} roughness={0.1} />
          </mesh>
          
          {/* Backpack */}
          <mesh position={[-0.2, 0.3, 0]} castShadow>
            <boxGeometry args={[0.3, 0.6, 0.2]} />
            <meshStandardMaterial color="#4a5568" roughness={0.8} />
          </mesh>
          
          {/* Legs */}
          <mesh position={[-0.15, -0.9, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.8, 8, 8]} />
            <meshStandardMaterial color={team === 'blue' ? '#1e3a8a' : '#991b1b'} roughness={0.7} />
          </mesh>
          <mesh position={[0.15, -0.9, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.8, 8, 8]} />
            <meshStandardMaterial color={team === 'blue' ? '#1e3a8a' : '#991b1b'} roughness={0.7} />
          </mesh>
          
          {/* Arms */}
          <mesh position={[-0.35, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
            <capsuleGeometry args={[0.1, 0.6, 8, 8]} />
            <meshStandardMaterial color="#ffdbac" roughness={0.8} />
          </mesh>
          <mesh position={[0.35, 0.4, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
            <capsuleGeometry args={[0.1, 0.6, 8, 8]} />
            <meshStandardMaterial color="#ffdbac" roughness={0.8} />
          </mesh>
        </>
      )}

      {/* Health Bar */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-black/90 backdrop-blur rounded-lg p-2 border border-gray-600 min-w-[140px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-xs font-bold">{id.slice(0, 8)}</span>
            <span className={`text-xs font-bold ${
              team === 'blue' ? 'text-blue-400' : 'text-red-400'
            }`}>{team.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  health > 60 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  health > 30 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="text-white text-xs font-mono">{Math.round(health)}</span>
          </div>
        </div>
      </Html>

      {/* Player Indicator */}
      {isLocal && (
        <>
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial 
              color="#00ff88" 
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight intensity={2} distance={10} color="#00ff88" position={[0, 2.8, 0]} />
          
          {/* Floating indicator ring */}
          <mesh position={[0, 2.8, 0]} rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.2, 0.3, 16]} />
            <meshBasicMaterial 
              color="#00ff88" 
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
      
      {/* Shooting Effect */}
      {isShooting && (
        <>
          <mesh position={[0.8, 0.5, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={0.9}
              blending={THREE.AdditiveBlending}
            />
            <pointLight intensity={8} distance={5} color="#ffaa00" />
          </mesh>
          
          {/* Muzzle flash particles */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 0.3;
            return (
              <mesh 
                key={i}
                position={[
                  0.8 + Math.cos(angle) * radius,
                  0.5 + Math.sin(angle) * radius * 0.5,
                  Math.sin(angle) * radius * 0.5
                ]}
              >
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshBasicMaterial 
                  color={i % 2 === 0 ? '#ff6600' : '#ffaa00'}
                  transparent 
                  opacity={0.7}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
}