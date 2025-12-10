import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import toast, { Toaster } from "react-hot-toast";

import { useKeyboard } from "./battleRoyale/hooks";
import { LoadingScreen, InstancedTrees, WeaponPickup, BulletTracer, Explosion } from "./battleRoyale/GameObjects";
import { CityBuildings, Vehicles, Streets, CityTrees, StreetProps } from "./battleRoyale/CityEnvironment";
import { CharacterModel } from "./battleRoyale/CharacterModel";
import { GameLogic } from "./battleRoyale/GameLogic";
import { GameUI } from "./battleRoyale/UI";
import { MuzzleFlash, HitMarker, KillFeed } from "./battleRoyale/ModernEffects";
import { WEAPONS, WeaponWheel } from "./battleRoyale/WeaponSystem";
import { useAuthStore } from "../../store/useAuthStore";
import { useAssetLoader, GameLoadingScreen, OptimizedMaterial } from "./battleRoyale/AssetLoader";

export default function FreeFireBattleRoyale({ 
  authUser = { _id: "player1", name: "You" }, 
  opponent = { _id: "player2", name: "Enemy" }, 
  onGameEnd = () => {} 
}) {
  const { socket } = useAuthStore();
  const keys = useKeyboard();
  const { assetsLoaded, loadingProgress } = useAssetLoader();
  const [phase, setPhase] = useState("playing");
  const [winner, setWinner] = useState(null);

  const localRef = useRef();
  const enemyRef = useRef();
  const cameraRef = useRef();

  const [players, setPlayers] = useState({
    [authUser._id]: {
      id: authUser._id,
      name: authUser.name,
      position: new THREE.Vector3(-8, 0, 0),
      health: 100,
      isMoving: false,
      isShooting: false,
      color: "#42a5f5",
      weapon: WEAPONS[0],
      inventory: { ak47: 30, m4a1: 30, awm: 5, shotgun: 8 }
    },
    [opponent._id]: {
      id: opponent._id,
      name: opponent.name,
      position: new THREE.Vector3(8, 0, 0),
      health: 100,
      isMoving: false,
      isShooting: false,
      color: "#f06292",
      weapon: WEAPONS[1],
      inventory: { ak47: 30, m4a1: 30, awm: 5, shotgun: 8 }
    }
  });

  const [pickups, setPickups] = useState(() => [
    { id: "p1", weapon: WEAPONS[2], position: [Math.random() * 30 - 15, 0.6, Math.random() * 30 - 15] },
    { id: "p2", weapon: WEAPONS[3], position: [Math.random() * 30 - 15, 0.6, Math.random() * 30 - 15] },
  ]);

  const bulletsRef = useRef([]);
  const explosionsRef = useRef([]);
  const [tick, setTick] = useState(0);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [muzzleFlashes, setMuzzleFlashes] = useState([]);
  const [hitMarkers, setHitMarkers] = useState([]);
  const [killFeed, setKillFeed] = useState([]);

  const shootAudio = useMemo(() => {
    const a = typeof Audio !== "undefined" ? new Audio("/sounds/shoot.mp3") : null;
    if (a) { a.volume = 0.4; }
    return a;
  }, []);
  
  const hitAudio = useMemo(() => {
    const a = typeof Audio !== "undefined" ? new Audio("/sounds/hit.mp3") : null;
    if (a) { a.volume = 0.3; }
    return a;
  }, []);

  const shoot = (shooterId = authUser._id) => {
    const shooter = players[shooterId];
    if (!shooter) return;
    const weapon = WEAPONS[selectedWeapon];
    if (!weapon) return;
    if (shooter.inventory[weapon.id] <= 0) {
      toast.error("Out of ammo!");
      return;
    }
    
    shootAudio?.currentTime && (shootAudio.currentTime = 0);
    shootAudio?.play();

    setPlayers((prev) => ({
      ...prev,
      [shooterId]: {
        ...prev[shooterId],
        weapon: weapon,
        inventory: {
          ...prev[shooterId].inventory,
          [weapon.id]: prev[shooterId].inventory[weapon.id] - 1
        },
        isShooting: true
      }
    }));

    // Add muzzle flash
    setMuzzleFlashes(prev => [...prev, {
      id: Date.now(),
      position: players[shooterId].position.clone().add(new THREE.Vector3(0, 1.5, 0))
    }]);

    let origin = new THREE.Vector3();
    let dir = new THREE.Vector3(0, 0, -1);
    if (cameraRef.current) {
      origin.copy(cameraRef.current.position);
      dir.set(0, 0, -1).applyQuaternion(cameraRef.current.quaternion).normalize();
    } else {
      origin = players[shooterId].position.clone().add(new THREE.Vector3(0, 1.4, 0));
      dir = new THREE.Vector3().subVectors(players[opponent._id].position, origin).normalize();
    }

    const range = weapon.range;
    const enemy = players[opponent._id];
    let hit = false;
    let hitPoint = origin.clone().add(dir.clone().multiplyScalar(range));
    if (enemy) {
      const toEnemy = new THREE.Vector3().subVectors(enemy.position, origin);
      const proj = toEnemy.clone().projectOnVector(dir);
      const closest = origin.clone().add(proj);
      const distToLine = closest.distanceTo(enemy.position);
      if (distToLine < 1.2 && proj.length() <= range) {
        hit = true;
        hitPoint = closest;
      }
    }

    const bullet = {
      id: Date.now() + Math.random(),
      shooterId,
      targetId: hit ? opponent._id : null,
      start: [origin.x, origin.y, origin.z],
      end: [hitPoint.x, hitPoint.y, hitPoint.z],
      damage: weapon.damage * (Math.random() < 0.18 ? 1.5 : 1),
      speed: 5,
      travel: 0,
      currentPos: new THREE.Vector3(origin.x, origin.y, origin.z)
    };
    bulletsRef.current.push(bullet);
    setTick(t => t + 1);

    if (socket) {
      socket.emit("battleRoyale:shoot", {
        playerId: shooterId,
        bulletId: bullet.id,
        targetId: bullet.targetId,
        start: bullet.start,
        end: bullet.end,
        damage: bullet.damage
      });
    }

    if (cameraRef.current) {
      const kick = new THREE.Vector3((Math.random() - 0.5) * 0.05, 0.05, 0);
      cameraRef.current.position.add(kick);
    }

    setTimeout(() => {
      setPlayers(prev => ({ ...prev, [shooterId]: { ...prev[shooterId], isShooting: false } }));
    }, 120);
  };

  const reload = (playerId = authUser._id) => {
    const p = players[playerId];
    const weapon = WEAPONS[selectedWeapon];
    if (!p || !weapon) return;
    
    toast.promise(
      new Promise((res) => setTimeout(res, 900)),
      {
        loading: `Reloading ${weapon.name}...`,
        success: "Reloaded!",
        error: "Failed to reload"
      }
    );
    
    setTimeout(() => {
      setPlayers(prev => ({ 
        ...prev, 
        [playerId]: { 
          ...prev[playerId], 
          inventory: {
            ...prev[playerId].inventory,
            [weapon.id]: weapon.maxAmmo
          }
        } 
      }));
    }, 900);
  };

  const pickupWeapon = (pickupId) => {
    const pickup = pickups.find(p => p.id === pickupId);
    if (!pickup) return;
    const newWeapon = pickup.weapon;
    setPlayers(prev => ({ ...prev, [authUser._id]: { ...prev[authUser._id], weapon: newWeapon } }));
    setPickups(prev => prev.filter(p => p.id !== pickupId));
    toast.success(`Picked up ${newWeapon.name}`);
  };

  const onRestart = () => {
    setPlayers({
      [authUser._id]: { ...players[authUser._id], health: 100, position: new THREE.Vector3(-8, 0, 0) },
      [opponent._id]: { ...players[opponent._id], health: 100, position: new THREE.Vector3(8, 0, 0) }
    });
    bulletsRef.current = [];
    explosionsRef.current = [];
    setPhase("playing");
    setWinner(null);
  };

  useEffect(() => {
    if (!socket) return;
    
    socket.on("battleRoyale:playerMove", (data) => {
      setPlayers(prev => ({
        ...prev,
        [data.playerId]: {
          ...prev[data.playerId],
          position: new THREE.Vector3(data.position.x, data.position.y, data.position.z),
          isMoving: data.isMoving
        }
      }));
    });

    socket.on("battleRoyale:playerShoot", (data) => {
      if (data.playerId !== authUser._id) {
        const bullet = {
          id: data.bulletId,
          shooterId: data.playerId,
          targetId: data.targetId,
          start: data.start,
          end: data.end,
          damage: data.damage,
          speed: 5,
          travel: 0,
          currentPos: new THREE.Vector3(...data.start)
        };
        bulletsRef.current.push(bullet);
        setTick(t => t + 1);
      }
    });

    socket.on("battleRoyale:playerHit", (data) => {
      setPlayers(prev => ({
        ...prev,
        [data.playerId]: {
          ...prev[data.playerId],
          health: data.health
        }
      }));
    });

    return () => {
      socket.off("battleRoyale:playerMove");
      socket.off("battleRoyale:playerShoot");
      socket.off("battleRoyale:playerHit");
    };
  }, [socket, authUser._id]);

  useEffect(() => {
    const onClick = () => shoot(authUser._id);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [players]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " || e.key === "Enter") {
        shoot(authUser._id);
      }
      if (e.key.toLowerCase() === "r") reload(authUser._id);
      
      // Weapon selection
      const weaponKeys = ['1', '2', '3', '4'];
      if (weaponKeys.includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index < WEAPONS.length) {
          setSelectedWeapon(index);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [players]);

  const removeExplosion = (id) => {
    explosionsRef.current = explosionsRef.current.filter(x => x.id !== id);
    setTick(t => t + 1);
  };

  const removeBullet = (id) => {
    bulletsRef.current = bulletsRef.current.filter(x => x.id !== id);
    setTick(t => t + 1);
  };

  // Show loading screen while assets load
  if (!assetsLoaded) {
    return <GameLoadingScreen progress={loadingProgress} />;
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <Toaster position="top-right" />
      
      <GameUI 
        players={players}
        authUser={authUser}
        pickups={pickups}
        pickupWeapon={pickupWeapon}
        phase={phase}
        winner={winner}
        onRestart={onRestart}
      />

      <WeaponWheel
        selectedWeapon={selectedWeapon}
        onWeaponSelect={setSelectedWeapon}
        playerInventory={players[authUser._id]?.inventory}
      />

      <Canvas
        shadows="soft"
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
          powerPreference: "high-performance",
          alpha: false,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        camera={{ position: [0, 8, 20], fov: 65 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<LoadingScreen />}>
          {/* GTA 5 Realistic Lighting System */}
          <ambientLight intensity={0.3} color="#87ceeb" />
          
          {/* Main Sun Light */}
          <directionalLight 
            castShadow 
            position={[100, 80, 50]} 
            intensity={2.5} 
            shadow-mapSize={[8192, 8192]}
            shadow-camera-left={-150}
            shadow-camera-right={150}
            shadow-camera-top={150}
            shadow-camera-bottom={-150}
            shadow-camera-near={0.1}
            shadow-camera-far={300}
            shadow-bias={-0.0001}
            color="#fff8dc"
          />
          
          {/* Secondary Fill Lights */}
          <directionalLight 
            position={[-50, 40, -30]} 
            intensity={0.8} 
            color="#87ceeb"
          />
          
          {/* City ambient lighting */}
          <hemisphereLight skyColor="#87ceeb" groundColor="#34495e" intensity={0.8} />
          
          {/* Street Lighting */}
          <pointLight position={[20, 15, 20]} intensity={2} distance={50} color="#f39c12" />
          <pointLight position={[-20, 15, -20]} intensity={2} distance={50} color="#f39c12" />
          <pointLight position={[0, 25, 0]} intensity={3} distance={80} color="#ffffff" />
          
          {/* Atmospheric Effects */}
          <fog attach="fog" args={['#95a5a6', 80, 400]} />
          
          <GameLogic 
            authUser={authUser}
            opponent={opponent}
            onGameEnd={onGameEnd}
            players={players}
            setPlayers={setPlayers}
            pickups={pickups}
            setPickups={setPickups}
            bulletsRef={bulletsRef}
            explosionsRef={explosionsRef}
            setTick={setTick}
            shootAudio={shootAudio}
            hitAudio={hitAudio}
            localRef={localRef}
            enemyRef={enemyRef}
            cameraRef={cameraRef}
            keys={keys}
            phase={phase}
            setPhase={setPhase}
            setWinner={setWinner}
          />
          <Physics gravity={[0, -9.81, 0]}>
            {/* GTA 5 Los Santos Sky */}
            <Sky 
              distance={450000}
              sunPosition={[100, 20, 50]} 
              turbidity={10}
              rayleigh={2}
              mieCoefficient={0.1}
              mieDirectionalG={0.8}
              inclination={0.49}
              azimuth={0.25}
            />

            {/* Realistic GTA 5 Ground */}
            <RigidBody type="fixed">
              <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[400, 400]} />
                <meshStandardMaterial 
                  color="#3e5c3e" 
                  roughness={0.95}
                  metalness={0.02}
                  normalScale={[0.5, 0.5]}
                  map={(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 1024;
                    canvas.height = 1024;
                    const ctx = canvas.getContext('2d');
                    
                    // Base grass color
                    ctx.fillStyle = '#4a6741';
                    ctx.fillRect(0, 0, 1024, 1024);
                    
                    // Add realistic grass patches
                    for(let i = 0; i < 3000; i++) {
                      const x = Math.random() * 1024;
                      const y = Math.random() * 1024;
                      const size = Math.random() * 3 + 1;
                      ctx.fillStyle = `hsl(${85 + Math.random() * 30}, ${50 + Math.random() * 30}%, ${25 + Math.random() * 25}%)`;
                      ctx.fillRect(x, y, size, size);
                    }
                    
                    // Add dirt patches
                    for(let i = 0; i < 200; i++) {
                      const x = Math.random() * 1024;
                      const y = Math.random() * 1024;
                      const size = Math.random() * 8 + 4;
                      ctx.fillStyle = `hsl(${30 + Math.random() * 20}, 40%, ${20 + Math.random() * 15}%)`;
                      ctx.beginPath();
                      ctx.arc(x, y, size, 0, Math.PI * 2);
                      ctx.fill();
                    }
                    
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(8, 8);
                    return texture;
                  })()} 
                />
              </mesh>
            </RigidBody>

            {/* Balanced City Environment */}
            <Streets />
            <CityBuildings count={25} />
            <Vehicles count={15} />
            <CityTrees count={50} />
            <StreetProps count={40} />
            
            {/* Additional GTA 5 Environmental Details */}
            <group>
              {/* Traffic Lights */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 25;
                return (
                  <mesh key={`traffic-${i}`} position={[Math.cos(angle) * radius, 4, Math.sin(angle) * radius]}>
                    <boxGeometry args={[0.3, 2, 0.3]} />
                    <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
                    <pointLight position={[0, 0, 0]} intensity={2} distance={10} color="#e74c3c" />
                  </mesh>
                );
              })}
              
              {/* Street Lamps */}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 35;
                return (
                  <group key={`lamp-${i}`} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                    <mesh position={[0, 4, 0]}>
                      <cylinderGeometry args={[0.1, 0.1, 8]} />
                      <meshStandardMaterial color="#34495e" metalness={0.7} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 8, 0]}>
                      <sphereGeometry args={[0.5]} />
                      <meshStandardMaterial 
                        color="#f39c12" 
                        emissive="#f39c12" 
                        emissiveIntensity={0.3}
                        metalness={0.1} 
                        roughness={0.1} 
                      />
                    </mesh>
                    <pointLight position={[0, 8, 0]} intensity={3} distance={20} color="#f39c12" />
                  </group>
                );
              })}
            </group>

            {pickups.map(p => (
              <WeaponPickup key={p.id} weapon={p.weapon} position={p.position} onPickup={() => pickupWeapon(p.id)} />
            ))}

            <group>
              {/* Enhanced Character Models with GTA 5 Style */}
              <CharacterModel
                id={authUser._id}
                position={[players[authUser._id].position.x, players[authUser._id].position.y, players[authUser._id].position.z]}
                color={players[authUser._id].color}
                isLocal={true}
                health={players[authUser._id].health}
                isMoving={players[authUser._id].isMoving}
                isShooting={players[authUser._id].isShooting}
                team="blue"
                onRef={(r) => {
                  localRef.current = r?.current || r;
                }}
              />
              <CharacterModel
                id={opponent._id}
                position={[players[opponent._id].position.x, players[opponent._id].position.y, players[opponent._id].position.z]}
                color={players[opponent._id].color}
                isLocal={false}
                health={players[opponent._id].health}
                isMoving={players[opponent._id].isMoving}
                isShooting={players[opponent._id].isShooting}
                team="red"
                onRef={(r) => {
                  enemyRef.current = r?.current || r;
                }}
              />
              
              {/* Player Shadows for Realism */}
              <mesh position={[players[authUser._id].position.x, 0.01, players[authUser._id].position.z]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[1]} />
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
              </mesh>
              <mesh position={[players[opponent._id].position.x, 0.01, players[opponent._id].position.z]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[1]} />
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
              </mesh>
            </group>

            {/* Enhanced Bullet Tracers with GTA 5 Style */}
            {bulletsRef.current.map(b => (
              <group key={b.id}>
                <BulletTracer start={b.start} end={b.end} onComplete={() => removeBullet(b.id)} />
                {/* Bullet impact sparks */}
                <mesh position={b.end}>
                  <sphereGeometry args={[0.1]} />
                  <meshBasicMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={2} />
                </mesh>
              </group>
            ))}

            {explosionsRef.current.map(ex => (
              <Explosion key={ex.id} position={ex.position} onComplete={() => removeExplosion(ex.id)} />
            ))}

            {/* Enhanced Muzzle Flashes with Light */}
            {muzzleFlashes.map(flash => (
              <group key={flash.id}>
                <MuzzleFlash
                  position={flash.position}
                  visible={true}
                  onComplete={() => setMuzzleFlashes(prev => prev.filter(f => f.id !== flash.id))}
                />
                <pointLight 
                  position={flash.position} 
                  intensity={5} 
                  distance={10} 
                  color="#ff6b35"
                  decay={2}
                />
              </group>
            ))}

            {/* Enhanced Hit Markers with Blood Effects */}
            {hitMarkers.map(marker => (
              <group key={marker.id}>
                <HitMarker
                  position={marker.position}
                  damage={marker.damage}
                  onComplete={() => setHitMarkers(prev => prev.filter(m => m.id !== marker.id))}
                />
                {/* Blood splatter effect */}
                <mesh position={marker.position}>
                  <sphereGeometry args={[0.2]} />
                  <meshBasicMaterial color="#8b0000" transparent opacity={0.7} />
                </mesh>
              </group>
            ))}

            {/* Kill Feed */}
            {killFeed.length > 0 && (
              <KillFeed kills={killFeed} position={[0, 10, 0]} />
            )}

          </Physics>

          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={40} />
          <PerspectiveCamera makeDefault position={[0, 6, 14]} ref={cameraRef} />
          

        </Suspense>
      </Canvas>
    </div>
  );
}