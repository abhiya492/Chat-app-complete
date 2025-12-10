import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Cylinder, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// City Buildings
export function CityBuildings({ count = 20 }) {
  const buildings = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 200,
        0,
        (Math.random() - 0.5) * 200
      ],
      size: [
        4 + Math.random() * 12,
        8 + Math.random() * 35,
        4 + Math.random() * 12
      ],
      type: ['office', 'residential', 'commercial'][Math.floor(Math.random() * 3)],
      color: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'][Math.floor(Math.random() * 5)],
      glassColor: ['#87ceeb', '#4682b4', '#5f9ea0'][Math.floor(Math.random() * 3)],
      lightColor: ['#ffd700', '#ff6347', '#00ff7f'][Math.floor(Math.random() * 3)]
    }));
  }, [count]);

  return (
    <group>
      {buildings.map(building => (
        <RigidBody key={building.id} type="fixed" colliders="cuboid">
          {/* Main Building */}
          <mesh position={building.position} castShadow receiveShadow>
            <boxGeometry args={building.size} />
            <meshStandardMaterial 
              color={building.color}
              roughness={0.7}
              metalness={0.3}
              normalScale={[2, 2]}
              map={(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = building.color;
                ctx.fillRect(0, 0, 512, 512);
                // Add concrete texture
                for(let i = 0; i < 200; i++) {
                  ctx.fillStyle = `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${100 + Math.random() * 100}, 0.3)`;
                  ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
                }
                return new THREE.CanvasTexture(canvas);
              })()} 
            />
          </mesh>
          
          {/* Detailed Windows Grid */}
          {Array.from({ length: Math.floor(building.size[1] / 2.5) }, (_, floor) => (
            <group key={floor}>
              {Array.from({ length: 4 }, (_, side) => (
                <group key={side}>
                  {Array.from({ length: Math.floor(building.size[0] / 2) }, (_, windowX) => (
                    <mesh
                      key={windowX}
                      position={[
                        building.position[0] + (side < 2 ? (building.size[0]/2 + 0.01) * (side === 0 ? 1 : -1) : (windowX - Math.floor(building.size[0] / 4)) * 2),
                        building.position[1] + floor * 2.5 + 1.5,
                        building.position[2] + (side >= 2 ? (building.size[2]/2 + 0.01) * (side === 2 ? 1 : -1) : (windowX - Math.floor(building.size[2] / 4)) * 2)
                      ]}
                      rotation={[0, side * Math.PI/2, 0]}
                    >
                      <planeGeometry args={[0.8, 1.2]} />
                      <meshStandardMaterial 
                        color={Math.random() > 0.6 ? "#ffff88" : "#001133"}
                        transparent
                        opacity={0.9}
                        metalness={0.8}
                        roughness={0.1}
                        emissive={Math.random() > 0.6 ? "#ffff44" : "#000000"}
                        emissiveIntensity={Math.random() > 0.6 ? 0.3 : 0}
                      />
                    </mesh>
                  ))}
                </group>
              ))}
            </group>
          ))}
          
          {/* Building Details */}
          {building.type === 'office' && (
            <>
              {/* Antenna */}
              <mesh position={[building.position[0], building.position[1] + building.size[1]/2 + 2, building.position[2]]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
                <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Rooftop Equipment */}
              <mesh position={[building.position[0] + 1, building.position[1] + building.size[1]/2 + 0.5, building.position[2] + 1]} castShadow>
                <boxGeometry args={[2, 1, 1.5]} />
                <meshStandardMaterial color="#444" roughness={0.8} />
              </mesh>
            </>
          )}
          
          {building.type === 'residential' && (
            <>
              {/* Balconies */}
              {Array.from({ length: Math.floor(building.size[1] / 4) }, (_, i) => (
                <mesh key={i} position={[building.position[0] + building.size[0]/2 + 0.3, building.position[1] + i * 4 + 2, building.position[2]]} castShadow>
                  <boxGeometry args={[0.6, 0.1, 3]} />
                  <meshStandardMaterial color="#555" roughness={0.7} />
                </mesh>
              ))}
            </>
          )}
        </RigidBody>
      ))}
    </group>
  );
}

