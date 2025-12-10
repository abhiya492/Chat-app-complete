import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, OrbitControls, Html, useGLTF, useTexture, PositionalAudio, useProgress, PerspectiveCamera } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import toast, { Toaster } from "react-hot-toast";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";

function useKeyboard() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

function LoadingScreen() {
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

function InstancedTrees({ count = 200, radius = 80 }) {
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

function WeaponPickup({ weapon, position, onPickup }) {
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

function BulletTracer({ start, end, onComplete }) {
  const ref = useRef();
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(endVec, startVec);
  const len = dir.length();
  
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

function Explosion({ position, onComplete }) {
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

function CharacterModel({ id, position = [0, 0, 0], color = "#ff69b4", isLocal = false, health = 100, isMoving = false, isShooting = false, onRef }) {
  const ref = useRef();
  useEffect(() => {
    if (onRef) onRef(ref);
  }, [onRef]);
  
  useFrame((state) => {
    if (!ref.current) return;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
    ref.current.scale.setScalar(breathe);
    ref.current.position.y = position[1] + (isMoving ? Math.sin(state.clock.elapsedTime * 8) * 0.12 : 0);
    if (isMoving) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.08;
  });

  return (
    <group ref={ref} position={position} castShadow>
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" roughness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.08, 0.8, 0.12]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>

      <Html position={[0, 2.1, 0]} center>
        <div style={{ minWidth: 120 }} className="bg-black/80 rounded-full p-2 text-white text-xs font-bold">
          <div className="flex items-center gap-2">
            <div style={{ width: 64 }} className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div style={{ width: `${health}%` }} className="h-full bg-gradient-to-r from-red-500 to-green-400 transition-all" />
            </div>
            <div>{Math.round(health)}</div>
          </div>
        </div>
      </Html>

      {isLocal && <pointLight intensity={0.4} distance={6} color="#00ffd6" position={[0, 1.2, 0]} />}
    </group>
  );
}

export default function FreeFireBattleRoyaleEnhanced({ 
  authUser = { _id: "player1", name: "You" }, 
  opponent = { _id: "player2", name: "Enemy" }, 
  onGameEnd = () => {} 
}) {
  const keys = useKeyboard();
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
      weapon: { id: "ak47", name: "AK-47", damage: 40, range: 120, fireRate: 250, ammo: 30, maxAmmo: 30, color: "#ff6b35" }
    },
    [opponent._id]: {
      id: opponent._id,
      name: opponent.name,
      position: new THREE.Vector3(8, 0, 0),
      health: 100,
      isMoving: false,
      isShooting: false,
      color: "#f06292",
      weapon: { id: "m4a1", name: "M4A1", damage: 35, range: 110, fireRate: 200, ammo: 30, maxAmmo: 30, color: "#9b59b6" }
    }
  });

  const [pickups, setPickups] = useState(() => [
    { id: "p1", weapon: { id: "awm", name: "AWM", damage: 120, range: 200, fireRate: 1500, ammo: 5, maxAmmo: 5, color: "#ffd54f" }, position: [Math.random() * 30 - 15, 0.6, Math.random() * 30 - 15] },
    { id: "p2", weapon: { id: "shotgun", name: "M1887", damage: 80, range: 20, fireRate: 800, ammo: 2, maxAmmo: 2, color: "#e74c3c" }, position: [Math.random() * 30 - 15, 0.6, Math.random() * 30 - 15] },
  ]);

  const bulletsRef = useRef([]);
  const explosionsRef = useRef([]);
  const [tick, setTick] = useState(0);

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

  useFrame((state, delta) => {
    const local = players[authUser._id];
    if (!local) return;

    const speed = 8;
    const dir = new THREE.Vector3();
    const forward = keys.current["w"] || keys.current["arrowup"];
    const back = keys.current["s"] || keys.current["arrowdown"];
    const left = keys.current["a"] || keys.current["arrowleft"];
    const right = keys.current["d"] || keys.current["arrowright"];
    const shift = keys.current["shift"];
    const runMult = shift ? 1.5 : 1;

    if (forward) dir.z -= 1;
    if (back) dir.z += 1;
    if (left) dir.x -= 1;
    if (right) dir.x += 1;

    if (dir.lengthSq() > 0) {
      dir.normalize();
      const cam = state.camera;
      const camDir = new THREE.Vector3();
      cam.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();
      const camRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), camDir).normalize();
      const moveVec = new THREE.Vector3();
      moveVec.addScaledVector(camDir, -dir.z);
      moveVec.addScaledVector(camRight, dir.x);
      moveVec.normalize().multiplyScalar(speed * runMult * delta);
      const newPos = players[authUser._id].position.clone().add(moveVec);
      players[authUser._id].position.copy(newPos);
      if (localRef.current) localRef.current.position.copy(newPos);
      setPlayers((prev) => ({ ...prev, [authUser._id]: { ...prev[authUser._id], isMoving: true } }));
    } else {
      if (players[authUser._id].isMoving) {
        setPlayers((prev) => ({ ...prev, [authUser._id]: { ...prev[authUser._id], isMoving: false } }));
      }
    }

    const enemy = players[opponent._id];
    if (enemy) {
      const toLocal = new THREE.Vector3().subVectors(players[authUser._id].position, enemy.position);
      const dist = toLocal.length();
      if (dist > 6) {
        toLocal.normalize().multiplyScalar(3 * delta);
        enemy.position.add(toLocal);
        if (enemyRef.current) enemyRef.current.position.copy(enemy.position);
        setPlayers((prev) => ({ ...prev, [opponent._id]: { ...prev[opponent._id], isMoving: true } }));
      } else {
        setPlayers((prev) => ({ ...prev, [opponent._id]: { ...prev[opponent._id], isMoving: false } }));
      }
    }

    if (localRef.current) {
      const p = localRef.current.position.clone();
      const camTarget = new THREE.Vector3(p.x, p.y + 1.8, p.z);
      const camPos = camTarget.clone().add(new THREE.Vector3(0, 5, 9));
      state.camera.position.lerp(camPos, 0.12);
      state.camera.lookAt(camTarget);
    }

    if (bulletsRef.current.length > 0) {
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.travel += delta * b.speed;
        if (b.travel >= 1) {
          const target = b.targetId && players[b.targetId] ? players[b.targetId] : null;
          if (target) {
            const dmg = b.damage;
            const newHealth = Math.max(0, target.health - dmg);
            setPlayers((prev) => ({ ...prev, [target.id]: { ...prev[target.id], health: newHealth } }));
            if (newHealth <= 0) {
              setPhase("ended");
              setWinner(b.shooterId);
              toast.success(`${players[b.shooterId].name} eliminated ${target.name}!`);
              onGameEnd(b.shooterId);
            } else {
              hitAudio?.play();
              toast(`${target.name} -${Math.round(dmg)}`, { icon: "💥" });
            }
          }
          explosionsRef.current.push({ id: Date.now() + Math.random(), position: b.end });
          bulletsRef.current.splice(i, 1);
        } else {
          const cur = new THREE.Vector3().lerpVectors(new THREE.Vector3(...b.start), new THREE.Vector3(...b.end), b.travel);
          b.currentPos.set(cur.x, cur.y, cur.z);
        }
      }
      setTick((t) => t + 1);
    }

    if (explosionsRef.current.length > 0) {
      setTick((t) => t + 1);
    }
  });

  const shoot = (shooterId = authUser._id) => {
    const shooter = players[shooterId];
    if (!shooter) return;
    const weapon = shooter.weapon;
    if (!weapon) return;
    if (weapon.ammo <= 0) {
      toast.error("Reload required!");
      return;
    }
    
    shootAudio?.currentTime && (shootAudio.currentTime = 0);
    shootAudio?.play();

    setPlayers((prev) => ({
      ...prev,
      [shooterId]: {
        ...prev[shooterId],
        weapon: { ...weapon, ammo: weapon.ammo - 1 },
        isShooting: true
      }
    }));

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
    if (!p || !p.weapon) return;
    const w = p.weapon;
    toast.promise(
      new Promise((res) => setTimeout(res, 900)),
      {
        loading: "Reloading...",
        success: "Reloaded!",
        error: "Failed to reload"
      }
    );
    setTimeout(() => {
      setPlayers(prev => ({ ...prev, [playerId]: { ...prev[playerId], weapon: { ...w, ammo: w.maxAmmo } } }));
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

  function Minimap({ size = 150 }) {
    const canvasRef = useRef();
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const draw = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "#0b1221";
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = "#14233a";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo((size / 4) * i, 0);
          ctx.lineTo((size / 4) * i, size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, (size / 4) * i);
          ctx.lineTo(size, (size / 4) * i);
          ctx.stroke();
        }
        const center = players[authUser._id].position;
        const scale = 2.5;
        Object.values(players).forEach(p => {
          const dx = (p.position.x - center.x) * scale + size / 2;
          const dz = (p.position.z - center.z) * scale + size / 2;
          ctx.beginPath();
          ctx.fillStyle = p.id === authUser._id ? "#00ffcc" : "#ff6b35";
          ctx.arc(dx, dz, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      };
      const id = setInterval(draw, 100);
      return () => clearInterval(id);
    }, [players]);
    return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 8, background: "rgba(0,0,0,0.45)" }} />;
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <Toaster position="top-right" />
      
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-gradient-to-r from-blue-700/80 to-cyan-700/80 p-3 rounded-lg text-white font-bold shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <div className="text-sm">{players[authUser._id].name}</div>
              <div className="text-xs">Health: <strong>{Math.round(players[authUser._id].health)}</strong></div>
              <div className="text-xs">Weapon: <strong>{players[authUser._id].weapon?.name}</strong> ({players[authUser._id].weapon?.ammo}/{players[authUser._id].weapon?.maxAmmo})</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="bg-black/60 p-3 rounded-lg text-white shadow-lg">
          <div className="mb-2 text-sm font-bold">Minimap</div>
          <Minimap />
        </div>
      </div>

      <div className="absolute bottom-6 left-4 z-50">
        <div className="bg-black/70 p-3 rounded-lg text-white text-sm font-medium shadow-lg">
          <div>Controls: WASD to move • Click / Space to shoot • R to reload</div>
        </div>
      </div>

      <div className="absolute top-16 left-4 z-50">
        {pickups.map(p => (
          <div key={p.id} className="mb-2">
            <button onClick={() => pickupWeapon(p.id)} className="bg-yellow-500/90 px-3 py-1 rounded-md text-black font-bold">
              Pickup {p.weapon.name}
            </button>
          </div>
        ))}
      </div>

      {phase === "ended" && winner && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/80">
          <div className="text-center text-white p-8 rounded-xl">
            <h1 className="text-4xl font-extrabold mb-4">{winner === authUser._id ? "Victory!" : "Defeat"}</h1>
            <p className="mb-6">Winner: <strong>{players[winner]?.name}</strong></p>
            <button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold"
              onClick={() => {
                setPlayers({
                  [authUser._id]: { ...players[authUser._id], health: 100, position: new THREE.Vector3(-8, 0, 0) },
                  [opponent._id]: { ...players[opponent._id], health: 100, position: new THREE.Vector3(8, 0, 0) }
                });
                bulletsRef.current = [];
                explosionsRef.current = [];
                setPhase("playing");
                setWinner(null);
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 6, 14], fov: 60 }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Physics gravity={[0, -9.81, 0]}>
            <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={3} inclination={0.55} />
            <directionalLight castShadow position={[30, 40, 10]} intensity={1.1} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <ambientLight intensity={0.3} />

            <RigidBody type="fixed">
              <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[400, 400]} />
                <meshStandardMaterial color="#2d5a2d" roughness={1} />
              </mesh>
            </RigidBody>

            <InstancedTrees count={200} radius={90} />

            {pickups.map(p => (
              <WeaponPickup key={p.id} weapon={p.weapon} position={p.position} onPickup={() => pickupWeapon(p.id)} />
            ))}

            <group>
              <CharacterModel
                id={authUser._id}
                position={[players[authUser._id].position.x, players[authUser._id].position.y, players[authUser._id].position.z]}
                color={players[authUser._id].color}
                isLocal={true}
                health={players[authUser._id].health}
                isMoving={players[authUser._id].isMoving}
                isShooting={players[authUser._id].isShooting}
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
                onRef={(r) => {
                  enemyRef.current = r?.current || r;
                }}
              />
            </group>

            {bulletsRef.current.map(b => (
              <BulletTracer key={b.id} start={b.start} end={b.end} onComplete={() => removeBullet(b.id)} />
            ))}

            {explosionsRef.current.map(ex => (
              <Explosion key={ex.id} position={ex.position} onComplete={() => removeExplosion(ex.id)} />
            ))}

          </Physics>

          <EffectComposer multisampling={4}>
            <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
            <DepthOfField focusDistance={0.02} focalLength={0.02} bokehScale={2} />
          </EffectComposer>

          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={40} />
          <PerspectiveCamera makeDefault position={[0, 6, 14]} ref={cameraRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}