// Vehicles
export function Vehicles({ count = 15 }) {
  const vehicles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      type: Math.random() > 0.5 ? (Math.random() > 0.7 ? 'truck' : 'car') : 'bike',
      position: [
        (Math.random() - 0.5) * 180,
        0.5,
        (Math.random() - 0.5) * 180
      ],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'][Math.floor(Math.random() * 8)],
      brand: ['BMW', 'Mercedes', 'Toyota', 'Honda'][Math.floor(Math.random() * 4)]
    }));
  }, [count]);

  return (
    <group>
      {vehicles.map(vehicle => (
        <RigidBody key={vehicle.id} type="dynamic" colliders="hull">
          <group position={vehicle.position} rotation={vehicle.rotation}>
            {vehicle.type === 'car' ? (
              <>
                {/* Car Body - More detailed */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[4.2, 1.4, 2.1]} />
                  <meshStandardMaterial 
                    color={vehicle.color} 
                    metalness={0.9} 
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                  />
                </mesh>
                
                {/* Car Hood */}
                <mesh position={[1.5, 0.2, 0]} castShadow>
                  <boxGeometry args={[1.2, 0.3, 2]} />
                  <meshStandardMaterial color={vehicle.color} metalness={0.9} roughness={0.1} />
                </mesh>
                
                {/* Car Roof */}
                <mesh position={[-0.3, 1.2, 0]} castShadow>
                  <boxGeometry args={[2.2, 0.8, 1.9]} />
                  <meshStandardMaterial color={vehicle.color} metalness={0.8} roughness={0.2} />
                </mesh>
                
                {/* Windshield */}
                <mesh position={[0.8, 1.3, 0]} rotation={[0, 0, -0.2]} castShadow>
                  <planeGeometry args={[1.8, 1.2]} />
                  <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} metalness={0.1} roughness={0.1} />
                </mesh>
                
                {/* Side Windows */}
                <mesh position={[-0.5, 1.3, 1.05]} castShadow>
                  <planeGeometry args={[2, 0.8]} />
                  <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
                </mesh>
                <mesh position={[-0.5, 1.3, -1.05]} castShadow>
                  <planeGeometry args={[2, 0.8]} />
                  <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
                </mesh>
                
                {/* Detailed Wheels */}
                {[[-1.6, -0.4, 1.3], [1.6, -0.4, 1.3], [-1.6, -0.4, -1.3], [1.6, -0.4, -1.3]].map((pos, i) => (
                  <group key={i} position={pos}>
                    <mesh rotation={[Math.PI/2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.45, 0.45, 0.25, 16]} />
                      <meshStandardMaterial color="#111" roughness={0.9} />
                    </mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.3, 0.3, 0.3, 8]} />
                      <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
                    </mesh>
                  </group>
                ))}
                
                {/* Enhanced Headlights */}
                <mesh position={[2.2, 0.3, 0.7]} castShadow>
                  <sphereGeometry args={[0.25, 12, 12]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                  <pointLight intensity={4} distance={15} color="#ffffff" />
                </mesh>
                <mesh position={[2.2, 0.3, -0.7]} castShadow>
                  <sphereGeometry args={[0.25, 12, 12]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
                  <pointLight intensity={4} distance={15} color="#ffffff" />
                </mesh>
                
                {/* Taillights */}
                <mesh position={[-2.2, 0.3, 0.7]} castShadow>
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
                </mesh>
                <mesh position={[-2.2, 0.3, -0.7]} castShadow>
                  <sphereGeometry args={[0.15, 8, 8]} />
                  <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
                </mesh>
                
                {/* Side Mirrors */}
                <mesh position={[0.5, 1.1, 1.2]} castShadow>
                  <boxGeometry args={[0.2, 0.15, 0.1]} />
                  <meshStandardMaterial color="#333" metalness={0.8} />
                </mesh>
                <mesh position={[0.5, 1.1, -1.2]} castShadow>
                  <boxGeometry args={[0.2, 0.15, 0.1]} />
                  <meshStandardMaterial color="#333" metalness={0.8} />
                </mesh>
              </>
            ) : vehicle.type === 'truck' ? (
              <>
                {/* Truck Cab */}
                <mesh position={[1.5, 1, 0]} castShadow>
                  <boxGeometry args={[3, 2.5, 2.2]} />
                  <meshStandardMaterial color={vehicle.color} metalness={0.7} roughness={0.3} />
                </mesh>
                
                {/* Truck Bed */}
                <mesh position={[-2, 0.8, 0]} castShadow>
                  <boxGeometry args={[4, 1.5, 2.2]} />
                  <meshStandardMaterial color="#444" roughness={0.8} />
                </mesh>
                
                {/* Large Wheels */}
                {[[-3, -0.5, 1.4], [-1, -0.5, 1.4], [2, -0.5, 1.4], [-3, -0.5, -1.4], [-1, -0.5, -1.4], [2, -0.5, -1.4]].map((pos, i) => (
                  <mesh key={i} position={pos} rotation={[Math.PI/2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.6, 0.6, 0.4, 12]} />
                    <meshStandardMaterial color="#111" roughness={0.9} />
                  </mesh>
                ))}
              </>
            ) : (
              <>
                {/* Enhanced Motorcycle */}
                <mesh castShadow>
                  <boxGeometry args={[2.2, 0.6, 0.4]} />
                  <meshStandardMaterial color={vehicle.color} metalness={0.8} roughness={0.2} />
                </mesh>
                
                {/* Detailed Bike Wheels */}
                <mesh position={[-0.9, -0.2, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
                  <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
                <mesh position={[0.9, -0.2, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
                  <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
                
                {/* Bike Engine */}
                <mesh position={[0, -0.1, 0]} castShadow>
                  <boxGeometry args={[0.8, 0.6, 0.5]} />
                  <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
                </mesh>
                
                {/* Exhaust Pipe */}
                <mesh position={[-0.5, -0.3, 0.3]} rotation={[0, Math.PI/4, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.08, 1.5, 8]} />
                  <meshStandardMaterial color="#444" metalness={0.9} roughness={0.2} />
                </mesh>
              </>
            )}
          </group>
        </RigidBody>
      ))}
    </group>
  );
}

// Street System
export function Streets() {
  const streets = useMemo(() => [
    // Main roads
    { pos: [0, -0.1, 0], size: [200, 0.1, 8], rotation: [0, 0, 0] },
    { pos: [0, -0.1, 0], size: [8, 0.1, 200], rotation: [0, 0, 0] },
    // Cross streets
    { pos: [50, -0.1, 0], size: [8, 0.1, 100], rotation: [0, 0, 0] },
    { pos: [-50, -0.1, 0], size: [8, 0.1, 100], rotation: [0, 0, 0] },
    { pos: [0, -0.1, 50], size: [100, 0.1, 8], rotation: [0, 0, 0] },
    { pos: [0, -0.1, -50], size: [100, 0.1, 8], rotation: [0, 0, 0] },
  ], []);

  return (
    <group>
      {streets.map((street, i) => (
        <RigidBody key={i} type="fixed">
          <mesh position={street.pos} rotation={street.rotation} receiveShadow>
            <boxGeometry args={street.size} />
            <meshStandardMaterial 
              color="#2c3e50" 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          
          {/* Road markings */}
          <mesh position={[street.pos[0], street.pos[1] + 0.01, street.pos[2]]} rotation={street.rotation}>
            <planeGeometry args={[street.size[0], street.size[2]]} />
            <meshBasicMaterial 
              color="#ffff00" 
              transparent 
              opacity={0.8}
              map={(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(0, 0, 64, 64);
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 8]);
                ctx.beginPath();
                ctx.moveTo(0, 32);
                ctx.lineTo(64, 32);
                ctx.stroke();
                return new THREE.CanvasTexture(canvas);
              })()}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

// Enhanced Trees
export function CityTrees({ count = 50 }) {
  const trees = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 180,
        0,
        (Math.random() - 0.5) * 180
      ],
      scale: 0.9 + Math.random() * 0.8,
      type: ['palm', 'oak', 'pine', 'birch'][Math.floor(Math.random() * 4)],
      age: Math.random()
    }));
  }, [count]);

  return (
    <group>
      {trees.map(tree => (
        <RigidBody key={tree.id} type="fixed" colliders="hull">
          <group position={tree.position} scale={tree.scale}>
            {/* Detailed Trunk with bark texture */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.25 + tree.age * 0.2, 0.35 + tree.age * 0.25, 4 + tree.age * 2, 12]} />
              <meshStandardMaterial 
                color={`hsl(${25 + Math.random() * 15}, 60%, ${20 + Math.random() * 15}%)`}
                roughness={0.95}
                normalScale={[3, 3]}
                map={(() => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 256;
                  canvas.height = 256;
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = '#8B4513';
                  ctx.fillRect(0, 0, 256, 256);
                  // Add bark texture
                  for(let i = 0; i < 100; i++) {
                    ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${30 + Math.random() * 20}, ${10 + Math.random() * 15}, 0.8)`;
                    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 8 + Math.random() * 16);
                  }
                  return new THREE.CanvasTexture(canvas);
                })()} 
              />
            </mesh>
            
            {/* Tree roots */}
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI / 3) * 0.8,
                -0.3,
                Math.sin(i * Math.PI / 3) * 0.8
              ]} rotation={[0, i * Math.PI / 3, Math.PI/8]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 0.8, 6]} />
                <meshStandardMaterial color="#654321" roughness={0.9} />
              </mesh>
            ))}
            
            {tree.type === 'palm' ? (
              <>
                {/* Detailed Palm fronds */}
                {Array.from({ length: 12 }, (_, i) => (
                  <group key={i} position={[0, 4 + tree.age, 0]} rotation={[Math.PI/8 + Math.random() * 0.2, (i / 12) * Math.PI * 2, 0]}>
                    <mesh castShadow>
                      <boxGeometry args={[0.15, 0.05, 4 + Math.random()]} />
                      <meshStandardMaterial color={`hsl(${100 + Math.random() * 20}, 70%, ${30 + Math.random() * 20}%)`} roughness={0.6} />
                    </mesh>
                    {/* Frond segments */}
                    {Array.from({ length: 8 }, (_, j) => (
                      <mesh key={j} position={[0, 0, j * 0.5]} rotation={[0, 0, (j % 2 - 0.5) * 0.3]} castShadow>
                        <boxGeometry args={[0.8, 0.02, 0.4]} />
                        <meshStandardMaterial color={`hsl(${110 + Math.random() * 15}, 65%, ${35 + Math.random() * 15}%)`} />
                      </mesh>
                    ))}
                  </group>
                ))}
              </>
            ) : tree.type === 'oak' ? (
              <>
                {/* Multi-layer oak canopy */}
                <mesh position={[0, 4.5 + tree.age, 0]} castShadow receiveShadow>
                  <sphereGeometry args={[2.5 + tree.age, 16, 12]} />
                  <meshStandardMaterial 
                    color={`hsl(${90 + Math.random() * 30}, 60%, ${25 + Math.random() * 15}%)`} 
                    roughness={0.9}
                  />
                </mesh>
                
                {/* Additional foliage clusters */}
                {Array.from({ length: 6 }, (_, i) => (
                  <mesh key={i} position={[
                    Math.cos(i * Math.PI / 3) * (1.5 + Math.random()),
                    3.8 + tree.age + Math.random() * 1.5,
                    Math.sin(i * Math.PI / 3) * (1.5 + Math.random())
                  ]} castShadow>
                    <sphereGeometry args={[0.8 + Math.random() * 0.8, 12, 8]} />
                    <meshStandardMaterial color={`hsl(${95 + Math.random() * 25}, 65%, ${30 + Math.random() * 15}%)`} />
                  </mesh>
                ))}
                
                {/* Branches */}
                {Array.from({ length: 8 }, (_, i) => (
                  <mesh key={i} position={[
                    Math.cos(i * Math.PI / 4) * 0.5,
                    2 + i * 0.3,
                    Math.sin(i * Math.PI / 4) * 0.5
                  ]} rotation={[0, i * Math.PI / 4, Math.PI/6]} castShadow>
                    <cylinderGeometry args={[0.05, 0.1, 1.5, 6]} />
                    <meshStandardMaterial color="#654321" roughness={0.8} />
                  </mesh>
                ))}
              </>
            ) : tree.type === 'pine' ? (
              <>
                {/* Pine cone shape */}
                {Array.from({ length: 8 }, (_, layer) => (
                  <mesh key={layer} position={[0, 2 + layer * 0.6, 0]} castShadow>
                    <coneGeometry args={[2.5 - layer * 0.25, 1.5, 8]} />
                    <meshStandardMaterial color={`hsl(${120 + Math.random() * 15}, 50%, ${20 + Math.random() * 10}%)`} />
                  </mesh>
                ))}
              </>
            ) : (
              <>
                {/* Birch - tall and slender */}
                <mesh position={[0, 4, 0]} castShadow>
                  <sphereGeometry args={[1.8, 12, 8]} />
                  <meshStandardMaterial color={`hsl(${80 + Math.random() * 20}, 70%, ${40 + Math.random() * 15}%)`} />
                </mesh>
                
                {/* Birch bark pattern */}
                {Array.from({ length: 6 }, (_, i) => (
                  <mesh key={i} position={[0, i * 0.8, 0]} castShadow>
                    <cylinderGeometry args={[0.28, 0.32, 0.3, 8]} />
                    <meshStandardMaterial color="#f5f5dc" roughness={0.7} />
                  </mesh>
                ))}
              </>
            )}
          </group>
        </RigidBody>
      ))}
    </group>
  );
}

// Street Props
export function StreetProps({ count = 30 }) {
  const props = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      type: ['lamppost', 'bench', 'trash', 'hydrant'][Math.floor(Math.random() * 4)],
      position: [
        (Math.random() - 0.5) * 190,
        0,
        (Math.random() - 0.5) * 190
      ],
      rotation: [0, Math.random() * Math.PI * 2, 0]
    }));
  }, [count]);

  return (
    <group>
      {props.map(prop => (
        <RigidBody key={prop.id} type="fixed" colliders="hull">
          <group position={prop.position} rotation={prop.rotation}>
            {prop.type === 'lamppost' && (
              <>
                <mesh castShadow>
                  <cylinderGeometry args={[0.1, 0.1, 6, 8]} />
                  <meshStandardMaterial color="#444" metalness={0.8} />
                </mesh>
                <mesh position={[0, 5.5, 0]} castShadow>
                  <sphereGeometry args={[0.3, 8, 8]} />
                  <meshStandardMaterial 
                    color="#f39c12" 
                    emissive="#f39c12" 
                    emissiveIntensity={0.8}
                  />
                  <pointLight intensity={5} distance={20} color="#f39c12" />
                </mesh>
              </>
            )}
            
            {prop.type === 'bench' && (
              <>
                <mesh position={[0, 0.4, 0]} castShadow>
                  <boxGeometry args={[2, 0.1, 0.5]} />
                  <meshStandardMaterial color="#8B4513" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.8, 0.2]} castShadow>
                  <boxGeometry args={[2, 0.6, 0.1]} />
                  <meshStandardMaterial color="#8B4513" roughness={0.8} />
                </mesh>
              </>
            )}
            
            {prop.type === 'trash' && (
              <mesh castShadow>
                <cylinderGeometry args={[0.3, 0.25, 1, 8]} />
                <meshStandardMaterial color="#666" metalness={0.3} roughness={0.7} />
              </mesh>
            )}
            
            {prop.type === 'hydrant' && (
              <>
                <mesh castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                  <meshStandardMaterial color="#ff0000" metalness={0.6} roughness={0.4} />
                </mesh>
                <mesh position={[0.25, 0.7, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
                  <meshStandardMaterial color="#333" metalness={0.8} />
                </mesh>
              </>
            )}
          </group>
        </RigidBody>
      ))}
    </group>
  );
}